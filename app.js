require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');


// Importing the User model
const User = require('./Models/User');
const port = process.env.PORT || 5000;

app.use(express.json());

// Database connection
async function DB_Connection() {
    try{
        await mongoose.connect(process.env.MONGO_URL)
            console.log("Connected to MongoDB");

   }
    catch(error){
        console.log("Error connecting to MongoDB", error);
    }};




// Call the database connection function
DB_Connection();
// Middleware


// Routes
const authRoutes = require('./Routes/authRouters');
const leaveRequestRoutes = require('./Routes/leaveRequestRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/leave-requests', leaveRequestRoutes);


app.listen( port, () => {
    console.log(`Server is running on port ${port}`);
});
