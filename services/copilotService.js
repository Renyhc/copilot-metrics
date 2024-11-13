const { Octokit } = require('@octokit/core');
const config = require('../config/config');
const metricsTransformService = require('./metricsTransformService');

const octokit = new Octokit({
    auth: config.GITHUB_TOKEN
});

class CopilotService {
    async getEnterpriseMetrics() {
        try {
            const response = await octokit.request('GET /enterprises/{enterprise}/copilot/metrics', {
                enterprise: config.ENTERPRISE,
                headers: {
                    'X-GitHub-Api-Version': config.API_VERSION
                }
            });
            const rawData = response.data;
            return {
                raw: rawData,
                chartData: metricsTransformService.transformMetricsForChart(rawData),
                summary: metricsTransformService.getMetricsSummary(rawData)
            };
        } catch (error) {
            throw new Error(`Error fetching enterprise metrics: ${error.message}`);
        }
    }

    async getEnterpriseTeamMetrics() {
        try {
            const response = await octokit.request('GET /enterprises/{enterprise}/team/{team_slug}/copilot/metrics', {
                enterprise: config.ENTERPRISE,
                team_slug: config.TEAM_SLUG,
                headers: {
                    'X-GitHub-Api-Version': config.API_VERSION
                }
            });
            return response.data;
        } catch (error) {
            throw new Error(`Error fetching enterprise team metrics: ${error.message}`);
        }
    }

    async getOrgMetrics() {
        try {
            const response = await octokit.request('GET /orgs/{org}/copilot/metrics', {
                org: config.ORG,
                headers: {
                    'X-GitHub-Api-Version': config.API_VERSION
                }
            });
            return response.data;
        } catch (error) {
            throw new Error(`Error fetching org metrics: ${error.message}`);
        }
    }

    async getOrgTeamMetrics() {
        try {
            const response = await octokit.request('GET /orgs/{org}/team/{team_slug}/copilot/metrics', {
                org: config.ORG,
                team_slug: config.TEAM_SLUG,
                headers: {
                    'X-GitHub-Api-Version': config.API_VERSION
                }
            });
            return response.data;
        } catch (error) {
            throw new Error(`Error fetching org team metrics: ${error.message}`);
        }
    }
}

module.exports = new CopilotService();
