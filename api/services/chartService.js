const { Chart } = require('chart.js/auto');
const metricsTransformService = require('./metricsTransformService');
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

class ChartService {
    async generateUsersChart(metricsData) {
        try {
            const chartData = {
                labels: metricsData.labels,
                datasets: [{
                    label: 'Usuarios Activos',
                    data: metricsData.activeUsers,
                    borderColor: '#26A2EB',
                    backgroundColor: '#36A2EB',
                    fill: true
                },
                {
                    label: 'Usuarios Comprometidos',
                    data: metricsData.engagedUsers,
                    borderColor: '#C63842',
                    backgroundColor: '#FF6384',
                    fill: true
                }]
            };
            // Generar gráfico
            await this._generateChart('bar', chartData, {
                title: 'Distribución de Usuarios',
                yAxisLabel: 'Usuarios'
            });
            return chartData;
        } catch (error) {
            throw new Error(`Error generando gráfico de Usuarios: ${error.message}`);
        }
    }

    async generateIdeActivityChart(metricsData) {
        try {
            const chartData = {
                labels: metricsData.labels,
                datasets: [{
                    label: 'Aceptación Diaria',
                    data: metricsData.accepted,
                    borderColor: '#4BC0C0',
                    fill: false
                },
                {
                    label: 'Sugerencias Diarias',
                    data: metricsData.suggestions,
                    borderColor: '#5D6BC0',
                    fill: false
                }]
            };
            // Generar gráfico
            await this._generateChart('line', chartData, {
                title: 'Tasa de Aceptación de Sugerencias en el IDE',
                yAxisLabel: 'Cantidad'
            });
            return chartData;
        } catch (error) {
            throw new Error(`Error generando gráfico de tasa de aceptación: ${error.message}`);
        }
    }

    async generateChatActivityChart(metricsData) {
        try {
            const chartData = {
                labels: metricsData.labels,
                datasets: [{
                    label: 'Chats',
                    data: metricsData.chats,
                    borderColor: '#ff6384',
                    fill: false
                },
                {
                    label: 'Eventos Copiados e Insertados',
                    data: metricsData.interactions,
                    borderColor: '#36A2EB',
                    fill: false
                }]
            };
            await this._generateChart('line', chartData, {
                title: 'Tasa de Aceptación de Sugerencias en el Copilot Chat',
                yAxisLabel: 'Cantidad'
            });
            return chartData;
        } catch (error) {
            throw new Error(`Error generando gráfico de chats: ${error.message}`);
        }
    }

    async generateActivityChartRate(activityIdeByDay, activityChatByDay) {
        try {
            const chartData = {
                labels: activityIdeByDay.labels,
                datasets: [
                    {
                        label: 'Tasa de actividad IDE',
                        data: activityIdeByDay.average,
                        borderColor: '#36A2EB'
                    },
                    {
                        label: 'Tasa de actividad Chat',
                        data: activityChatByDay.interactionRate,
                        borderColor: '#FF6384'
                    }
                ]
            };
            // Generar gráfico
            await this._generateChart('line', chartData, {
                title: 'Tasa de aceptación de sugerencias en IDE / Chat',
                yAxisLabel: 'Porcentaje (%)'
            });
            return chartData;
        } catch (error) {
            throw new Error(`Error generando gráfico de tasa de actividad: ${error.message}`);
        }
    }

    async generateIdeWeeklyTrendsChart(summary) {
        try {
            const chartData = {
                labels: ['Promedio Semanal IDE', 'Tendencia'],
                datasets: [
                    {
                        label: 'Sugerencias Aceptadas',
                        data: [
                            parseFloat(summary.weeklyAverages.acceptedSuggestions),
                            summary.trends.acceptedSuggestions
                        ],
                        backgroundColor: '#36A2EB'
                    },
                    {
                        label: 'Sugerencias Totales',
                        data: [
                            parseFloat(summary.weeklyAverages.totalSuggestions),
                            summary.trends.totalSuggestions
                        ],
                        backgroundColor: '#FF6384'
                    },
                    {
                        label: 'Tasa de Aceptación (%)',
                        data: [
                            parseFloat(summary.weeklyAverages.acceptanceRate),
                            parseFloat(summary.overall.acceptanceRate)
                        ],
                        backgroundColor: '#4BC0C0'
                    }
                ]
            };
            // Generar gráfico
            await this._generateChart('bar', chartData, {
                title: 'Tendencias Semanales',
                yAxisLabel: 'Porciento (%)'
            });
            return chartData;
        } catch (error) {
            throw new Error(`Error generando gráfico de tendencias: ${error.message}`);
        }
    }

    async generateLanguageCharts(languageData) {
        try {
            // Gráfico de top 5 por prompts aceptados
            const topPromptsChart = {
                labels: languageData.topByAcceptedPrompts.map(l => l.name),
                datasets: [{
                    label: 'Prompts Aceptados',
                    data: languageData.topByAcceptedPrompts.map(l => l.acceptedPrompts),
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0',
                        '#9966FF'
                    ]
                }]
            };

            // Gráfico de top 5 por tasa de aceptación
            const topRateChart = {
                labels: languageData.topByAcceptanceRate.map(l => l.name),
                datasets: [{
                    label: 'Tasa de Aceptación (%)',
                    data: languageData.topByAcceptanceRate.map(l => l.acceptanceRate),
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0',
                        '#9966FF'
                    ]
                }]
            };

            // Generar ambos gráficos
            const promptsChartResult = await this._generateChart('pie', topPromptsChart, {
                title: 'Top 5 Lenguajes por Prompts Aceptados',
                height: 300
            });

            const rateChartResult = await this._generateChart('pie', topRateChart, {
                title: 'Top 5 Lenguajes por Tasa de Aceptación',
                height: 300
            });

            return {
                topPrompts: {
                    chart: promptsChartResult,
                    data: topPromptsChart
                },
                topRate: {
                    chart: rateChartResult,
                    data: topRateChart
                },
                tableData: languageData.allLanguages.map(lang => ({
                    language: lang.name,
                    acceptedPrompts: lang.acceptedPrompts,
                    acceptedLines: lang.acceptedLines,
                    acceptanceRate: lang.acceptanceRate
                }))
            };
        } catch (error) {
            throw new Error(`Error generando gráficos de lenguajes: ${error.message}`);
        }
    }

    async generateChatWeeklyTrendsChart(summary) {
        try {
            const chartData = {
                labels: ['Promedio Semanal Chat', 'Tendencia'],
                datasets: [
                    {
                        label: 'Chats',
                        data: [
                            parseFloat(summary.weeklyAverages.chats),
                            summary.trends.chats
                        ],
                        backgroundColor: '#36A2EB'
                    },
                    {
                        label: 'Eventos copiados',
                        data: [
                            parseFloat(summary.weeklyAverages.copyEvents),
                            summary.trends.copyEvents
                        ],
                        backgroundColor: '#FF6384'
                    },
                    {
                        label: 'Eventos insertados',
                        data: [
                            parseFloat(summary.weeklyAverages.insertionEvents),
                            summary.trends.insertionEvents
                        ],
                        backgroundColor: '#5C6BC0'
                    },                
                    {
                        label: 'Tasa de Interacción (%)',
                        data: [
                            parseFloat(summary.weeklyAverages.interactionRate),
                            parseFloat(summary.overall.interactionRate)
                        ],
                        backgroundColor: '#4BC0C0'
                    }
                ]
            };
            // Generar gráfico
            await this._generateChart('bar', chartData, {
                title: 'Tendencias Semanales',
                yAxisLabel: 'Porciento (%)'
            });
            return chartData;
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
            const exportDir = path.join(__dirname, '../../exports');
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
