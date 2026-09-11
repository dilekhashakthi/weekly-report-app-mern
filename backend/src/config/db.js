const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database connected successfully...");
  } catch (error) {
    console.log(
      `Database connection failed...MongoDB connection error: ${error.message}`,
    );
    process.exit(1);
  }
};

module.exports = connectDB;
