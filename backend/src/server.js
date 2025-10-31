import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import notesRoutes from "./routes/notesRoutes.js";
import { connectDB } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

// --- Cors: make sure preflight is handled BEFORE rate limiter ---
if (process.env.NODE_ENV !== "production") {
    // allow dev origin
    app.use(cors({
        origin: "http://localhost:5173",
        credentials: true,
    }));

    // Ensure OPTIONS preflight is handled
    app.options("*", cors({
        origin: "http://localhost:5173",
        credentials: true,
    }));
} else {
    // In production, allow your production origin or configure appropriately
    app.use(cors());
    app.options("*", cors());
}

app.use(express.json()); // parse JSON bodies

// Ensure rateLimiter middleware itself skips OPTIONS requests (best practice)
app.use((req, res, next) => {
    if (req.method === "OPTIONS") return next(); // skip rate limiter for preflight
    return next();
});

app.use(rateLimiter);

app.use("/api/notes", notesRoutes);

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    });
}

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log("Server started on PORT:", PORT);
    });
});
