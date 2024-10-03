import express from "express";
import { connectDB } from "./db/connection.js";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import cors from "cors";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors);

app.use("/api/auth", authRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  connectDB();
  console.log(`Listen to port ${port}`);
});
