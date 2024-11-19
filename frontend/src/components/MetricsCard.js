import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const MetricsCard = ({ title, value, subtitle }) => {
    return (
        <Card>
            <CardContent>
                <Typography color="textSecondary" gutterBottom>
                    {title}
                </Typography>
                <Typography variant="h5" component="div">
                    {value}
                </Typography>
                <Typography color="textSecondary">
                    {subtitle}
                </Typography>
            </CardContent>
        </Card>
    );
};

export default MetricsCard;
