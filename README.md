# GitHub Copilot Metrics API

This API provides endpoints to retrieve GitHub Copilot usage metrics at different organizational levels.

## Setup and Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Create a `.env` file in the root directory using `.env.example` as a template:
```bash
cp .env.example .env
```
Then edit `.env` with your values:
   - GITHUB_TOKEN: Your GitHub personal access token
   - ENTERPRISE: Your enterprise name
   - ORG: Your organization name
   - TEAM_SLUG: Your team slug
   - API_VERSION: GitHub API version (defaults to 2022-11-28)

4. Start the server:
```bash
npm start
```

## API Endpoints

### Enterprise Level Metrics

#### Get Enterprise Metrics
```http
GET /enterprises/{enterprise}/copilot/metrics
```
Returns Copilot usage metrics for the entire enterprise.

#### Get Enterprise Team Metrics
```http
GET /enterprises/{enterprise}/team/{team_slug}/copilot/metrics
```
Returns Copilot metrics for a specific team within the enterprise.

### Organization Level Metrics

#### Get Organization Metrics
```http
GET /orgs/{org}/copilot/metrics
```
Returns Copilot usage metrics for the entire organization.

#### Get Organization Team Metrics
```http
GET /orgs/{org}/team/{team_slug}/copilot/metrics
```
Returns Copilot metrics for a specific team within the organization.

## Response Format

All endpoints return JSON responses with the following structure. Additionally, each request generates and saves a PNG chart image in the `exports` directory.

```json
{
    "raw": {
        // Raw metrics data from GitHub API
    },
    "chartData": {
        "labels": ["01/01/2024", "02/01/2024", ...],
        "datasets": [
            {
                "label": "Sugerencias Aceptadas",
                "data": [100, 150, ...],
                "borderColor": "#36A2EB",
                "fill": false
            },
            {
                "label": "Sugerencias Totales",
                "data": [200, 250, ...],
                "borderColor": "#FF6384",
                "fill": false
            }
        ]
    },
    "summary": {
        "overall": {
            "totalAcceptedSuggestions": 1000,
            "totalSuggestions": 2000,
            "acceptanceRate": "50.00",
            "activeUsers": 50
        },
        "weeklyAverages": {
            "acceptedSuggestions": "145.50",
            "totalSuggestions": "290.75",
            "acceptanceRate": "50.04"
        },
        "trends": {
            "acceptedSuggestions": 5.2,
            "totalSuggestions": 3.8,
            "trend": "Ligero incremento"
        },
        "lastUpdate": "2024-01-15"
    },
    "chart": {
        "success": true,
        "filePath": "exports/copilot-metrics-2024-01-15T12-30-45.png",
        "fileName": "copilot-metrics-2024-01-15T12-30-45.png"
    }
}
```

The `chartData` object is formatted for use with chart libraries like Chart.js. The API automatically generates and saves chart images in PNG format in the `exports` directory.

## Example Responses

### Enterprise Metrics Response
```json
{
    "raw": {
        "total_accepted_suggestions": 15420,
        "total_suggestions": 28750,
        "active_users": 85,
        "daily_metrics": [
            {
                "date": "2024-01-15",
                "accepted_suggestions": 245,
                "total_suggestions": 480,
                "active_users": 42
            }
        ]
    },
    "chartData": {
        "labels": ["15/01/2024"],
        "datasets": [
            {
                "label": "Sugerencias Aceptadas",
                "data": [245],
                "borderColor": "#36A2EB",
                "fill": false
            },
            {
                "label": "Sugerencias Totales",
                "data": [480],
                "borderColor": "#FF6384",
                "fill": false
            }
        ]
    },
    "summary": {
        "overall": {
            "totalAcceptedSuggestions": 15420,
            "totalSuggestions": 28750,
            "acceptanceRate": "53.63",
            "activeUsers": 85
        },
        "weeklyAverages": {
            "acceptedSuggestions": "235.50",
            "totalSuggestions": "442.75",
            "acceptanceRate": "53.19"
        },
        "trends": {
            "acceptedSuggestions": 8.2,
            "totalSuggestions": 5.8,
            "trend": "Ligero incremento"
        },
        "lastUpdate": "2024-01-15"
    },
    "chart": {
        "success": true,
        "filePath": "exports/copilot-metrics-2024-01-15T12-30-45.png",
        "fileName": "copilot-metrics-2024-01-15T12-30-45.png"
    }
}
```

### Error Response Example
```json
{
    "error": {
        "status": 401,
        "message": "Authentication failed. Please check your GitHub token.",
        "details": "Bad credentials"
    }
}
```

## Error Handling

The API uses standard HTTP response codes:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Authentication

All requests require proper GitHub authentication headers.
