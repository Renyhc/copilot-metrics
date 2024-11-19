const moment = require('moment');

class MetricsTransformService {
    getUsers(metricsData) {
        try {
            const transformedData = {
                labels: [],
                activeUsers: [],
                engagedUsers: []
            };

            // Ordenar los datos por fecha
            const sortedData = [...metricsData].sort((a, b) => 
                new Date(a.date) - new Date(b.date)
            );

            // Transformar los datos
            sortedData.forEach(metric => {
                if (metric.date) {
                    transformedData.labels.push(moment(metric.date).format('DD/MM/YYYY'));
                    transformedData.activeUsers.push(metric.total_active_users || 0);
                    transformedData.engagedUsers.push(metric.total_engaged_users || 0);
                }
            });

            return transformedData;
        } catch (error) {
            throw new Error(`Error transformando métricas de usuarios: ${error.message}`);
        }
    }

    // Transformar métricas de Chat para gráfico por día
    getChatActivityByDay(metricsData) {
        const transformedData = {
            labels: [],
            chats: [],
            interactions: [], // suma de copy + insertion events
            interactionRate: [] // (copy + insertion) / chats * 100
        };

        // Asegurar que metricsData es un array y ordenarlo por fecha
        const sortedData = Array.isArray(metricsData) ?
            [...metricsData].sort((a, b) => new Date(a.date) - new Date(b.date)) :
            [];

        sortedData.forEach(dayMetric => {
            let dayChats = 0;
            let dayCopyEvents = 0;
            let dayInsertionEvents = 0;

            if (dayMetric.copilot_ide_chat?.editors) {
                dayMetric.copilot_ide_chat.editors.forEach(editor => {
                    if (editor.models) {
                        editor.models.forEach(model => {
                            dayChats += model.total_chats || 0;
                            dayCopyEvents += model.total_chat_copy_events || 0;
                            dayInsertionEvents += model.total_chat_insertion_events || 0;
                        });
                    }
                });
            }

            const dayInteractions = dayCopyEvents + dayInsertionEvents;
            
            // Agregar datos del día
            transformedData.labels.push(dayMetric.date);
            transformedData.chats.push(dayChats);
            transformedData.interactions.push(dayInteractions);
            transformedData.interactionRate.push(
                dayChats > 0 ? 
                ((dayInteractions / dayChats) * 100).toFixed(2) : 
                '0'
            );
        });

        return transformedData;
    }

    // Transformar métricas de IDE para gráfico de aceptación de sugerencias por día
    getIdeActivityByDay(metricsData) {
        const transformedData = {
            labels: [],
            accepted: [],
            suggestions: [],
            average: []
        };

        // Asegurar que metricsData es un array y ordenarlo por fecha
        const sortedData = Array.isArray(metricsData) ?
            [...metricsData].sort((a, b) => new Date(a.date) - new Date(b.date)) :
            [];

        sortedData.forEach(dayMetric => {
            let dayAccepted = 0;
            let daySuggestions = 0;

            if (dayMetric.copilot_ide_code_completions?.editors) {
                dayMetric.copilot_ide_code_completions.editors.forEach(editor => {
                    if (editor.models) {
                        editor.models.forEach(model => {
                            if (model.languages) {
                                model.languages.forEach(lang => {
                                    dayAccepted += lang.total_code_acceptances || 0;
                                    daySuggestions += lang.total_code_suggestions || 0;
                                });
                            }
                        });
                    }
                });
            }

            // Agregar datos del día
            transformedData.labels.push(dayMetric.date);
            transformedData.accepted.push(dayAccepted);
            transformedData.suggestions.push(daySuggestions);
            transformedData.average.push(
                daySuggestions > 0 ?
                ((dayAccepted / daySuggestions) * 100).toFixed(2) :
                '0'
            );
        });

        return transformedData;
    }

    // Resumen - Métricas de IDE
    getIdeMetricsSummary(metricsData) {      
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

            // Calcular métricas totales
            const overall = dailyMetrics.map(extractCompletionMetrics);
            const users = this.getUsers(metricsData);
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

    // Resumen - Métricas de Chat
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

    getTopLanguages(metricsData) {
        try {
            const languageStats = new Map();

            // Recopilar estadísticas por lenguaje
            metricsData.forEach(dayMetric => {
                if (dayMetric.copilot_ide_code_completions?.editors) {
                    dayMetric.copilot_ide_code_completions.editors.forEach(editor => {
                        if (editor.models) {
                            editor.models.forEach(model => {
                                if (model.languages) {
                                    model.languages.forEach(lang => {
                                        const stats = languageStats.get(lang.name) || {
                                            name: lang.name,
                                            acceptedPrompts: 0,
                                            totalPrompts: 0,
                                            acceptedLines: 0,
                                            totalLines: 0
                                        };

                                        stats.acceptedPrompts += lang.total_code_acceptances || 0;
                                        stats.totalPrompts += lang.total_code_suggestions || 0;
                                        stats.acceptedLines += lang.total_code_lines_accepted || 0;
                                        stats.totalLines += lang.total_code_lines_suggested || 0;

                                        languageStats.set(lang.name, stats);
                                    });
                                }
                            });
                        }
                    });
                }
            });

            // Convertir Map a Array y calcular tasas
            const languageArray = Array.from(languageStats.values()).map(stats => ({
                ...stats,
                acceptanceRate: stats.totalPrompts > 0 ? 
                    ((stats.acceptedPrompts / stats.totalPrompts) * 100).toFixed(2) : 0
            }));

            // Ordenar por diferentes métricas
            const byAcceptedPrompts = [...languageArray]
                .sort((a, b) => b.acceptedPrompts - a.acceptedPrompts)
                .slice(0, 5);

            const byAcceptanceRate = [...languageArray]
                .sort((a, b) => b.acceptanceRate - a.acceptanceRate)
                .slice(0, 5);

            const byAcceptedLines = [...languageArray]
                .sort((a, b) => b.acceptedLines - a.acceptedLines);

            return {
                topByAcceptedPrompts: byAcceptedPrompts,
                topByAcceptanceRate: byAcceptanceRate,
                allLanguages: byAcceptedLines
            };
        } catch (error) {
            throw new Error(`Error analizando métricas por lenguaje: ${error.message}`);
        }
    }

    getTopEditors(metricsData) {
        try {
            const editorStats = new Map();

            // Recopilar estadísticas por editor
            metricsData.forEach(dayMetric => {
                if (dayMetric.copilot_ide_code_completions?.editors) {
                    dayMetric.copilot_ide_code_completions.editors.forEach(editor => {
                        const stats = editorStats.get(editor.name) || {
                            name: editor.name,
                            acceptedPrompts: 0,
                            totalPrompts: 0,
                            acceptedLines: 0,
                            totalLines: 0,
                            engagedUsers: 0
                        };

                        // Acumular métricas de todos los modelos y lenguajes del editor
                        if (editor.models) {
                            editor.models.forEach(model => {
                                if (model.languages) {
                                    model.languages.forEach(lang => {
                                        stats.acceptedPrompts += lang.total_code_acceptances || 0;
                                        stats.totalPrompts += lang.total_code_suggestions || 0;
                                        stats.acceptedLines += lang.total_code_lines_accepted || 0;
                                        stats.totalLines += lang.total_code_lines_suggested || 0;
                                    });
                                }
                            });
                        }
                        stats.engagedUsers = Math.max(stats.engagedUsers, editor.total_engaged_users || 0);

                        editorStats.set(editor.name, stats);
                    });
                }
            });

            // Convertir Map a Array y calcular tasas
            const editorArray = Array.from(editorStats.values()).map(stats => ({
                ...stats,
                acceptanceRate: stats.totalPrompts > 0 ? 
                    ((stats.acceptedPrompts / stats.totalPrompts) * 100).toFixed(2) : 0,
                linesAcceptanceRate: stats.totalLines > 0 ?
                    ((stats.acceptedLines / stats.totalLines) * 100).toFixed(2) : 0
            }));

            // Ordenar por diferentes métricas
            const byAcceptedPrompts = [...editorArray]
                .sort((a, b) => b.acceptedPrompts - a.acceptedPrompts);

            const byAcceptanceRate = [...editorArray]
                .sort((a, b) => b.acceptanceRate - a.acceptanceRate);

            const byEngagedUsers = [...editorArray]
                .sort((a, b) => b.engagedUsers - a.engagedUsers);

            return {
                byAcceptedPrompts,
                byAcceptanceRate,
                byEngagedUsers,
                allEditors: editorArray
            };
        } catch (error) {
            throw new Error(`Error analizando métricas por editor: ${error.message}`);
        }
    }

    _calculateAverage(numbers) {
        return numbers.length ? numbers.reduce((a, b) => a + b, 0) / numbers.length : 0;
    }

    _calculateTrend(previousValue, currentValue) {
        if (previousValue === 0) return 0;
        return ((currentValue - previousValue) / previousValue) * 100;
    }
    
    getProductivityMetrics(metricsData) {
        try {
            const last28Days = metricsData.slice(-28);
            const productivityStats = {
                daily: [],
                summary: {
                    totalAcceptedSuggestions: 0,
                    totalSuggestions: 0,
                    totalAcceptedLines: 0,
                    totalSuggestedLines: 0,
                    averageTimePerLine: 2, // Estimación en minutos por línea de código manual
                    totalTimeSaved: 0
                }
            };

            // Analizar datos diarios
            last28Days.forEach(dayMetric => {
                const dayStats = {
                    date: dayMetric.date,
                    acceptedSuggestions: 0,
                    totalSuggestions: 0,
                    acceptedLines: 0,
                    suggestedLines: 0
                };

                if (dayMetric.copilot_ide_code_completions?.editors) {
                    dayMetric.copilot_ide_code_completions.editors.forEach(editor => {
                        if (editor.models) {
                            editor.models.forEach(model => {
                                if (model.languages) {
                                    model.languages.forEach(lang => {
                                        dayStats.acceptedSuggestions += lang.total_code_acceptances || 0;
                                        dayStats.totalSuggestions += lang.total_code_suggestions || 0;
                                        dayStats.acceptedLines += lang.total_code_lines_accepted || 0;
                                        dayStats.suggestedLines += lang.total_code_lines_suggested || 0;
                                    });
                                }
                            });
                        }
                    });
                }

                // Calcular métricas diarias
                dayStats.acceptanceRate = dayStats.totalSuggestions > 0 ?
                    (dayStats.acceptedSuggestions / dayStats.totalSuggestions * 100).toFixed(2) : 0;
                dayStats.lineAcceptanceRate = dayStats.suggestedLines > 0 ?
                    (dayStats.acceptedLines / dayStats.suggestedLines * 100).toFixed(2) : 0;
                dayStats.estimatedTimeSaved = (dayStats.acceptedLines * productivityStats.summary.averageTimePerLine);

                productivityStats.daily.push(dayStats);

                // Actualizar totales
                productivityStats.summary.totalAcceptedSuggestions += dayStats.acceptedSuggestions;
                productivityStats.summary.totalSuggestions += dayStats.totalSuggestions;
                productivityStats.summary.totalAcceptedLines += dayStats.acceptedLines;
                productivityStats.summary.totalSuggestedLines += dayStats.suggestedLines;
                productivityStats.summary.totalTimeSaved += dayStats.estimatedTimeSaved;
            });

            // Calcular métricas globales
            productivityStats.summary.acceptanceRate = 
                productivityStats.summary.totalSuggestions > 0 ?
                (productivityStats.summary.totalAcceptedSuggestions / productivityStats.summary.totalSuggestions * 100).toFixed(2) : 0;
            
            productivityStats.summary.lineAcceptanceRate = 
                productivityStats.summary.totalSuggestedLines > 0 ?
                (productivityStats.summary.totalAcceptedLines / productivityStats.summary.totalSuggestedLines * 100).toFixed(2) : 0;

            productivityStats.summary.averageTimeSavedPerDay = 
                (productivityStats.summary.totalTimeSaved / last28Days.length).toFixed(2);

            productivityStats.summary.productivityGain = 
                ((productivityStats.summary.totalAcceptedLines * 100) / 
                (productivityStats.summary.totalAcceptedLines + productivityStats.summary.totalSuggestedLines)).toFixed(2);

            return productivityStats;
        } catch (error) {
            throw new Error(`Error analizando métricas de productividad: ${error.message}`);
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
