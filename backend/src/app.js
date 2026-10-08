import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import { createServer } from "node:http";
import cors from "cors";



import connectToSocket from "./controllers/socketManager.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();
const server = createServer(app);
const io = connectToSocket(server);
app.set("io", io);

const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.use("/api/users", userRoutes);


const start = async () => {
    try {
        const url = process.env.MONGO_URI || "mongodb+srv://rawatpiyush2023_db_user:ruUfiEmt62oOOpfB@zoomclone.vhn1oyn.mongodb.net/?appName=ZoomClone";
        await mongoose.connect(url, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log("Connected to MongoDB");
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (err) {
        console.log("Error connecting to MongoDB", err.message);
        process.exit(1);
    }
}

start();