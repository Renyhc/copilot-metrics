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

The API will be available at: http://localhost:3000

## API Endpoints

All endpoints are prefixed with the base URL: `http://localhost:3000`

Example using curl:
```bash
# Get enterprise metrics
curl -X GET "http://localhost:3000/enterprise/metrics" \
     -H "Authorization: Bearer your-github-token" \
     -H "Accept: application/json"

# Get organization metrics
curl -X GET "http://localhost:3000/org/metrics" \
     -H "Authorization: Bearer your-github-token" \
     -H "Accept: application/json"
```

### Enterprise Level Metrics

#### Get Enterprise Metrics
```http
GET /enterprise/metrics
```
Returns Copilot usage metrics for the entire enterprise.

#### Get Enterprise Team Metrics
```http
GET /enterprise/team/metrics
```
Returns Copilot metrics for a specific team within the enterprise.

### Organization Level Metrics

#### Get Organization Metrics
```http
GET /org/metrics
```
Returns Copilot usage metrics for the entire organization.

#### Get Organization Team Metrics
```http
GET /org/team/metrics
```
Returns Copilot metrics for a specific team within the organization.

Each endpoint will:
1. Return JSON data with metrics
2. Generate and save a PNG chart in the exports directory
3. Export the full data as JSON in the exports directory

## Export Format

All endpoints automatically export their data in two formats in the `exports` directory:

1. PNG chart images with format: `copilot-metrics-YYYY-MM-DDTHH-mm-ss.png`
2. JSON data files with format: `copilot-metrics-[type]-YYYY-MM-DD-YYYY-MM-DDTHH-mm-ss.json`

Where:
- `[type]` is one of: enterprise, enterprise-team, organization, organization-team
- The date (YYYY-MM-DD) helps with file organization
- The timestamp (HH-mm-ss) ensures unique filenames

## Response Format

All endpoints return JSON responses with the following structure:

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
