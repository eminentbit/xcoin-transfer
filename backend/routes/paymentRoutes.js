const express = require("express");
const router = express.Router();
const axios = require("axios");
const Redis = require("ioredis");
const { generatePaymentReference } = require("../services/utils");
const Transaction = require("../models/transaction");
const Subscription = require("../models/subscription");
const { encryptResponse } = require("../services/crypto");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const EXCHANGE_API = "https://api.exchangerate-api.com/v4/latest/USD";

// Function to create Redis client
const createRedisClient = () => {
  const host = process.env.REDIS_HOST || "18.212.27.82";
  const port = Number(process.env.REDIS_PORT) || 6379;
  const password = process.env.REDIS_PASSWORD || "mjlsbkCh2z8Ft63";

  return new Redis({
    host,
    port,
    password,
  });
};

/**
 * @param redis
 */
let redis;

try {
  redis = createRedisClient();
  console.log("Connected to Redis successfully.");
} catch (error) {
  console.error("Failed to connect to Redis. Using fallback Redis server...");
}

router.post("/token", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const url = `${process.env.CAMPAY_BASE_URL}/api/token/`;

  const data = {
    username: process.env.CAMPAY_APP_USERNAME,
    password: process.env.CAMPAY_APP_PASSWORD,
  };

  try {
    // Check if token is already cached
    const cachedToken = await redis.get("campay_token");
    if (cachedToken || !cachedToken == null) {
      console.log("Returning cached token");
      return res.json({ token: cachedToken });
    }

    console.log("Fetching new token...");
    const response = await axios.post(url, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const token = response.data.token;

    // Store token in Redis with an expiration time (e.g., 3600 seconds = 1 hour)
    await redis.set("campay_token", token, "EX", 3600);

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching token:", error.message);
    res.status(500).json({ error: "Failed to fetch token" });
  }
});

router.post("/payment-link", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    // Retrieve the token from Redis
    const token = await redis.get("campay_token");
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const url = `${process.env.CAMPAY_BASE_URL}/api/get_payment_link/`;
    const reference = generatePaymentReference();

    // Prepare the data for the API request
    let data = {};

    if (!req.body.amount) {
      data = {
        currency: req.body.currency || "XAF",
        description: req.body.description || "Test",
        external_reference: reference,
        redirect_url: req.body.redirect_url || "https://example.com",
      };
    } else {
      data = {
        amount: req.body.amount,
        currency: req.body.currency || "XAF",
        description: req.body.description || "Test",
        external_reference: reference,
        redirect_url: req.body.redirect_url || "https://example.com",
      };
    }

    // Make the API request
    const response = await axios.post(url, data, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    });

    const transaction = await Transaction.create({
      type: "deposit",
      amount: data.amount,
      currency: data.currency,
      fee: 0,
      reference: data.external_reference,
      description: data.description,
      userId: req.session.user.id,
    });

    console.log("Transaction created:", transaction);
    res.json({ link: response.data.link, transaction });
  } catch (error) {
    // Handle errors and send a response
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
    res.status(error.response ? error.response.status : 500).json({
      error: error.response ? error.response.data : "Internal Server Error",
    });
  }
});

router.get("/:id", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const transaction = await Transaction.findOne({
      where: { id: req.params.id, userId: req.session.user.id },
    });

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/status/:ref", async (req, res) => {
  const { transactionId } = req.query;

  if (!req.session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!transactionId) {
    return res.status(400).json({ error: "Transaction Id not specified" });
  }

  try {
    // Find the transaction first to avoid unnecessary API calls
    const transaction = await Transaction.findOne({
      where: { id: transactionId },
    });

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    // Check if we already know the final status
    if (["SUCCESSFUL", "FAILED"].includes(transaction.status)) {
      return res.json({ status: transaction.status });
    }

    const token = await redis.get("campay_token");
    if (!token) {
      return res.status(401).json({ error: "API token missing" });
    }

    const url = `${process.env.CAMPAY_BASE_URL}/api/transaction/${req.params.ref}`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    // Update transaction status in database
    transaction.status = response.data.status;
    await transaction.save();

    if (transaction.status.includes("SUCCESS")) {
      const subscription = await Subscription.findOne({
        where: { userId: transaction.userId },
      });

      if (subscription) {
        await subscription.increment("balance", { by: transaction.amount });
        console.log(" Subscription balance updated for payment");
      }
    }

    // Log info about the request and response
    console.log(
      `Payment status for ${req.params.ref}: ${response.data.status}`
    );

    return res.json(response.data);
  } catch (error) {
    console.error(
      `Payment status check failed for ${req.params.ref}:`,
      error.message
    );

    const statusCode = error.response?.status || 500;
    const errorMessage =
      error.response?.data?.error || error.message || "Internal Server Error";

    return res.status(statusCode).json({
      error: errorMessage,
      reference: req.params.ref,
    });
  }
});

router.get("/callback", (req, res) => {
  const {
    status,
    reference,
    amount,
    currency,
    operator,
    code,
    operator_reference,
    signature,
    endpoint,
    external_reference,
    external_user,
    extra_first_name,
    extra_last_name,
    extra_email,
    phone_number,
  } = req.query;

  console.log("Testing...");

  // Basic validation for required parameters
  if (!status || !reference || !amount || !currency || !signature) {
    return res.status(400).json({
      error:
        "Missing required parameters: status, reference, amount, currency, or signature",
    });
  }

  // Validate the amount (should be a number)
  if (isNaN(amount)) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  // Validate the UUID format for reference
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(reference)) {
    return res.status(400).json({ error: "Invalid reference format" });
  }

  // Validate the JWT token
  try {
    const decoded = jwt.verify(signature, process.env.CAMPAY_WEBHOOK_KEY);
    // Process the transaction based on status
    console.log("Transaction Details:", {
      status,
      reference,
      amount,
      currency,
      operator,
      code,
      operator_reference,
      endpoint,
      external_reference,
      external_user,
      extra_first_name,
      extra_last_name,
      extra_email,
      phone_number,
    });

    return res.status(200).json({ message: "Callback received successfully" });
  } catch (err) {
    return res.status(401).json({ error: "Invalid signature" });
  }
});

// Payment Processing Route
router.post("/pay", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ Error: "Unauthorized" });
    }

    const { amount, from, description } = req.body;

    // Validate required fields
    if (!amount || isNaN(parseInt(amount))) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid amount." });
    }
    if (!from || isNaN(parseInt(from))) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid phone number." });
    }
    if (!description) {
      return res
        .status(400)
        .json({ success: false, message: "Description is required." });
    }

    const subscription = await Subscription.findOne({
      where: { userId: req.session.user.id },
    });

    console.log(subscription);

    // Payment provider API request
    const paymentAPIUrl = `${process.env.CAMPAY_BASE_URL}/api/collect/`;

    const makeRequest = async () => {
      const token = await redis.get("campay_token");
      console.log("Token:", token);

      const data = {
        amount: amount,
        from: from,
        description: description,
        currency: "XAF",
        external_reference: generatePaymentReference(),
      };

      try {
        const response = await axios.post(paymentAPIUrl, data, {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (process.env.NODE_ENV.includes("dev")) {
          console.log("Response:", response.data);
        }

        const transaction = await Transaction.create({
          type: "deposit",
          amount: data.amount,
          currency: data.currency,
          fee: 0,
          external_reference: data.external_reference,
          description: response.data.description,
          userId: req.session.user.id,
        });

        console.log("Transaction created", transaction);

        return res.status(200).json(
          encryptResponse({
            success: true,
            message: "Payment processed successfully",
            ...response.data,
            id: transaction.id,
          })
        );
      } catch (error) {
        console.log(
          "Error:",
          error.response ? error.response.data : error.message
        );
      }
    };

    makeRequest();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.response?.data?.message || "Payment processing failed",
    });
  }
});

router.post("/campay/withdraw", async (req, res) => {
  const { amount, to, description } = req.body;

  if (!req.session.user) {
    return res.status(401).json({ Error: "Unauthorized" });
  }

  const token = await redis.get("campay_token");

  // Validate input
  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: "Invalid amount" });
  }
  if (!to || !/^\d+$/.test(to)) {
    return res.status(400).json({ error: "Invalid phone number" });
  }
  if (!description || description.trim() === "") {
    return res.status(400).json({ error: "Description is required" });
  }

  const reference = uuidv4();

  try {
    console.log(amount, Math.round(parseFloat(amount)));
    const response = await axios.post(
      `${process.env.CAMPAY_BASE_URL}/api/withdraw/`,
      {
        // username: process.env.CAMPAY_APP_USERNAME,
        // password: process.env.CAMPAY_APP_PASSWORD,
        amount: Math.round(parseFloat(amount)),
        to: parseInt(to),
        description,
        external_reference: reference,
      },
      {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
      success: true,
      message: "Withdrawal request sent",
      data: response.data,
    });
  } catch (error) {
    console.error("Withdrawal error:", error.response?.data || error.message);
    res.status(500).json({
      error: "Failed to process withdrawal",
      details: error.response?.data || error.message,
    });
  }
});

router.get("/data/rates", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "You are not authorized" });
  }

  try {
    // Check if exchange rates are already cached
    const cachedData = await redis.get("exchange_rates");
    let exchangeRates;
    let needsFresh = true;
    let lastUpdated;

    if (cachedData) {
      const cachedObj = JSON.parse(cachedData);
      exchangeRates = cachedObj.rates;

      // Check if we need to refresh the data based on timestamp
      lastUpdated = cachedObj.time_last_updated;
      const currentTime = Math.floor(Date.now() / 1000); // Current time in Unix timestamp (seconds)

      // If the data is less than 24 hours old, use the cached data
      if (lastUpdated && currentTime - lastUpdated < 86400) {
        needsFresh = false;
      }
    }

    if (needsFresh) {
      // Fetch new exchange rates from API
      const response = await axios.get(EXCHANGE_API);
      exchangeRates = response.data.rates;
      lastUpdated =
        response.data.time_last_updated || Math.floor(Date.now() / 1000);

      // Store both rates and timestamp in Redis with a 24-hour expiration
      const dataToCache = {
        rates: exchangeRates,
        time_last_updated: lastUpdated,
      };

      await redis.set(
        "exchange_rates",
        JSON.stringify(dataToCache),
        "EX",
        86400
      );
    }

    // Define the base value of XCoin in USD
    const xcoinToUsd = 0.74;

    if (exchangeRates && exchangeRates.USD) {
      // Create the expected format: { xcoin: { rmb: value, fcfa: value, usd: value } }
      const xcoinRates = {
        xcoin: {
          // For RMB (Chinese Yuan/CNY)
          rmb: parseFloat(
            (xcoinToUsd * (exchangeRates.CNY || exchangeRates.RMB)).toFixed(2)
          ),

          // For FCFA (CFA Franc/XOF)
          fcfa: parseFloat(
            (xcoinToUsd * (exchangeRates.XOF || exchangeRates.FCFA)).toFixed(2)
          ),

          // Direct USD value
          usd: xcoinToUsd,
        },
      };

      return res.json({
        rates: xcoinRates,
        lastUpdated,
      });
    } else {
      // If the API doesn't provide USD as base or we don't have rates,
      // we need to handle this case with hardcoded default rates
      return res.json({
        rates: {
          xcoin: {
            rmb: 5.42,
            fcfa: 467.52,
            usd: 0.74,
          },
        },
        lastUpdated,
      });
    }
  } catch (error) {
    console.log("Exchange rate error:", error);
    // Return default fallback rates in case of any error
    return res.status(500).json({
      error: "Error fetching exchange rate",
      rates: {
        xcoin: {
          rmb: 5.42,
          fcfa: 467.52,
          usd: 0.74,
        },
      },
      lastUpdated: Math.floor(Date.now() / 1000),
    });
  }
});

module.exports = router;
