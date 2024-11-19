import React from 'react';
import { Paper, Typography } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ChartContainer = ({ title, chart }) => {
    if (!chart || !chart.datasets) return null;

    const data = chart.labels.map((label, index) => {
        const dataPoint = { name: label };
        chart.datasets.forEach(dataset => {
            dataPoint[dataset.label] = dataset.data[index];
        });
        return dataPoint;
    });

    return (
        <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
                {title}
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {chart.datasets.map((dataset, index) => (
                        <Line
                            key={dataset.label}
                            type="monotone"
                            dataKey={dataset.label}
                            stroke={dataset.borderColor}
                            fill={dataset.backgroundColor}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </Paper>
    );
};

export default ChartContainer;
