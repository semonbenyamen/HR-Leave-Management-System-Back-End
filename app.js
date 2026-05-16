require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");

// Importing the User model
const User = require("./models/User");
const port = process.env.PORT || 5000;

app.use(express.json());

// Database connection
async function DB_Connection() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");
  } catch (error) {
  console.error("Error connecting to MongoDB:", error.message);
  process.exit(1);
}
}

// Call the database connection function
DB_Connection();
// Middleware

// Routes
const authRoutes = require("./routes/authRouters");
const leaveRequestRoutes = require("./routes/leaveRequestRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/leave-requests", leaveRequestRoutes);

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
