const { Octokit } = require('@octokit/core');
const config = require('../../config/config');
const metricsTransformService = require('./metricsTransformService');
const chartService = require('./chartService');
const exportService = require('./exportService');

const octokit = new Octokit({
    auth: config.GITHUB_TOKEN,
    url : config.GITHUB_API_URL
});

const headers = {
    'Accept': "application/vnd.github+json",
    'X-GitHub-Api-Version': config.API_VERSION
};

class CopilotService {
    async getEnterpriseMetrics() {
        try {
            const response = await octokit.request('GET /enterprises/{enterprise}/copilot/metrics', {
                enterprise: config.ENTERPRISE,
                headers: headers
            });
            const rawData = response.data;
            const usersData = metricsTransformService.getUsers(rawData);

            // Generar múltiples gráficos
            const chartResults = {
                usersChart: await chartService.generateUsersChart(usersData),
            };
            
            // Exportar datos a JSON
            const jsonExport = await exportService.exportMetricsToJson({
                raw: rawData,
                charts: chartResults,
            }, 'enterprise');
            
            return {
                raw: rawData,
                charts: chartResults,
                export: jsonExport
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
                headers: headers
            });
            const rawData = response.data;
            const usersData = metricsTransformService.getUsers(rawData);

            // Generar múltiples gráficos
            const chartResults = {
                usersChart: await chartService.generateUsersChart(usersData),
            };

            // Exportar datos a JSON
            const jsonExport = await exportService.exportMetricsToJson({
                raw: rawData,
                charts: chartResults,
            }, 'enterprise-team');
            
            return {
                raw: rawData,
                charts: chartResults,
                export: jsonExport
            };
        } catch (error) {
            throw new Error(`Error fetching enterprise team metrics: ${error.message}`);
        }
    }

    async getOrgMetrics() {
        try {
            const response = await octokit.request('GET /orgs/{org}/copilot/metrics', {
                org: config.ORG,
                headers: headers
            });

            const rawData = response.data;
            const usersData = metricsTransformService.getUsers(rawData);
            const activityIdeByDay = metricsTransformService.getIdeActivityByDay(rawData);
            const activityChatByDay = metricsTransformService.getChatActivityByDay(rawData);               
            const summaryCode = metricsTransformService.getIdeMetricsSummary(rawData);
            const summaryChat = metricsTransformService.getChatMetricsSummary(rawData);   
            const topLanguages = metricsTransformService.getTopLanguages(rawData);   

            // Generar múltiples gráficos       
            const chartResults = {
                usersChart: await chartService.generateUsersChart(usersData),
                activityIdeChart: await chartService.generateIdeActivityChart(activityIdeByDay),
                activityChatChart: await chartService.generateChatActivityChart(activityChatByDay),
                activityCharteRate: await chartService.generateActivityChartRate(activityIdeByDay, activityChatByDay),
                //topLanguagesChart: await chartService.generateTopLanguagesChart(topLanguages),
                trendsChart: { 
                    trendsCode: await chartService.generateIdeWeeklyTrendsChart(summaryCode),
                    trendsChat: await chartService.generateChatWeeklyTrendsChart(summaryChat)
                }
            };
            // Resumen de métricas
            const summary = {
                summaryCode: summaryCode,
                summaryChat: summaryChat
            }
            
            // Exportar datos a JSON
            const jsonExport = await exportService.exportMetricsToJson({
                raw: rawData,
                charts: chartResults,
                summary: summary
            }, 'organization');
            
            return {
                raw: rawData,
                charts: chartResults,
                summary: summary,                
                export: jsonExport
            };
        } catch (error) {
            throw new Error(`Error fetching org metrics: ${error.message}`);
        }
    }

    async getOrgTeamMetrics() {
        try {
            const response = await octokit.request('GET /orgs/{org}/team/{team_slug}/copilot/metrics', {
                org: config.ORG,
                team_slug: config.TEAM_SLUG,
                headers: headers
            });
            const rawData = response.data;
            const usersData = metricsTransformService.getUsers(rawData);

            // Generar múltiples gráficos
            const chartResults = {
                usersChart: await chartService.generateUsersChart(usersData),
            };

            // Exportar datos a JSON
            const jsonExport = await exportService.exportMetricsToJson({
                raw: rawData,
                charts: chartResults,
            }, 'organization-team');
            
            return {
                raw: rawData,
                charts: chartResults,
                export: jsonExport
            };
        } catch (error) {
            throw new Error(`Error fetching org team metrics: ${error.message}`);
        }
    }
}

module.exports = new CopilotService();
