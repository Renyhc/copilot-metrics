import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const MetricsCard = ({ title, value }) => {
    return (
        <Card>
            <CardContent>
                <Typography color="textSecondary" gutterBottom>
                    {title}
                </Typography>
                <Typography variant="h5" component="div">
                    {value}
                </Typography>
            </CardContent>
        </Card>
    );
};

export default MetricsCard;
