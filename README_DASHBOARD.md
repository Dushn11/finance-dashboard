# Dashboard Architecture Implementation

## Overview
This implementation provides a flexible dashboard system with PostgreSQL backend, Spring Boot REST API, and Flask integration for file parsing. The system supports dynamic widget placement using Gridster2 on the frontend.

## Database Schema

### Tables
1. **user_tabs** - User dashboard tabs
2. **data_sources** - Raw widget data stored as JSONB
3. **widgets** - Widget configurations and grid positions

### Key Features
- JSONB columns for flexible data storage
- Cascade delete for widgets when tabs are deleted
- SET NULL for data sources when deleted
- Optimized queries with JOIN FETCH

## Architecture Components

### Entities (JPA)
- `UserTab.java` - Tab entity with OneToMany relationship to widgets
- `Widget.java` - Widget entity with JSONB mapping for grid_position and settings
- `DataSource.java` - Data source entity with JSONB payload field

**JSONB Mapping**: Uses Hibernate 6 `@JdbcTypeCode(SqlTypes.JSON)` annotation for PostgreSQL JSONB support.

### DTOs
- `SaveTabRequest` - Request for saving tab configuration
- `TabResponse` - Response with tab and widget data
- `WidgetDTO` - Widget data transfer object
- `FlaskParseResponse` - Flask service response structure

### Services

#### TabService
Main business logic service with three key methods:

1. **saveTab(SaveTabRequest)** - Updates tab title and widget positions
   - Synchronizes widget list (adds/updates/removes)
   - Transactional operation

2. **importFile(MultipartFile, Long userId)** - Imports file via Flask
   - Sends file to Flask service
   - Creates new tab
   - Saves data sources and widgets
   - Fully transactional

3. **getTabById(Long id)** - Fetches tab with all data
   - Uses optimized JOIN FETCH query
   - Returns complete widget data including raw payload

#### FlaskIntegrationService
Handles communication with Flask microservice:
- Sends MultipartFile to Flask `/api/parse` endpoint
- Receives structured JSON response
- Returns `FlaskParseResponse`

### REST Endpoints

#### 1. POST /api/tabs/save
Saves or updates tab configuration.

**Request:**
```json
{
  "tabId": 1,
  "title": "Мониторинг",
  "widgets": [
    {
      "id": 10,
      "type": "GRAPH",
      "title": "CPU Load",
      "gridPosition": {"x": 0, "y": 0, "cols": 2, "rows": 2},
      "settings": {"color": "blue"},
      "dataSourceId": 5
    }
  ]
}
```

#### 2. POST /api/tabs/import
Imports file and creates new tab with widgets.

**Request:** multipart/form-data
- `file`: MultipartFile (Excel/CSV)
- `userId`: Long

**Response:**
```json
{
  "tabId": 1,
  "title": "Импорт из файла",
  "widgets": [...]
}
```

#### 3. GET /api/tabs/{id}
Retrieves tab with all widgets and their data.

**Response:**
```json
{
  "tabId": 1,
  "title": "Импорт из файла",
  "widgets": [
    {
      "id": 50,
      "type": "TABLE",
      "title": "Сводка данных",
      "gridPosition": {"x": 0, "y": 0, "cols": 4, "rows": 3},
      "settings": {"theme": "dark"},
      "dataSourceId": 101,
      "rawData": {
        "headers": ["Дата", "Значение"],
        "rows": [["2026-06-01", 120]]
      }
    }
  ]
}
```

## Query Optimization

The `UserTabRepository` uses an optimized JPQL query:

```java
@Query("SELECT t FROM UserTab t LEFT JOIN FETCH t.widgets w LEFT JOIN FETCH w.dataSource WHERE t.id = :id")
Optional<UserTab> findByIdWithWidgetsAndDataSources(@Param("id") Long id);
```

This fetches:
- Tab data
- All widgets
- All data sources

**In a single database query**, avoiding N+1 problems.

## Configuration

### application.properties
```properties
spring.jpa.hibernate.ddl-auto=validate
spring.flyway.enabled=true
spring.flyway.baseline-on-migrate=true
python.service.url=http://100.92.130.10
```

### Dependencies Added
- `flyway-core` - Database migrations
- `flyway-database-postgresql` - PostgreSQL support

## Database Migration

Migration file: `src/main/resources/db/migration/V2__create_tabs_and_widgets.sql`

Run migrations automatically on application startup via Flyway.

## Flask Integration

The Flask service must implement: `POST /api/parse`

See `FLASK_API_SPEC.md` for detailed specification.

## Transaction Management

All write operations are `@Transactional`:
- `saveTab()` - Ensures atomic tab/widget updates
- `importFile()` - Guarantees all-or-nothing import (tab + data sources + widgets)

Read operations use `@Transactional(readOnly = true)` for optimization.

## Widget Types
- `GRAPH` - Chart visualizations
- `TABLE` - Tabular data display
- `KPI` - Key performance indicators

## Security Considerations

1. File upload validation (check file type/size in controller if needed)
2. User authorization (verify userId matches authenticated user)
3. SQL injection protection (using JPA with parameter binding)
4. JSONB injection protection (Jackson handles serialization safely)

## Usage Example

### Import a file:
```bash
curl -X POST http://localhost:8080/api/tabs/import \
  -F "file=@data.xlsx" \
  -F "userId=1"
```

### Get tab data:
```bash
curl http://localhost:8080/api/tabs/1
```

### Save tab configuration:
```bash
curl -X POST http://localhost:8080/api/tabs/save \
  -H "Content-Type: application/json" \
  -d '{
    "tabId": 1,
    "title": "Updated Title",
    "widgets": [...]
  }'
```

## Next Steps

1. Implement Flask service at `/api/parse` endpoint
2. Add frontend Gridster2 integration
3. Add user authentication/authorization checks
4. Implement file type validation
5. Add pagination for large widget lists
6. Add widget refresh/update endpoints
