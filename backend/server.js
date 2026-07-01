// server.js

import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import path from 'path';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { validateApiKeys } from "./config/api.js";
import { connectDB } from "./config/db.js";
import pestRoutes from "./routes/pest.routes.js";

import analyticsRoutes from "./routes/analytics.routes.js";
import auditLogRoutes from "./routes/auditLog.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import cropRoutes from "./routes/crop.routes.js";
import farmRoutes from "./routes/farm.routes.js";
import farmConditionRoutes from "./routes/farmCondition.routes.js";
import forumRoutes from "./routes/forum.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import orderRoutes from "./routes/order.routes.js";
import productRoutes from "./routes/product.routes.js";
import qaRoutes from "./routes/qa.routes.js";
import taskRoutes from "./routes/task.routes.js";
import userRoute from "./routes/user.route.js";

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const app = express();

// Trust proxy so rate limiter sees real client IPs behind Render's reverse proxy
app.set('trust proxy', 1);

// Configure CORS — only allow the frontend origin
const corsOrigin = process.env.CORS_ORIGIN;

app.use(cors({
    origin: (origin, callback) => {
        // Allow non-browser requests (curl, server-side) when origin is undefined
        if (!origin) return callback(null, true);
        if (origin === corsOrigin) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));

const PORT = process.env.PORT || 5000;

app.use(express.json()); // allows us to accept json data in the req.body.
app.use(cookieParser()); // Add this middleware after express.json()

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 8,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, msg: 'Too many requests, please try again later.' }
});

const cartLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 150,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, msg: 'Too many cart requests, please try again later.' }
});

const orderLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, msg: 'Too many order requests, please try again later.' }
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Apply rate limiting protections on auth and commerce endpoints
app.use('/api/users/login', authLimiter);
app.use('/api/users/register', authLimiter);
app.use('/api/cart', cartLimiter);
app.use('/api/orders', orderLimiter);

app.use("/api/farms", farmRoutes);
app.use("/api/crops", cropRoutes);

app.use("/api/farm-conditions", farmConditionRoutes);

app.use("/api/users", userRoute);
app.use("/api/cart", cartRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/forum", forumRoutes);
app.use("/api/qa", qaRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/audit-logs", auditLogRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api", pestRoutes);


// Health check (safe — no sensitive info)
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Catch unknown routes and return a standard 404 response
app.use((req, res) => {
    res.status(404).json({ success: false, msg: 'Endpoint not found' });
});

// Centralized error handler — never expose stack traces to clients
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(err.status || 500).json({
        success: false,
        msg: err.expose ? err.message : 'Internal Server Error'
    });
});

// Production-safe startup: connect to MongoDB first, then start Express
const startServer = async () => {
    try {
        // Connect to MongoDB before starting server
        await connectDB();
        
        // Validate API keys after DB connection
        validateApiKeys();
        
        // Start Express server after successful DB connection
        app.listen(PORT, () => {
            console.log('\n🚀 Server started successfully');
            console.log(`   Server running at http://localhost:${PORT}`);
            console.log('   Static files served from: /uploads\n');
        });
    } catch (error) {
        console.error('\n❌ Server startup failed:', error.message);
        process.exit(1);
    }
};

// Initialize server
startServer();
