import React from 'react';
import { Box, Container, Grid, Paper, Typography } from '@mui/material';
import MetricsCard from './MetricsCard';
import ChartContainer from './ChartContainer';

const Dashboard = ({ metrics }) => {
    if (!metrics) return <Typography>Cargando métricas...</Typography>;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
                {/* Resumen General */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Resumen General
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={3}>
                                <MetricsCard
                                    title="Tasa de Aceptación"
                                    value={`${metrics.summary?.overall?.acceptanceRateAverage || 0}%`}
                                    subtitle="Promedio general"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <MetricsCard
                                    title="Líneas Aceptadas"
                                    value={metrics.summary?.overall?.totalLinesAccepted || 0}
                                    subtitle="Total"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <MetricsCard
                                    title="Usuarios Activos"
                                    value={metrics.summary?.overall?.activeUsers || 0}
                                    subtitle="Promedio"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <MetricsCard
                                    title="Tiempo Ahorrado"
                                    value={metrics.productivityAnalysis?.charts?.summary?.totalTimeSaved || '0 horas'}
                                    subtitle="Total estimado"
                                />
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Gráficos */}
                <Grid item xs={12} md={6}>
                    <ChartContainer
                        title="Tendencia de Aceptación"
                        chart={metrics.productivityAnalysis?.charts?.acceptanceTrend}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <ChartContainer
                        title="Tiempo Ahorrado"
                        chart={metrics.productivityAnalysis?.charts?.timeSavings}
                    />
                </Grid>
                <Grid item xs={12}>
                    <ChartContainer
                        title="Productividad Acumulada"
                        chart={metrics.productivityAnalysis?.charts?.cumulativeProductivity}
                    />
                </Grid>
            </Grid>
        </Container>
    );
};

export default Dashboard;
