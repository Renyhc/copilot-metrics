const moment = require('moment');

class MetricsTransformService {
    transformMetricsForChart(metricsData) {
        try {
            // Asumiendo que metricsData tiene una estructura con datos diarios
            const transformedData = {
                labels: [],
                datasets: [
                    {
                        label: 'Sugerencias Aceptadas',
                        data: [],
                        borderColor: '#36A2EB',
                        fill: false
                    },
                    {
                        label: 'Sugerencias Totales',
                        data: [],
                        borderColor: '#FF6384',
                        fill: false
                    }
                ]
            };

            // Ordenar los datos por fecha
            const sortedData = metricsData.daily_metrics.sort((a, b) => 
                moment(a.date).diff(moment(b.date))
            );

            // Transformar los datos
            sortedData.forEach(metric => {
                transformedData.labels.push(moment(metric.date).format('DD/MM/YYYY'));
                transformedData.datasets[0].data.push(metric.accepted_suggestions);
                transformedData.datasets[1].data.push(metric.total_suggestions);
            });

            return transformedData;
        } catch (error) {
            throw new Error(`Error transformando métricas: ${error.message}`);
        }
    }

    getMetricsSummary(metricsData) {
        try {
            // Calcular tendencias y promedios
            const dailyMetrics = metricsData.daily_metrics || [];
            const lastWeekMetrics = dailyMetrics.slice(-7);
            
            // Calcular promedios de la última semana
            const weeklyAvg = {
                acceptedSuggestions: this._calculateAverage(lastWeekMetrics.map(m => m.accepted_suggestions)),
                totalSuggestions: this._calculateAverage(lastWeekMetrics.map(m => m.total_suggestions)),
            };

            // Calcular tendencias (comparación con semana anterior)
            const previousWeekMetrics = dailyMetrics.slice(-14, -7);
            const trends = {
                acceptedSuggestions: this._calculateTrend(
                    this._calculateAverage(previousWeekMetrics.map(m => m.accepted_suggestions)),
                    weeklyAvg.acceptedSuggestions
                ),
                totalSuggestions: this._calculateTrend(
                    this._calculateAverage(previousWeekMetrics.map(m => m.total_suggestions)),
                    weeklyAvg.totalSuggestions
                )
            };

            return {
                overall: {
                    totalAcceptedSuggestions: metricsData.total_accepted_suggestions,
                    totalSuggestions: metricsData.total_suggestions,
                    acceptanceRate: (metricsData.total_accepted_suggestions / metricsData.total_suggestions * 100).toFixed(2),
                    activeUsers: metricsData.active_users
                },
                weeklyAverages: {
                    acceptedSuggestions: weeklyAvg.acceptedSuggestions.toFixed(2),
                    totalSuggestions: weeklyAvg.totalSuggestions.toFixed(2),
                    acceptanceRate: ((weeklyAvg.acceptedSuggestions / weeklyAvg.totalSuggestions) * 100).toFixed(2)
                },
                trends: {
                    acceptedSuggestions: trends.acceptedSuggestions,
                    totalSuggestions: trends.totalSuggestions,
                    trend: this._getTrendDescription(trends.acceptedSuggestions)
                },
                lastUpdate: dailyMetrics[dailyMetrics.length - 1]?.date || 'No data'
            };
        } catch (error) {
            throw new Error(`Error generando resumen de métricas: ${error.message}`);
        }
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
