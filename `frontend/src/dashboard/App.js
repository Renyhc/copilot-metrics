import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline, Box } from '@mui/material';
import Menu from './components/Menu';
import Dashboard from './components/Dashboard';
import Charts from './components/Charts';
import Tables from './components/Tables';
import Cards from './components/Cards';

function App() {
    return (
        <Router>
            <CssBaseline />
            <Box sx={{ display: 'flex' }}>
                <Menu />
                <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/charts" element={<Charts />} />
                        <Route path="/tables" element={<Tables />} />
                        <Route path="/cards" element={<Cards />} />
                    </Routes>
                </Box>
            </Box>
        </Router>
    );
}

export default App;
