-- Insert sample data for development/testing

-- Insert sample projects
INSERT INTO projects (name, type, location, start_date, end_date, status, progress, villas_count, alerts_count, created_at, updated_at) VALUES
('Résidence Les Oliviers', 'Résidentiel', 'Casablanca', '2024-01-15', '2024-12-31', 'ACTIVE', 65, 12, 3, NOW(), NOW()),
('Complexe Al Manar', 'Commercial', 'Rabat', '2024-03-01', '2025-06-30', 'ACTIVE', 35, 8, 1, NOW(), NOW());

-- Insert sample teams
INSERT INTO teams (name, specialty, members_count, active_tasks, performance, last_activity, created_at, updated_at) VALUES
('Équipe Maçonnerie', 'Gros Œuvre', 6, 2, 85, NOW(), NOW(), NOW()),
('Équipe Plomberie', 'Plomberie', 3, 4, 78, NOW(), NOW(), NOW()),
('Équipe Électricité', 'Électricité', 4, 3, 92, NOW(), NOW(), NOW());

-- Insert sample users
INSERT INTO users (name, email, role, created_at, updated_at) VALUES
('Ahmed Benali', 'ahmed.benali@example.com', 'ADMIN', NOW(), NOW()),
('Fatima Zahra', 'fatima.zahra@example.com', 'TEAM_LEADER', NOW(), NOW()),
('Mohamed Alami', 'mohamed.alami@example.com', 'WORKER', NOW(), NOW()),
('Khadija Bennani', 'khadija.bennani@example.com', 'TEAM_LEADER', NOW(), NOW()),
('Youssef Tazi', 'youssef.tazi@example.com', 'WORKER', NOW(), NOW()),
('Aicha Idrissi', 'aicha.idrissi@example.com', 'WORKER', NOW(), NOW());

-- Insert sample villas
INSERT INTO villas (project_id, name, type, surface, progress, status, categories_count, tasks_count, last_modified, created_at) VALUES
(1, 'Villa A1', 'Villa Type A', 250, 75, 'IN_PROGRESS', 8, 32, NOW(), NOW()),
(1, 'Villa A2', 'Villa Type A', 250, 45, 'DELAYED', 8, 32, NOW(), NOW()),
(1, 'Villa B1', 'Villa Type B', 180, 90, 'IN_PROGRESS', 6, 24, NOW(), NOW()),
(2, 'Bureau 1', 'Bureau Standard', 120, 20, 'IN_PROGRESS', 4, 16, NOW(), NOW());

-- Insert sample categories
INSERT INTO categories (villa_id, name, start_date, end_date, progress, status, team_id, tasks_count, completed_tasks, created_at, updated_at) VALUES
(1, 'Gros Œuvre', '2024-01-15', '2024-03-15', 100, 'ON_SCHEDULE', 1, 6, 6, NOW(), NOW()),
(1, 'Plomberie', '2024-03-01', '2024-04-30', 60, 'IN_PROGRESS', 2, 4, 2, NOW(), NOW()),
(1, 'Électricité', '2024-03-15', '2024-05-15', 40, 'WARNING', 3, 5, 2, NOW(), NOW()),
(2, 'Gros Œuvre', '2024-01-20', '2024-03-20', 80, 'IN_PROGRESS', 1, 5, 4, NOW(), NOW()),
(3, 'Finitions', '2024-04-01', '2024-05-30', 95, 'ON_SCHEDULE', NULL, 3, 3, NOW(), NOW());

-- Insert sample tasks
INSERT INTO tasks (category_id, villa_id, name, description, team_id, start_date, end_date, planned_start_date, planned_end_date, status, progress, progress_status, is_received, is_paid, amount, remarks, created_at, updated_at) VALUES
(2, 1, 'Installation conduits principal', 'Installation des conduits principaux d''évacuation', 2, '2024-03-01', '2024-03-15', '2024-03-01', '2024-03-15', 'COMPLETED', 100, 'ON_SCHEDULE', true, true, 15000.00, 'Travail conforme aux normes', NOW(), NOW()),
(2, 1, 'Raccordement sanitaires', 'Raccordement des équipements sanitaires', 2, '2024-03-16', '2024-03-30', '2024-03-16', '2024-03-30', 'IN_PROGRESS', 70, 'ON_SCHEDULE', false, false, 8000.00, NULL, NOW(), NOW()),
(3, 1, 'Câblage électrique', 'Installation du câblage électrique principal', 3, '2024-03-20', '2024-04-10', '2024-03-15', '2024-04-05', 'DELAYED', 30, 'BEHIND', false, false, 12000.00, 'Retard dû aux conditions météo', NOW(), NOW());

-- Insert sample notifications
INSERT INTO notifications (type, title, message, priority, is_read, created_at, project_id, villa_id, task_id) VALUES
('DELAY', 'Retard détecté', 'La tâche "Câblage électrique" accuse un retard de 3 jours', 'HIGH', false, NOW(), 1, 1, 3),
('DEADLINE', 'Deadline approche', 'La catégorie "Plomberie" se termine dans 2 jours', 'MEDIUM', false, NOW(), 1, 1, NULL),
('UNRECEIVED', 'Réception en attente', '1 tâche terminée en attente de réception depuis 5 jours', 'MEDIUM', true, NOW(), 1, 1, NULL);