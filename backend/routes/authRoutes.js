const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/user");

const router = express.Router();

const { body, validationResult } = require("express-validator");
const Subscription = require("../models/subscription");
const LoginAttempt = require("../models/loginAttempts");
const { encryptResponse } = require("../services/crypto");
const getClientIpAddress = require("../services/getClientIPAddress");

const jwt = require("jsonwebtoken");
const { sendVerificationLink, sendGetStarted } = require("../services/utils");

router.post(
  "/register",
  [
    body("fullName").notEmpty().withMessage("Full name is required"),
    body("email").isEmail().withMessage("Email must be valid").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
    body("dob").notEmpty().withMessage("Date of birth is required"),
    body("gender").notEmpty().withMessage("Gender is required"),
    body("occupation").notEmpty().withMessage("Occupation is required"),
    body("country").notEmpty().withMessage("Country is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = {};
      errors.array().forEach((err) => {
        formattedErrors[err.param] = err.msg;
      });
      return res.status(400).json({ errors: formattedErrors });
    }

    try {
      const { fullName, email, password, dob, gender, occupation, country } =
        req.body;

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res
          .status(400)
          .json({ errors: { email: "Email already in use" } });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // Generate a JWT verification token
      const verificationToken = jwt.sign(
        {
          fullName,
          email,
          password: hashedPassword,
          dob,
          gender,
          occupation,
          country,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "24h",
        }
      );

      // Send verification email
      sendVerificationLink(email, verificationToken);

      return res.status(201).json({
        message:
          "User registered successfully. Please check your email to verify your account.",
      });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Registration failed", details: error.message });
    }
  }
);

router.get("/verify-email", async (req, res) => {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { email, fullName, password, dob, gender, occupation, country } =
      decoded;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(201).json({ error: "User already verified" });
    }

    const user = await User.create({
      fullName,
      email,
      password,
      dob,
      gender,
      occupation,
      country,
      isVerified: true,
    });

    await Subscription.create({ userId: user.id });

    req.session.user = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
    };

    await sendGetStarted(user.email);

    res.status(200).json({ message: "Email verified successfully!" });
  } catch (error) {
    res.status(400).json({ error: "Invalid or expired token" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const ipAddress = getClientIpAddress(req);

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user || !user.isVerified) {
      return res
        .status(400)
        .json({ error: "Invalid credentials or email not verified" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    console.log("Login attempt", { email, ipAddress, status: "success" });

    await LoginAttempt.create({ email, ipAddress, status: "success" });

    req.session.user = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
    };

    res.status(200).json({
      message: "Logged in successfully",
      user: req.session.user,
    });
  } catch (error) {
    res.status(500).json({ error: "Login failed", details: error.message });
  }
});

// A protected route to fetch user profile
router.get("/profile", async (req, res) => {
  try {
    const { email } = req.session.user;
    if (!email) {
      console.log("No email", req.body);
      return res.status(400).json({ error: "Email is required" });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const profileData = {
      id: user.id,
      name: user.fullName,
      email: user.email,
      phone: user.phone,
      country: user.country,
      joinedDate: user.createdAt,
      verificationLevel: "basic",
      avatarUrl: "",
      twoFactorEnabled: false,
      lastLogin: "2025-02-18T16:42:31Z",
      preferredCurrency: "XCoin",
      language: "English",
      notifications: {
        email: true,
        sms: true,
        push: false,
        marketingEmails: false,
      },
    };

    return res.status(200).json(encryptResponse(profileData));
  } catch (error) {
    res.status(500).json({ error: "Error", details: error.message });
  }
});

router.get("/verify", (req, res) => {
  const data = { user: req.session.user };

  if (req.session && req.session.user) {
    return res.status(200).json(encryptResponse(data));
  }
  res.status(401).json({ error: "Unauthorized" });
});

// Logout route to destroy session
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: "Logout failed" });
    res.clearCookie("xc_session");
    res.status(200).json({ message: "Logged out successfully" });
  });
});

module.exports = router;
