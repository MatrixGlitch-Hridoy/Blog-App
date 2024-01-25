import mongoose from "mongoose";
import "dotenv/config";

const dbUrl = process.env.DB_URL || "";

const connectDB = async () => {
  try {
    await mongoose.connect(dbUrl).then((data) => {
      console.log(`Database is connect with ${data.connection.host}`);
    });
  } catch (err) {
    console.log(err.message);
    setTimeout(connectDB, 5000);
  }
};

export default connectDB;
