const express = require("express");
const { connectDB, sequelize } = require("./services/db");
const userRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminRoutes = require("./routes/adminRoutes");
require("dotenv").config();
const cors = require("cors");
const session = require("express-session");
const RedisStore = require("connect-redis").default;
const Redis = require("ioredis");
const MemoryStore = require("memorystore")(session);

const app = express();

app.use(express.json());

// Connect to the database.
connectDB();

// Create Redis client with retry strategy
const createRedisClient = () => {
  const redisClient = new Redis({
    host: process.env.REDIS_HOST || "18.212.27.82",
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || "mjlsbkCh2z8Ft63",
    retryStrategy: function(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    connectTimeout: 10000,
  });

  redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });

  redisClient.on('connect', () => {
    console.log('Successfully connected to Redis');
  });

  return redisClient;
};

let redisClient;
let sessionStore;

try {
  redisClient = createRedisClient();
  sessionStore = new RedisStore({ client: redisClient });
  console.log("Using Redis store for sessions");
} catch (error) {
  console.error("Failed to connect to Redis, falling back to memory store:", error);
  sessionStore = new MemoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  });
}

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://xcoin-transfer.vercel.app",
    process.env.FRONTEND_URL,
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Sync models with the database.
sequelize.sync({ alter: false }).then(() => {
  console.log("Database synced successfully!");
});

app.use(cors(corsOptions));

// Set up session middleware with fallback
app.use(
  session({
    name: "xc_session",
    store: sessionStore,
    secret: process.env.SESSION_SECRET || "somesecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 4, // 4 hours
    },
  })
);

// Use routes.
app.use("/api/auth", userRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api", (req, res) => {
  res.json({ message: "Url is working well" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
