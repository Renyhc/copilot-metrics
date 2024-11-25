import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const Charts = () => {
    const barData = {
        labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo'],
        datasets: [
            {
                label: 'Ventas',
                data: [5000, 7000, 8000, 6000, 9000],
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
        ],
    };

    const pieData = {
        labels: ['Marketing', 'Ventas', 'Desarrollo', 'Soporte'],
        datasets: [
            {
                label: 'Distribución de Equipo',
                data: [300, 50, 100, 50],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                ],
            },
        ],
    };

    return (
        <div>
            <Typography variant="h4" gutterBottom>
                Gráficos
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Ventas Mensuales
                        </Typography>
                        <Bar data={barData} />
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Distribución de Equipo
                        </Typography>
                        <Pie data={pieData} />
                    </Paper>
                </Grid>
            </Grid>
        </div>
    );
};

export default Charts;
