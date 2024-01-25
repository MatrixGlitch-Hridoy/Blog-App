import { app } from "./app.js";
import connectDB from "./db/db.js";
import "dotenv/config";

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
  connectDB();
});
