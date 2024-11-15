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
            const dailyMetrics = Array.isArray(metricsData) ? metricsData : [];
            const lastWeekMetrics = dailyMetrics.slice(-7);
            const previousWeekMetrics = dailyMetrics.slice(-14, -7);
            const last28DaysMetrics = dailyMetrics.slice(-28);

            // Función auxiliar para extraer métricas de completions
            const extractCompletionMetrics = (metric) => {
                let totalAccepted = 0;
                let totalSuggestions = 0;
                let totalLinesAccepted = 0;
                let totalLinesSuggested = 0;

                if (metric.copilot_ide_code_completions?.editors) {
                    metric.copilot_ide_code_completions.editors.forEach(editor => {
                        if (editor.models) {
                            editor.models.forEach(model => {
                                if (model.languages) {
                                    model.languages.forEach(lang => {
                                        totalAccepted += lang.total_code_acceptances || 0;
                                        totalSuggestions += lang.total_code_suggestions || 0;
                                        totalLinesAccepted += lang.total_code_lines_accepted || 0;
                                        totalLinesSuggested += lang.total_code_lines_suggested || 0;
                                    });
                                }
                            });
                        }
                    });
                }
                return {
                    totalAccepted,
                    totalSuggestions,
                    totalLinesAccepted,
                    totalLinesSuggested
                };
            };

            // Calcular métricas semanales
            const weeklyMetrics = lastWeekMetrics.map(extractCompletionMetrics);
            const previousWeeklyMetrics = previousWeekMetrics.map(extractCompletionMetrics);

            // Calcular promedios semanales
            const weeklyAvg = {
                acceptedSuggestions: this._calculateAverage(weeklyMetrics.map(m => m.totalAccepted)),
                totalSuggestions: this._calculateAverage(weeklyMetrics.map(m => m.totalSuggestions)),
                acceptedLines: this._calculateAverage(weeklyMetrics.map(m => m.totalLinesAccepted)),
                suggestedLines: this._calculateAverage(weeklyMetrics.map(m => m.totalLinesSuggested))
            };

            // Calcular promedios de la semana anterior
            const previousWeekAvg = {
                acceptedSuggestions: this._calculateAverage(previousWeeklyMetrics.map(m => m.totalAccepted)),
                totalSuggestions: this._calculateAverage(previousWeeklyMetrics.map(m => m.totalSuggestions)),
                acceptedLines: this._calculateAverage(previousWeeklyMetrics.map(m => m.totalLinesAccepted)),
                suggestedLines: this._calculateAverage(previousWeeklyMetrics.map(m => m.totalLinesSuggested))
            };

            // Calcular métricas totales del último día
            const lastDayMetrics = extractCompletionMetrics(dailyMetrics[dailyMetrics.length - 1] || {});

            // Calcular tendencias
            const trends = {
                acceptedSuggestions: this._calculateTrend(previousWeekAvg.acceptedSuggestions, weeklyAvg.acceptedSuggestions),
                totalSuggestions: this._calculateTrend(previousWeekAvg.totalSuggestions, weeklyAvg.totalSuggestions),
                acceptedLines: this._calculateTrend(previousWeekAvg.acceptedLines, weeklyAvg.acceptedLines),
                suggestedLines: this._calculateTrend(previousWeekAvg.suggestedLines, weeklyAvg.suggestedLines)
            };

            return {
                overall: {
                    totalAcceptedSuggestions: lastDayMetrics.totalAccepted,
                    totalSuggestions: lastDayMetrics.totalSuggestions,
                    totalLinesAccepted: lastDayMetrics.totalLinesAccepted,
                    totalLinesSuggested: lastDayMetrics.totalLinesSuggested,
                    acceptanceRate: (lastDayMetrics.totalAccepted / lastDayMetrics.totalSuggestions * 100 || 0).toFixed(2),
                    linesAcceptanceRate: (lastDayMetrics.totalLinesAccepted / lastDayMetrics.totalLinesSuggested * 100 || 0).toFixed(2),
                    activeUsers: dailyMetrics[dailyMetrics.length - 1]?.total_active_users || 0,
                    engagedUsers: dailyMetrics[dailyMetrics.length - 1]?.total_engaged_users || 0
                },
                weeklyAverages: {
                    acceptedSuggestions: weeklyAvg.acceptedSuggestions.toFixed(2),
                    totalSuggestions: weeklyAvg.totalSuggestions.toFixed(2),
                    acceptedLines: weeklyAvg.acceptedLines.toFixed(2),
                    suggestedLines: weeklyAvg.suggestedLines.toFixed(2),
                    acceptanceRate: ((weeklyAvg.acceptedSuggestions / weeklyAvg.totalSuggestions * 100) || 0).toFixed(2),
                    linesAcceptanceRate: ((weeklyAvg.acceptedLines / weeklyAvg.suggestedLines * 100) || 0).toFixed(2)
                },
                trends: {
                    acceptedSuggestions: trends.acceptedSuggestions,
                    totalSuggestions: trends.totalSuggestions,
                    acceptedLines: trends.acceptedLines,
                    suggestedLines: trends.suggestedLines,
                    trend: this._getTrendDescription(trends.acceptedSuggestions)
                },
                lastUpdate: dailyMetrics[dailyMetrics.length - 1]?.date || 'No data',
                acceptanceRate28Days: this._calculate28DayAcceptanceRate(last28DaysMetrics)
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

    _calculate28DayAcceptanceRate(metrics) {
        let totalAccepted = 0;
        let totalSuggestions = 0;

        metrics.forEach(metric => {
            if (metric.copilot_ide_code_completions?.editors) {
                metric.copilot_ide_code_completions.editors.forEach(editor => {
                    if (editor.models) {
                        editor.models.forEach(model => {
                            if (model.languages) {
                                model.languages.forEach(lang => {
                                    totalAccepted += lang.total_code_acceptances || 0;
                                    totalSuggestions += lang.total_code_suggestions || 0;
                                });
                            }
                        });
                    }
                });
            }
        });

        return totalSuggestions > 0 ? ((totalAccepted / totalSuggestions) * 100).toFixed(2) : 0;
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
