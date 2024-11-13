const express = require('express');
const copilotRoutes = require('./routes/copilotRoutes');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/copilot', copilotRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
