import React, { useState, useEffect } from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Dashboard from './components/Dashboard';
import api from './services/api';

const theme = createTheme();

function App() {
    const [metrics, setMetrics] = useState(null);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const data = await api.getOrgMetrics();
                setMetrics(data);
            } catch (error) {
                console.error('Error fetching metrics:', error);
            }
        };

        fetchMetrics();
    }, []);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Dashboard metrics={metrics} />
        </ThemeProvider>
    );
}

export default App;
