const moment = require('moment');

class MetricsTransformService {
    transformMetricsForChart(metricsData) {
        try {
            const transformedData = {
                labels: [],
                datasets: [
                    {
                        label: 'Usuarios Activos',
                        data: [],
                        borderColor: '#36A2EB',
                        fill: false
                    },
                    {
                        label: 'Usuarios Comprometidos',
                        data: [],
                        borderColor: '#FF6384',
                        fill: false
                    }
                ]
            };

            // Ordenar los datos por fecha
            const sortedData = [...metricsData].sort((a, b) => 
                new Date(a.date) - new Date(b.date)
            );

            // Transformar los datos
            sortedData.forEach(metric => {
                if (metric.date) {
                    transformedData.labels.push(moment(metric.date).format('DD/MM/YYYY'));
                    transformedData.datasets[0].data.push(metric.total_active_users || 0);
                    transformedData.datasets[1].data.push(metric.total_engaged_users || 0);
                }
            });

            return transformedData;
        } catch (error) {
            throw new Error(`Error transformando métricas: ${error.message}`);
        }
    }

    getMetricsSummary(metricsData) {
        try {
            // Calcular tendencias y promedios
            const dailyMetrics = metricsData || [];
            const lastWeekMetrics = dailyMetrics.slice(-7);
            
            // Calcular promedios de la última semana
            const weeklyAvg = {
                acceptedSuggestions: this._calculateAverage(lastWeekMetrics.map(m => m.total_code_acceptances)),
                totalSuggestions: this._calculateAverage(lastWeekMetrics.map(m => m.total_code_suggestions)),
            };

            // Calcular tendencias (comparación con semana anterior)
            const previousWeekMetrics = dailyMetrics.slice(-14, -7);
            const trends = {
                acceptedSuggestions: this._calculateTrend(
                    this._calculateAverage(previousWeekMetrics.map(m => m.total_code_acceptances)),
                    weeklyAvg.total_code_acceptances
                ),
                totalSuggestions: this._calculateTrend(
                    this._calculateAverage(previousWeekMetrics.map(m => m.total_code_suggestions)),
                    weeklyAvg.total_code_suggestions
                )
            };

            return {
                overall: {
                    totalAcceptedSuggestions: metricsData.total_code_acceptances,
                    totalSuggestions: metricsData.total_code_suggestions,
                    acceptanceRate: (metricsData.total_code_acceptances / metricsData.total_code_suggestions * 100).toFixed(2),
                    activeUsers: metricsData.total_active_users
                },
                weeklyAverages: {
                    acceptedSuggestions: weeklyAvg.total_code_acceptances.toFixed(2),
                    totalSuggestions: weeklyAvg.total_code_suggestions.toFixed(2),
                    acceptanceRate: ((weeklyAvg.total_code_acceptances / weeklyAvg.total_code_suggestions) * 100).toFixed(2)
                },
                trends: {
                    acceptedSuggestions: trends.total_code_acceptances,
                    totalSuggestions: trends.total_code_suggestions,
                    trend: this._getTrendDescription(trends.total_code_acceptances)
                },
                lastUpdate: dailyMetrics[dailyMetrics.length - 1]?.date || 'No data'
            };
        } catch (error) {
            throw new Error(`Error generando resumen de métricas: ${error.message}`);
        }
    }

    _calculateAverage(numbers) {
        return numbers.length ? numbers.reduce((a, b) => a + b, 0) / numbers.length : 0;
    }

    _calculateTrend(previousValue, currentValue) {
        if (previousValue === 0) return 0;
        return ((currentValue - previousValue) / previousValue) * 100;
    }

    _getTrendDescription(trendPercentage) {
        if (trendPercentage > 10) return 'Incremento significativo';
        if (trendPercentage > 0) return 'Ligero incremento';
        if (trendPercentage === 0) return 'Sin cambios';
        if (trendPercentage > -10) return 'Ligera disminución';
        return 'Disminución significativa';
    }
}

module.exports = new MetricsTransformService();
