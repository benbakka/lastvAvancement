# ChantierPro Backend

Spring Boot backend application for ChantierPro construction management system.

## Features

- **Project Management**: Create, update, and track construction projects
- **Villa Management**: Manage individual villas within projects
- **Category Management**: Organize work into categories (Gros Œuvre, Plomberie, etc.)
- **Task Management**: Track individual tasks with progress, dates, and payments
- **Team Management**: Manage construction teams and their assignments
- **User Management**: Handle user accounts with role-based access
- **Notifications**: System notifications for delays, deadlines, and alerts
- **RESTful API**: Complete REST API for frontend integration

## Technology Stack

- **Java 17**
- **Spring Boot 3.2.0**
- **Spring Data JPA**
- **MySQL 8.0**
- **Maven**

## Prerequisites

- Java 17 or higher
- MySQL 8.0 or higher
- Maven 3.6 or higher

## Setup Instructions

### 1. Database Setup

Create a MySQL database:

```sql
CREATE DATABASE chantierpro_db;
CREATE USER 'chantierpro'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON chantierpro_db.* TO 'chantierpro'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Configuration

Update `src/main/resources/application.yml` with your database credentials:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/chantierpro_db
    username: your_username
    password: your_password
```

### 3. Build and Run

```bash
# Clone the repository
git clone <repository-url>
cd chantierpro-backend

# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

The application will start on `http://localhost:8080`

### 4. API Documentation

The API will be available at `http://localhost:8080/api`

#### Main Endpoints:

- **Projects**: `/api/projects`
- **Villas**: `/api/villas`
- **Categories**: `/api/categories`
- **Tasks**: `/api/tasks`
- **Teams**: `/api/teams`
- **Users**: `/api/users`
- **Notifications**: `/api/notifications`

#### Example API Calls:

```bash
# Get all projects
GET http://localhost:8080/api/projects

# Create a new project
POST http://localhost:8080/api/projects
Content-Type: application/json

{
  "name": "New Project",
  "type": "Residential",
  "location": "Casablanca",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}

# Get villas for a project
GET http://localhost:8080/api/villas?projectId=1

# Update task progress
PUT http://localhost:8080/api/tasks/1/progress
Content-Type: application/json

{
  "progress": 75
}
```

## Database Schema

The application uses the following main entities:

- **Project**: Main project container
- **Villa**: Individual buildings within a project
- **Category**: Work categories (Gros Œuvre, Plomberie, etc.)
- **Task**: Individual tasks within categories
- **Team**: Construction teams
- **User**: System users with roles
- **Notification**: System notifications

## Development

### Running in Development Mode

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### Running Tests

```bash
mvn test
```

### Building for Production

```bash
mvn clean package -Pprod
```

## Frontend Integration

This backend is designed to work with the Next.js frontend. Update the frontend's `lib/api.ts` file to point to this backend:

```typescript
const API_BASE_URL = 'http://localhost:8080/api';
```

## CORS Configuration

The application is configured to allow requests from `http://localhost:3000` (Next.js frontend). Update the CORS configuration in `CorsConfig.java` if needed.

## Sample Data

The application includes sample data that will be loaded automatically on startup. This includes:

- 2 sample projects
- 4 sample villas
- 5 sample categories
- 3 sample tasks
- 3 sample teams
- 6 sample users
- 3 sample notifications

## API Features

### Automatic Statistics Updates

The system automatically updates statistics when entities are modified:

- Project progress based on villa completion
- Villa progress based on category completion
- Category progress based on task completion
- Team performance based on task completion

### Search and Filtering

Most endpoints support search and filtering:

- Search projects by name or location
- Filter villas by status
- Filter tasks by status, team, or progress
- Search teams by name or specialty

### Validation

All entities include proper validation:

- Required fields validation
- Email format validation
- Positive number validation
- Date range validation

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check MySQL is running
   - Verify database credentials
   - Ensure database exists

2. **Port Already in Use**
   - Change server port in `application.yml`
   - Kill process using port 8080

3. **CORS Issues**
   - Verify frontend URL in CORS configuration
   - Check browser developer tools for CORS errors

### Logs

Application logs are available in the console. Set log level in `application.yml`:

```yaml
logging:
  level:
    com.chantierpro: DEBUG
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.