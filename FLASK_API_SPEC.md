# Flask Service API Specification

## Endpoint: POST /api/parse

### Description
Parses uploaded Excel/CSV files and returns structured data for dashboard widgets.

### Request
- **Method:** POST
- **Content-Type:** multipart/form-data
- **Body Parameter:** `file` (MultipartFile)

### Response
- **Content-Type:** application/json
- **Status:** 200 OK

### Response Schema
```json
{
  "title": "string",
  "widgets": [
    {
      "type": "string (TABLE | GRAPH | KPI)",
      "title": "string",
      "gridPosition": {
        "x": "integer",
        "y": "integer",
        "cols": "integer",
        "rows": "integer"
      },
      "settings": {
        "theme": "string",
        "color": "string",
        "refresh": "integer"
      },
      "payload": {
        "headers": ["string"],
        "rows": [["string", "number"]],
        "any_other_data": "varies by widget type"
      }
    }
  ]
}
```

### Example Response
```json
{
  "title": "Импорт из файла",
  "widgets": [
    {
      "type": "TABLE",
      "title": "Сводка данных",
      "gridPosition": {"x": 0, "y": 0, "cols": 4, "rows": 3},
      "settings": {"theme": "dark"},
      "payload": {
        "headers": ["Дата", "Значение"],
        "rows": [
          ["2026-06-01", 120],
          ["2026-06-02", 150]
        ]
      }
    },
    {
      "type": "GRAPH",
      "title": "Динамика значений",
      "gridPosition": {"x": 4, "y": 0, "cols": 4, "rows": 3},
      "settings": {"color": "blue", "refresh": 60},
      "payload": {
        "labels": ["2026-06-01", "2026-06-02"],
        "datasets": [
          {
            "label": "Значение",
            "data": [120, 150]
          }
        ]
      }
    }
  ]
}
```

### Error Response
```json
{
  "error": "Error message"
}
```
Status: 400 Bad Request or 500 Internal Server Error
