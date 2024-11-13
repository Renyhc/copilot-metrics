const { Chart } = require('chart.js/auto');
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

class ChartService {
    async generateLineChart(chartData, options = {}) {
        try {
            return await this._generateChart('line', chartData, options);
        } catch (error) {
            throw new Error(`Error generando gráfico de líneas: ${error.message}`);
        }
    }

    async generateAcceptanceRateChart(metricsData) {
        try {
            const chartData = {
                labels: metricsData.labels,
                datasets: [{
                    label: 'Tasa de Aceptación (%)',
                    data: metricsData.datasets[0].data.map((accepted, i) => 
                        (accepted / metricsData.datasets[1].data[i] * 100).toFixed(2)
                    ),
                    borderColor: '#4BC0C0',
                    fill: false
                }]
            };
            return await this._generateChart('line', chartData, {
                title: 'Tasa de Aceptación de Sugerencias',
                yAxisLabel: 'Porcentaje (%)'
            });
        } catch (error) {
            throw new Error(`Error generando gráfico de tasa de aceptación: ${error.message}`);
        }
    }

    async generateUsersBarChart(metricsData) {
        try {
            const chartData = {
                labels: ['Usuarios Activos', 'Usuarios Comprometidos'],
                datasets: [{
                    label: 'Número de Usuarios',
                    data: [
                        metricsData.overall.activeUsers,
                        metricsData.overall.engagedUsers
                    ],
                    backgroundColor: ['#36A2EB', '#FF6384']
                }]
            };
            return await this._generateChart('bar', chartData, {
                title: 'Distribución de Usuarios',
                indexAxis: 'y'
            });
        } catch (error) {
            throw new Error(`Error generando gráfico de usuarios: ${error.message}`);
        }
    }

    async generateWeeklyTrendsChart(metricsData) {
        try {
            const chartData = {
                labels: ['Sugerencias Aceptadas', 'Sugerencias Totales', 'Tasa de Aceptación'],
                datasets: [{
                    label: 'Tendencia Semanal (%)',
                    data: [
                        metricsData.trends.acceptedSuggestions,
                        metricsData.trends.totalSuggestions,
                        metricsData.trends.acceptanceRate
                    ],
                    backgroundColor: ['#36A2EB', '#FF6384', '#4BC0C0']
                }]
            };
            return await this._generateChart('bar', chartData, {
                title: 'Tendencias Semanales',
                yAxisLabel: 'Cambio Porcentual (%)'
            });
        } catch (error) {
            throw new Error(`Error generando gráfico de tendencias: ${error.message}`);
        }
    }

    async _generateChart(type, chartData, options = {}) {
        // Crear canvas
        const width = options.width || 800;
        const height = options.height || 400;
            const canvas = createCanvas(width, height);
            const ctx = canvas.getContext('2d');

            // Configurar el gráfico
            const chart = new Chart(ctx, {
                type: type,
                data: chartData,
                options: {
                    responsive: false,
                    animation: false,
                    indexAxis: options.indexAxis || 'x',
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: !!options.yAxisLabel,
                                text: options.yAxisLabel || ''
                            }
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: options.title || 'Métricas de Copilot'
                        },
                        legend: {
                            display: true,
                            position: 'bottom'
                        }
                    }
                }
            });

            // Asegurar que existe el directorio de exportación
            const exportDir = path.join(__dirname, '../exports');
            if (!fs.existsSync(exportDir)) {
                fs.mkdirSync(exportDir, { recursive: true });
            }

            // Generar nombre de archivo único
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const fileName = `copilot-metrics-${timestamp}.png`;
            const filePath = path.join(exportDir, fileName);

            // Exportar el gráfico como PNG
            const buffer = canvas.toBuffer('image/png');
            fs.writeFileSync(filePath, buffer);

            return {
                success: true,
                filePath,
                fileName
            };
        } catch (error) {
            throw new Error(`Error generando gráfico: ${error.message}`);
        }
    }

module.exports = new ChartService();
