import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import MetricsCard from './MetricsCard';

const Dashboard = () => {
    return (
        <div>
            <Typography variant="h4" gutterBottom>
                Panel de Control
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricsCard title="Usuarios Activos" value="1,024" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricsCard title="Ventas" value="$25,000" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricsCard title="Nuevos Registros" value="512" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricsCard title="Ingresos" value="$50,000" />
                </Grid>
            </Grid>
        </div>
    );
};

export default Dashboard;
