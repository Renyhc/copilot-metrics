const CopilotService = require('../../services/copilotService');
const metricsTransformService = require('../../services/metricsTransformService');
const chartService = require('../../services/chartService');
const exportService = require('../../services/exportService');

describe('CopilotService', () => {
    // Mock data
    const mockApiResponse = {
        data: {
            date: '2024-02-01',
            total_active_users: 100,
            total_engaged_users: 50,
            copilot_ide_code_completions: {
                editors: [{
                    name: 'VS Code',
                    total_engaged_users: 45,
                    models: [{
                        name: 'default',
                        languages: [{
                            name: 'JavaScript',
                            total_code_acceptances: 1000,
                            total_code_suggestions: 1200,
                            total_code_lines_accepted: 3000,
                            total_code_lines_suggested: 3500
                        }]
                    }]
                }]
            }
        }
    };

    const mockTransformedUsers = {
        labels: ['01/02/2024'],
        activeUsers: [100],
        engagedUsers: [50]
    };

    const mockIdeActivity = {
        labels: ['2024-02-01'],
        accepted: [1000],
        suggestions: [1200],
        average: ['83.33']
    };

    const mockChartResult = {
        usersChart: {
            labels: ['01/02/2024'],
            datasets: [{
                label: 'Usuarios Activos',
                data: [100]
            }]
        },
        activityIdeChart: {
            labels: ['2024-02-01'],
            datasets: [{
                label: 'Aceptación Diaria',
                data: [1000]
            }]
        }
    };

    // Configure mocks
    beforeEach(() => {
        jest.clearAllMocks();

        // Mock Octokit
        jest.spyOn(CopilotService, 'getOrgMetrics');
        
        // Mock transformation services
        jest.spyOn(metricsTransformService, 'getUsers')
            .mockReturnValue(mockTransformedUsers);
        jest.spyOn(metricsTransformService, 'getIdeActivityByDay')
            .mockReturnValue(mockIdeActivity);
        jest.spyOn(metricsTransformService, 'getChatActivityByDay')
            .mockReturnValue({});
        jest.spyOn(metricsTransformService, 'getTopLanguages')
            .mockReturnValue({});
        jest.spyOn(metricsTransformService, 'getTopEditors')
            .mockReturnValue({});
        jest.spyOn(metricsTransformService, 'getIdeMetricsSummary')
            .mockReturnValue({});
        jest.spyOn(metricsTransformService, 'getChatMetricsSummary')
            .mockReturnValue({});
        jest.spyOn(metricsTransformService, 'getProductivityMetrics')
            .mockReturnValue({});

        // Mock chart service
        jest.spyOn(chartService, 'setExported')
            .mockImplementation(() => {});
        jest.spyOn(chartService, 'generateUsersChart')
            .mockResolvedValue(mockChartResult.usersChart);
        jest.spyOn(chartService, 'generateIdeActivityChart')
            .mockResolvedValue(mockChartResult.activityIdeChart);
        jest.spyOn(chartService, 'generateChatActivityChart')
            .mockResolvedValue({});
        jest.spyOn(chartService, 'generateActivityChartRate')
            .mockResolvedValue({});
        jest.spyOn(chartService, 'generateLanguageCharts')
            .mockResolvedValue({});
        jest.spyOn(chartService, 'generateEditorCharts')
            .mockResolvedValue({});
        jest.spyOn(chartService, 'generateProductivityCharts')
            .mockResolvedValue({});

        // Mock export service
        jest.spyOn(exportService, 'exportMetricsToJson')
            .mockResolvedValue({ success: true, filePath: '/exports/test.json' });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('getOrgMetrics', () => {
        it('debe obtener métricas organizacionales correctamente', async () => {
            // Mock the Octokit request
            jest.spyOn(CopilotService, 'getOrgMetrics')
                .mockResolvedValueOnce(mockApiResponse);

            const result = await CopilotService.getOrgMetrics();

            // Verify the result structure
            expect(result).toHaveProperty('raw');
            expect(result).toHaveProperty('charts');
            expect(result).toHaveProperty('summary');
            expect(result).toHaveProperty('export');

            // Verify service calls
            expect(metricsTransformService.getUsers).toHaveBeenCalledWith(mockApiResponse.data);
            expect(metricsTransformService.getIdeActivityByDay).toHaveBeenCalledWith(mockApiResponse.data);
            expect(chartService.generateUsersChart).toHaveBeenCalledWith(mockTransformedUsers);
            expect(chartService.generateIdeActivityChart).toHaveBeenCalledWith(mockIdeActivity);

            // Verify data transformation
            expect(result.raw).toEqual(mockApiResponse.data);
            expect(result.charts.usersChart).toEqual(mockChartResult.usersChart);
        });

        it('debe manejar errores al obtener métricas organizacionales', async () => {
            // Mock API error
            jest.spyOn(CopilotService, 'getOrgMetrics')
                .mockRejectedValueOnce(new Error('API Error'));

            // Verify error handling
            await expect(CopilotService.getOrgMetrics())
                .rejects
                .toThrow('Error fetching org metrics: API Error');

            // Verify services were not called
            expect(metricsTransformService.getUsers).not.toHaveBeenCalled();
            expect(chartService.generateUsersChart).not.toHaveBeenCalled();
            expect(exportService.exportMetricsToJson).not.toHaveBeenCalled();
        });
    });
});
