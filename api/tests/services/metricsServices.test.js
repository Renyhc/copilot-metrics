const metricsTransformService = require('../../services/metricsTransformService');
const { mockMetricsData } = require('../../mocks/mockMetricsServiceData');

describe('MetricsTransformService', () => {

    describe('getUsers', () => {
        it('debe transformar correctamente los datos de usuarios', () => {
            const result = metricsTransformService.getUsers(mockMetricsData);
            
            expect(result).toHaveProperty('labels');
            expect(result).toHaveProperty('activeUsers');
            expect(result).toHaveProperty('engagedUsers');
            
            expect(result.labels).toHaveLength(2);
            expect(result.activeUsers).toEqual([100, 120]);
            expect(result.engagedUsers).toEqual([50, 60]);
        });

        it('debe manejar un array vacío', () => {
            const result = metricsTransformService.getUsers([]);
            
            expect(result.labels).toHaveLength(0);
            expect(result.activeUsers).toHaveLength(0);
            expect(result.engagedUsers).toHaveLength(0);
        });
    });

    describe('getIdeActivityByDay', () => {
        it('debe transformar correctamente los datos de actividad IDE', () => {
            const result = metricsTransformService.getIdeActivityByDay(mockMetricsData);
            
            expect(result).toHaveProperty('labels');
            expect(result).toHaveProperty('accepted');
            expect(result).toHaveProperty('suggestions');
            expect(result).toHaveProperty('average');
            
            expect(result.labels).toEqual(['2024-02-01', '2024-02-02']);
            expect(result.accepted).toEqual([1000, 1100]);
            expect(result.suggestions).toEqual([1200, 1300]);
            expect(result.average).toEqual(['83.33', '84.62']);
        });
    });

    describe('getChatActivityByDay', () => {
        it('debe transformar correctamente los datos de actividad de chat', () => {
            const result = metricsTransformService.getChatActivityByDay(mockMetricsData);
            
            expect(result).toHaveProperty('labels');
            expect(result).toHaveProperty('chats');
            expect(result).toHaveProperty('interactions');
            expect(result).toHaveProperty('interactionRate');
            
            expect(result.labels).toEqual(['2024-02-01', '2024-02-02']);
            expect(result.chats).toEqual([500, 550]);
            expect(result.interactions).toEqual([500, 550]); // suma de copy + insertion events
            expect(result.interactionRate).toEqual(['100.00', '100.00']);
        });
    });

    describe('getIdeMetricsSummary', () => {
        it('debe generar correctamente el resumen de métricas IDE', () => {
            const result = metricsTransformService.getIdeMetricsSummary(mockMetricsData);
            
            expect(result).toHaveProperty('overall');
            expect(result).toHaveProperty('lastDayMetrics');
            expect(result).toHaveProperty('weeklyAverages');
            expect(result).toHaveProperty('trends');
            
            expect(result.overall.totalAcceptedSuggestions).toBeDefined();
            expect(result.overall.acceptanceRateAverage).toBeDefined();
            expect(result.lastDayMetrics.totalAcceptedSuggestions).toBe(1100);
            expect(result.lastDayMetrics.totalSuggestions).toBe(1300);
        });
    });
});
