const express = require('express');
const app = express();
const userRoutes = require('./api/routes/userRoutes');
const lockerRoutes = require('./api/routes/lockerRoutes');
const authenticationRoutes = require('./api/routes/authRoutes');
const Dashboard = require('./api/routes/dashboardRoutes');
const dotenv = require('dotenv');

dotenv.config();
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/lockers', lockerRoutes);
app.use('/api/auth', authenticationRoutes);
app.use('/api/dashboard', Dashboard);

module.exports = app;