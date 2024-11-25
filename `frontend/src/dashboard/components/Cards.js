import React from 'react';
import { Grid, Card, CardContent, Typography } from '@mui/material';

const Cards = () => {
    return (
        <div>
            <Typography variant="h4" gutterBottom>
                Cards
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Total Usuarios
                            </Typography>
                            <Typography variant="h5" component="div">
                                10,240
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Ingresos Mensuales
                            </Typography>
                            <Typography variant="h5" component="div">
                                $25,000
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Nuevos Registros
                            </Typography>
                            <Typography variant="h5" component="div">
                                512
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </div>
    );
};

export default Cards;
