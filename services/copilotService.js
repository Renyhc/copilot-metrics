const { Octokit } = require('@octokit/core');
const config = require('../config/config');
const metricsTransformService = require('./metricsTransformService');
const chartService = require('./chartService');
const exportService = require('./exportService');

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
            const transformedData = metricsTransformService.transformMetricsForChart(rawData);
            const chartResult = await chartService.generateLineChart(transformedData, {
                title: 'Métricas de Copilot - Nivel Empresa'
            });
            
            // Exportar datos a JSON
            const jsonExport = await exportService.exportMetricsToJson({
                raw: rawData,
                chartData: transformedData,
                summary: metricsTransformService.getMetricsSummary(rawData)
            }, 'enterprise');
            
            return {
                raw: rawData,
                chartData: transformedData,
                summary: metricsTransformService.getMetricsSummary(rawData),
                chart: chartResult,
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
                headers: {
                    'X-GitHub-Api-Version': config.API_VERSION
                }
            });
            const rawData = response.data;
            const transformedData = metricsTransformService.transformMetricsForChart(rawData);
            const chartResult = await chartService.generateLineChart(transformedData, {
                title: 'Métricas de Copilot - Nivel Equipo Empresa'
            });
            
            // Exportar datos a JSON
            const jsonExport = await exportService.exportMetricsToJson({
                raw: rawData,
                chartData: transformedData,
                summary: metricsTransformService.getMetricsSummary(rawData)
            }, 'enterprise-team');
            
            return {
                raw: rawData,
                chartData: transformedData,
                summary: metricsTransformService.getMetricsSummary(rawData),
                chart: chartResult,
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
                headers: {
                    'X-GitHub-Api-Version': config.API_VERSION
                }
            });
            const rawData = response.data;
            const transformedData = metricsTransformService.transformMetricsForChart(rawData);
            const chartResult = await chartService.generateLineChart(transformedData, {
                title: 'Métricas de Copilot - Nivel Organización'
            });
            
            // Exportar datos a JSON
            const jsonExport = await exportService.exportMetricsToJson({
                raw: rawData,
                chartData: transformedData,
                summary: metricsTransformService.getMetricsSummary(rawData)
            }, 'organization');
            
            return {
                raw: rawData,
                chartData: transformedData,
                summary: metricsTransformService.getMetricsSummary(rawData),
                chart: chartResult,
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
                headers: {
                    'X-GitHub-Api-Version': config.API_VERSION
                }
            });
            const rawData = response.data;
            const transformedData = metricsTransformService.transformMetricsForChart(rawData);
            const chartResult = await chartService.generateLineChart(transformedData, {
                title: 'Métricas de Copilot - Nivel Equipo Organización'
            });
            
            // Exportar datos a JSON
            const jsonExport = await exportService.exportMetricsToJson({
                raw: rawData,
                chartData: transformedData,
                summary: metricsTransformService.getMetricsSummary(rawData)
            }, 'organization-team');
            
            return {
                raw: rawData,
                chartData: transformedData,
                summary: metricsTransformService.getMetricsSummary(rawData),
                chart: chartResult,
                export: jsonExport
            };
        } catch (error) {
            throw new Error(`Error fetching org team metrics: ${error.message}`);
        }
    }
}

module.exports = new CopilotService();
