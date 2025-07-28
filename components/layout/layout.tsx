'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { Navbar } from './navbar';
import { Sidebar } from './sidebar';
import { cn } from '@/lib/utils';
import { apiService } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { LoadingOverlay } from '@/components/ui/loading-spinner';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { 
    sidebarOpen, 
    projects, 
    selectedProject,
    setSelectedProject,
    setLoading,
    addProject,
    addVilla,
    addCategory,
    addTeam,
    addTask,
    addTemplate,

  } = useStore();

  const { toast } = useToast();

  // Initialize with real data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch projects
        const fetchedProjects = await apiService.getProjects();
        console.log('Fetched projects:', fetchedProjects);
        
        // Add projects to the store
        fetchedProjects.forEach(project => {
          try {
            addProject({
              ...project,
              id: project.id.toString(), // Ensure ID is string for frontend
              startDate: new Date(project.startDate)
            });
          } catch (projectError) {
            console.error('Error processing project:', project, projectError);
          }
        });
        
        // Set default selected project
        if (fetchedProjects.length > 0 && !selectedProject) {
          const defaultProject = fetchedProjects[0];
          setSelectedProject({
            ...defaultProject,
            id: defaultProject.id.toString(), // Ensure ID is string
            startDate: new Date(defaultProject.startDate)
          });
          
          toast({
            title: 'Projet sélectionné',
            description: `${defaultProject.name} a été sélectionné par défaut.`,
          });
        }
        
        // Fetch villas for the selected project
        try {
          if (fetchedProjects.length > 0) {
            const defaultProjectId = fetchedProjects[0].id.toString();
            console.log('Fetching villas for project:', defaultProjectId);
            
            // Explicitly fetch villas for the default project
            const fetchedVillas = await apiService.getVillas(defaultProjectId);
            console.log('Fetched villas from API:', fetchedVillas);
            
            if (Array.isArray(fetchedVillas)) {
              console.log(`Found ${fetchedVillas.length} villas for project ${defaultProjectId}`);
              
              // Clear existing villas to avoid duplicates
              // This is important if we're reloading data
              const villas = useStore.getState().villas;
              console.log(`Clearing ${villas.length} existing villas before adding new ones`);
              
              // Clear existing villas for this project
              villas.forEach((villa: any) => {
                if (villa.projectId === defaultProjectId) {
                  useStore.getState().deleteVilla(villa.id);
                }
              });
              
              // Add each villa to the store with proper project association
              fetchedVillas.forEach((villa: any) => {
                try {
                  // Ensure critical fields are correct
                  const villaWithDates = {
                    ...villa,
                    id: villa.id.toString(),
                    // Explicitly set the projectId to match the current project
                    projectId: defaultProjectId,
                    lastModified: villa.lastModified instanceof Date ? 
                      villa.lastModified : new Date(villa.lastModified)
                  };
                  
                  console.log(`Adding villa ${villaWithDates.id} (${villaWithDates.name}) with projectId: ${villaWithDates.projectId}`);
                  addVilla(villaWithDates);
                } catch (villaError) {
                  console.error('Error processing villa:', villa, villaError);
                }
              });
              
              // Verify villas were added correctly
              const updatedVillas = useStore.getState().villas;
              const projectVillas = useStore.getState().getVillasByProject(defaultProjectId);
              console.log(`Store now has ${updatedVillas.length} villas`);
              console.log(`Villas for project ${defaultProjectId}: ${projectVillas.length}`);
            } else {
              console.error('Fetched villas is not an array:', fetchedVillas);
            }
          }
        }
        catch (villasError) {
          console.error('Failed to fetch villas:', villasError);
          toast({
            title: 'Erreur de chargement des villas',
            description: 'Impossible de charger les villas. Veuillez réessayer.',
            variant: 'destructive',
          });
        }
        
        // Fetch categories for all villas
        try {
          console.log('Fetching all categories');
          const fetchedCategories = await apiService.getCategories();
          console.log('Fetched categories from API:', fetchedCategories);
          
          if (Array.isArray(fetchedCategories)) {
            console.log(`Found ${fetchedCategories.length} categories`);
            
            // Clear existing categories to avoid duplicates
            const categories = useStore.getState().categories;
            console.log(`Clearing ${categories.length} existing categories before adding new ones`);
            
            // Clear all existing categories
            categories.forEach((category: any) => {
              useStore.getState().deleteCategory(category.id);
            });
            
            // Add each category to the store with proper villaId mapping
            fetchedCategories.forEach((category: any) => {
              try {
                // Ensure critical fields are correct
                const categoryWithDates = {
                  ...category,
                  id: category.id.toString(),
                  villaId: category.villaId ? category.villaId.toString() : 
                          (category.villa && category.villa.id ? category.villa.id.toString() : null),
                  startDate: category.startDate instanceof Date ? 
                    category.startDate : new Date(category.startDate),
                  endDate: category.endDate instanceof Date ? 
                    category.endDate : new Date(category.endDate)
                };
                
                console.log(`Adding category ${categoryWithDates.id} (${categoryWithDates.name}) with villaId: ${categoryWithDates.villaId}`);
                addCategory(categoryWithDates);
              } catch (categoryError) {
                console.error('Error processing category:', category, categoryError);
              }
            });
            
            // Verify categories were added correctly
            const updatedCategories = useStore.getState().categories;
            console.log(`Store now has ${updatedCategories.length} categories`);
          } else {
            console.error('Fetched categories is not an array:', fetchedCategories);
          }
        } catch (categoriesError) {
          console.error('Failed to fetch categories:', categoriesError);
          toast({
            title: 'Erreur de chargement des catégories',
            description: 'Impossible de charger les catégories. Veuillez réessayer.',
            variant: 'destructive',
          });
        }
        
        // Fetch teams
        try {
          console.log('Fetching teams');
          const fetchedTeams = await apiService.getTeams();
          console.log('Fetched teams from API:', fetchedTeams);
          
          if (Array.isArray(fetchedTeams)) {
            console.log(`Found ${fetchedTeams.length} teams`);
            
            // Clear existing teams to avoid duplicates
            const teams = useStore.getState().teams;
            console.log(`Clearing ${teams.length} existing teams before adding new ones`);
            
            // Clear all existing teams
            teams.forEach((team: any) => {
              useStore.getState().deleteTeam(team.id);
            });
            
            // Add each team to the store
            fetchedTeams.forEach((team: any) => {
              try {
                // Ensure critical fields are correct
                const teamWithDates = {
                  ...team,
                  id: team.id.toString(),
                  lastActivity: team.lastActivity instanceof Date ? 
                    team.lastActivity : new Date(team.lastActivity)
                };
                
                console.log(`Adding team ${teamWithDates.id} (${teamWithDates.name})`);
                addTeam(teamWithDates);
              } catch (teamError) {
                console.error('Error processing team:', team, teamError);
              }
            });
            
            // Verify teams were added correctly
            const updatedTeams = useStore.getState().teams;
            console.log(`Store now has ${updatedTeams.length} teams`);
          } else {
            console.error('Fetched teams is not an array:', fetchedTeams);
          }
        } catch (teamsError) {
          console.error('Failed to fetch teams:', teamsError);
          toast({
            title: 'Erreur de chargement des équipes',
            description: 'Impossible de charger les équipes. Veuillez réessayer.',
            variant: 'destructive',
          });
        }
        
      } catch (error) {
        console.error('Failed to fetch data from API:', error);
        toast({
          title: 'Erreur de chargement',
          description: 'Impossible de charger les données du serveur.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we don't have projects yet
    fetchData();
  }, [projects.length, selectedProject, setSelectedProject, setLoading, addProject, addVilla, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <LoadingOverlay />
      <Sidebar />
      <Navbar />
      
      <main 
        className={cn(
          'pt-16 transition-all duration-300 min-h-screen',
          sidebarOpen ? 'lg:ml-72' : 'lg:ml-20'
        )}
      >
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}