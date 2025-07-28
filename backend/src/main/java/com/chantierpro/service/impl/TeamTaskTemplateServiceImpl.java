package com.chantierpro.service.impl;

import com.chantierpro.entity.TaskTemplate;
import com.chantierpro.entity.TeamTaskTemplate;
import com.chantierpro.repository.TaskTemplateRepository;
import com.chantierpro.repository.TeamTaskTemplateRepository;
import com.chantierpro.service.TeamTaskTemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of the TeamTaskTemplateService interface.
 */
@Service
@Transactional
public class TeamTaskTemplateServiceImpl implements TeamTaskTemplateService {

    @Autowired
    private TeamTaskTemplateRepository teamTaskTemplateRepository;
    
    @Autowired
    private TaskTemplateRepository taskTemplateRepository;
    
    @Override
    public TeamTaskTemplate assignTaskTemplateToTeam(TeamTaskTemplate teamTaskTemplate) {
        // Check if the association already exists
        if (isTaskTemplateAssignedToTeam(
                teamTaskTemplate.getTeam().getId(), 
                teamTaskTemplate.getTaskTemplate().getId())) {
            return teamTaskTemplateRepository.findByTeamIdAndTaskTemplateId(
                    teamTaskTemplate.getTeam().getId(), 
                    teamTaskTemplate.getTaskTemplate().getId());
        }
        
        // Save the new association
        return teamTaskTemplateRepository.save(teamTaskTemplate);
    }
    
    @Override
    public void removeTaskTemplateFromTeam(Long teamId, Long templateId) {
        TeamTaskTemplate teamTaskTemplate = teamTaskTemplateRepository.findByTeamIdAndTaskTemplateId(teamId, templateId);
        if (teamTaskTemplate != null) {
            teamTaskTemplateRepository.delete(teamTaskTemplate);
        }
    }
    
    @Override
    public boolean isTaskTemplateAssignedToTeam(Long teamId, Long templateId) {
        return teamTaskTemplateRepository.findByTeamIdAndTaskTemplateId(teamId, templateId) != null;
    }
    
    @Override
    public List<TaskTemplate> getTaskTemplatesByTeamId(Long teamId) {
        List<TeamTaskTemplate> teamTaskTemplates = teamTaskTemplateRepository.findByTeamId(teamId);
        return teamTaskTemplates.stream()
                .map(TeamTaskTemplate::getTaskTemplate)
                .collect(Collectors.toList());
    }
}
