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

    getMetricsSummary(metricsData, type) {
        const typeMetric = "copilot_ide_" + type;        
        try {
            const dailyMetrics = Array.isArray(metricsData) ? metricsData : [];
            const lastWeekMetrics = dailyMetrics.slice(-7);
            const previousWeekMetrics = dailyMetrics.slice(-14, -7);            

            // Función auxiliar para extraer métricas de completions
            const extractCompletionMetrics = (metric) => {
                let totalAccepted = 0;
                let totalSuggestions = 0;
                let totalLinesAccepted = 0;
                let totalLinesSuggested = 0;

                if (metric[typeMetric]?.editors) {
                    metric[typeMetric].editors.forEach(editor => {
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

            // Calcular métricas totales
            const overall = dailyMetrics.map(extractCompletionMetrics);
            const users = this._getTotalUsers(metricsData);
            const totalMetrics ={
                totalAcceptedSuggestions: this._calculateAverage(overall.map(m => m.totalAccepted)),
                totalSuggestions: this._calculateAverage(overall.map(m => m.totalSuggestions)),
                totalLinesAccepted: this._calculateAverage(overall.map(m => m.totalLinesAccepted)),
                totalLinesSuggested: this._calculateAverage(overall.map(m => m.totalLinesSuggested)),
            }

            return {
                overall: {
                    totalAcceptedSuggestions: totalMetrics.totalAcceptedSuggestions.toFixed(2),
                    totalSuggestions: totalMetrics.totalSuggestions.toFixed(2),
                    totalLinesAccepted: totalMetrics.totalLinesAccepted.toFixed(2),
                    totalLinesSuggested: totalMetrics.totalLinesSuggested.toFixed(2),                   
                    acceptanceRateAverage: (totalMetrics.totalAcceptedSuggestions / totalMetrics.totalSuggestions * 100 || 0).toFixed(2),
                    linesAcceptanceRate: (totalMetrics.totalLinesAccepted / totalMetrics.totalLinesSuggested * 100 || 0).toFixed(2),
                    activeUsers: this._calculateAverage(users.activeUsers.map(m => m)).toFixed(2),
                    engagedUsers: this._calculateAverage(users.engagedUsers.map(m => m)).toFixed(2),
                },
                lastDayMetrics: {
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
                lastUpdate: dailyMetrics[dailyMetrics.length - 1]?.date || 'No data'
            };
        } catch (error) {
            throw new Error(`Error generando resumen de métricas: ${error.message}`);
        }
    }

    _getTotalUsers(metricsData) {
        try {
            const transformedData = {
                activeUsers: [],
                engagedUsers: []
            };                    

            // Transformar los datos
            metricsData.forEach(metric => {
                    transformedData.activeUsers.push(metric.total_active_users || 0);
                    transformedData.engagedUsers.push(metric.total_engaged_users || 0);
                }
            );    
            return transformedData;
        } catch (error) {
            throw new Error(`Error transformando métricas de usuarios: ${error.message}`);
        }
    }

    _calculateAverage(numbers) {
        return numbers.length ? numbers.reduce((a, b) => a + b, 0) / numbers.length : 0;
    }

    _calculateTrend(previousValue, currentValue) {
        if (previousValue === 0) return 0;
        return ((currentValue - previousValue) / previousValue) * 100;
    }

    _calculateAcceptanceDay(metricsData) {
        let accepted = 0;
        let suggestions = 0;
        const transformedData = {
            labels: metricsData.labels,
            accepted: [],
            suggestions: [],
            average:[]
        };

        metricsData.map((metric, _) => {
            if (metric.copilot_ide_code_completions?.editors) {
                metric.copilot_ide_code_completions.editors.forEach(editor => {
                    if (editor.models) {
                        editor.models.forEach(model => {
                            if (model.languages) {
                                model.languages.forEach(lang => {
                                    accepted += lang.total_code_acceptances || 0;
                                    suggestions += lang.total_code_suggestions || 0;                                    
                                });
                            }
                        });
                    }
                    
                });
            }
            transformedData.accepted.push(accepted);                                    
            transformedData.suggestions.push(suggestions);
            transformedData.average.push(suggestions > 0 ? ((accepted / suggestions) * 100).toFixed(2) : 0);            
        });
        return transformedData;
    }

    getChatMetricsSummary(metricsData) {
        try {
            const dailyMetrics = Array.isArray(metricsData) ? metricsData : [];
            const lastWeekMetrics = dailyMetrics.slice(-7);
            const previousWeekMetrics = dailyMetrics.slice(-14, -7);

            // Función auxiliar para extraer métricas de chat
            const extractChatMetrics = (metric) => {
                let totalChats = 0;
                let totalCopyEvents = 0;
                let totalInsertionEvents = 0;
                let totalEngagedUsers = 0;

                if (metric.copilot_ide_chat?.editors) {
                    metric.copilot_ide_chat.editors.forEach(editor => {
                        if (editor.models) {
                            editor.models.forEach(model => {
                                totalChats += model.total_chats || 0;
                                totalCopyEvents += model.total_chat_copy_events || 0;
                                totalInsertionEvents += model.total_chat_insertion_events || 0;
                            });
                        }
                        totalEngagedUsers += editor.total_engaged_users || 0;
                    });
                }
                return {
                    totalChats,
                    totalCopyEvents,
                    totalInsertionEvents,
                    totalEngagedUsers
                };
            };

            // Calcular métricas semanales
            const weeklyMetrics = lastWeekMetrics.map(extractChatMetrics);
            const previousWeeklyMetrics = previousWeekMetrics.map(extractChatMetrics);

            // Calcular promedios semanales
            const weeklyAvg = {
                chats: this._calculateAverage(weeklyMetrics.map(m => m.totalChats)),
                copyEvents: this._calculateAverage(weeklyMetrics.map(m => m.totalCopyEvents)),
                insertionEvents: this._calculateAverage(weeklyMetrics.map(m => m.totalInsertionEvents)),
                engagedUsers: this._calculateAverage(weeklyMetrics.map(m => m.totalEngagedUsers))
            };

            // Calcular promedios de la semana anterior
            const previousWeekAvg = {
                chats: this._calculateAverage(previousWeeklyMetrics.map(m => m.totalChats)),
                copyEvents: this._calculateAverage(previousWeeklyMetrics.map(m => m.totalCopyEvents)),
                insertionEvents: this._calculateAverage(previousWeeklyMetrics.map(m => m.totalInsertionEvents)),
                engagedUsers: this._calculateAverage(previousWeeklyMetrics.map(m => m.totalEngagedUsers))
            };

            // Calcular métricas del último día
            const lastDayMetrics = extractChatMetrics(dailyMetrics[dailyMetrics.length - 1] || {});

            // Calcular tendencias
            const trends = {
                chats: this._calculateTrend(previousWeekAvg.chats, weeklyAvg.chats),
                copyEvents: this._calculateTrend(previousWeekAvg.copyEvents, weeklyAvg.copyEvents),
                insertionEvents: this._calculateTrend(previousWeekAvg.insertionEvents, weeklyAvg.insertionEvents),
                engagedUsers: this._calculateTrend(previousWeekAvg.engagedUsers, weeklyAvg.engagedUsers)
            };

            // Calcular métricas totales
            const overall = dailyMetrics.map(extractChatMetrics);
            const totalMetrics = {
                totalChats: this._calculateAverage(overall.map(m => m.totalChats)),
                totalCopyEvents: this._calculateAverage(overall.map(m => m.totalCopyEvents)),
                totalInsertionEvents: this._calculateAverage(overall.map(m => m.totalInsertionEvents)),
                totalEngagedUsers: this._calculateAverage(overall.map(m => m.totalEngagedUsers))
            };

            return {
                overall: {
                    totalChats: totalMetrics.totalChats.toFixed(2),
                    totalCopyEvents: totalMetrics.totalCopyEvents.toFixed(2),
                    totalInsertionEvents: totalMetrics.totalInsertionEvents.toFixed(2),
                    totalEngagedUsers: totalMetrics.totalEngagedUsers.toFixed(2),
                    interactionRate: ((totalMetrics.totalCopyEvents + totalMetrics.totalInsertionEvents) / totalMetrics.totalChats * 100 || 0).toFixed(2)
                },
                lastDayMetrics: {
                    totalChats: lastDayMetrics.totalChats,
                    totalCopyEvents: lastDayMetrics.totalCopyEvents,
                    totalInsertionEvents: lastDayMetrics.totalInsertionEvents,
                    totalEngagedUsers: lastDayMetrics.totalEngagedUsers,
                    interactionRate: ((lastDayMetrics.totalCopyEvents + lastDayMetrics.totalInsertionEvents) / lastDayMetrics.totalChats * 100 || 0).toFixed(2)
                },
                weeklyAverages: {
                    chats: weeklyAvg.chats.toFixed(2),
                    copyEvents: weeklyAvg.copyEvents.toFixed(2),
                    insertionEvents: weeklyAvg.insertionEvents.toFixed(2),
                    engagedUsers: weeklyAvg.engagedUsers.toFixed(2),
                    interactionRate: ((weeklyAvg.copyEvents + weeklyAvg.insertionEvents) / weeklyAvg.chats * 100 || 0).toFixed(2)
                },
                trends: {
                    chats: trends.chats,
                    copyEvents: trends.copyEvents,
                    insertionEvents: trends.insertionEvents,
                    engagedUsers: trends.engagedUsers,
                    trend: this._getTrendDescription(trends.chats)
                },
                lastUpdate: dailyMetrics[dailyMetrics.length - 1]?.date || 'No data'
            };
        } catch (error) {
            throw new Error(`Error generando resumen de métricas de chat: ${error.message}`);
        }
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
