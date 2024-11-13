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
            return {
                totalAcceptedSuggestions: metricsData.total_accepted_suggestions,
                totalSuggestions: metricsData.total_suggestions,
                acceptanceRate: (metricsData.total_accepted_suggestions / metricsData.total_suggestions * 100).toFixed(2),
                activeUsers: metricsData.active_users
            };
        } catch (error) {
            throw new Error(`Error generando resumen de métricas: ${error.message}`);
        }
    }
}

module.exports = new MetricsTransformService();
