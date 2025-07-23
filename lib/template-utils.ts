import { Template, Task, Category, Team } from './types';
import { useStore } from './store';

/**
 * Creates tasks from a template with proper duration and team association
 * @param template The template to create tasks from
 * @param categoryId The category ID to associate tasks with
 * @param teamId The team ID to associate tasks with (optional, will use template team if not provided)
 * @returns Array of tasks created from the template
 */
export function createTasksFromTemplate(
  template: Template,
  categoryId: string,
  villaId: string,
  teamId?: string
): Task[] {
  const tasks: Task[] = [];
  
  // Find all tasks in the template that match the team ID if provided
  template.categories.forEach(category => {
    category.teams.forEach(teamTemplate => {
      // If teamId is provided, only use tasks from that team
      // Otherwise, use all tasks from the template
      if (!teamId || teamTemplate.name === teamId) {
        teamTemplate.tasks.forEach(taskTemplate => {
          // Calculate start and end dates based on duration
          const today = new Date();
          const startDate = new Date(today);
          
          // Default to 7 days if duration is not specified
          const durationDays = taskTemplate.duration ? parseInt(taskTemplate.duration) : 7;
          
          // Calculate end date by adding duration to start date
          const endDate = new Date(today);
          endDate.setDate(endDate.getDate() + durationDays);
          
          // Create a new task with proper fields
          const task: Task = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            categoryId,
            villaId,
            name: taskTemplate.name,
            description: '',
            teamId: teamId || '', // Use provided teamId or leave empty
            startDate: startDate,
            endDate: endDate,
            plannedStartDate: startDate,
            plannedEndDate: endDate,
            status: 'pending',
            progress: 0,
            progressStatus: 'on_schedule',
            isReceived: false,
            isPaid: false,
            photos: [],
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          tasks.push(task);
        });
      }
    });
  });
  
  return tasks;
}

/**
 * Applies a template to create tasks for a category with proper team association
 * @param templateId The template ID to apply
 * @param categoryId The category ID to associate tasks with
 * @param teamId The team ID to associate tasks with (optional)
 */
export function applyTemplateToCategory(
  templateId: string,
  categoryId: string,
  villaId: string,
  teamId?: string
): void {
  const { templates, addTask } = useStore.getState();
  
  // Find the template
  const template = templates.find(t => t.id === templateId);
  if (!template) return;
  
  // Create tasks from the template
  const tasks = createTasksFromTemplate(template, categoryId, villaId, teamId);
  
  // Add all tasks to the store
  tasks.forEach(task => {
    addTask(task);
  });
}

/**
 * Filters tasks by team ID
 * @param tasks Array of tasks to filter
 * @param teamId Team ID to filter by
 * @returns Filtered tasks
 */
export function filterTasksByTeam(tasks: Task[], teamId: string): Task[] {
  if (!teamId) return tasks;
  return tasks.filter(task => task.teamId === teamId);
}
