import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Typography } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BarChartIcon from '@mui/icons-material/BarChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import { Link } from 'react-router-dom';

const drawerWidth = 240;

const Menu = () => {
    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
            }}
        >
            <Toolbar>
                <Typography variant="h6" noWrap>
                    Dashboard
                </Typography>
            </Toolbar>
            <List>
                <ListItem button component={Link} to="/">
                    <ListItemIcon>
                        <DashboardIcon />
                    </ListItemIcon>
                    <ListItemText primary="Inicio" />
                </ListItem>
                <ListItem button component={Link} to="/charts">
                    <ListItemIcon>
                        <BarChartIcon />
                    </ListItemIcon>
                    <ListItemText primary="Gráficos" />
                </ListItem>
                <ListItem button component={Link} to="/tables">
                    <ListItemIcon>
                        <TableChartIcon />
                    </ListItemIcon>
                    <ListItemText primary="Tablas" />
                </ListItem>
                <ListItem button component={Link} to="/cards">
                    <ListItemIcon>
                        <CreditCardIcon />
                    </ListItemIcon>
                    <ListItemText primary="Cards" />
                </ListItem>
            </List>
        </Drawer>
    );
};

export default Menu;
