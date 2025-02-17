const express = require ('express');
const app = express();
const userRoutes = require('./api/routes/userRoute');
const lockerRoutes = require('./api/routes/lockerRoute');

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/lockers', lockerRoutes);

module.exports = app;