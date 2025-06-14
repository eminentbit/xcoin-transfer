const { DataTypes } = require("sequelize");
const { sequelize } = require("../services/db");
const Card = require("./card");

const PendingUser = sequelize.define(
  "user",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    role: {
      type: DataTypes.ENUM("admin", "client"),
      defaultValue: "client",
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dob: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gender: {
      type: DataTypes.ENUM("male", "female"),
      allowNull: false,
    },
    occupation: {
      type: DataTypes.ENUM("working", "student"),
      allowNull: false,
    },
    institution: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    joinedDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    verificationLevel: {
      type: DataTypes.ENUM("unverified", "verified"),
      defaultValue: "unverified",
    },
    avatarUrl: {
      type: DataTypes.STRING, // Store URL or file path
      allowNull: true,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    verificationToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    twoFactorEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    preferredCurrency: {
      type: DataTypes.STRING,
      defaultValue: "FCFA",
    },
    language: {
      type: DataTypes.STRING,
      defaultValue: "en",
    },
    sendEmailNotifcations: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: true,
    },
    sendSMSNotifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: true,
    },
    sendPushNotifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: true,
    },
    sendMarketingEmails: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);

User.belongsTo(Card, { foreignKey: "cardId" });
Card.hasMany(User, { foreignKey: "cardId" });

module.exports = PendingUser;
