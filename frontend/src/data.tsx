import { Transaction, UserProfile } from "./types";

export const mockTransactions: Transaction[] = [
  {
    id: "TX12345678",
    date: "2025-02-18T14:35:26Z",
    type: "buy",
    amount: 500,
    currency: "XCoin",
    fee: 2.5,
    status: "completed",
    reference: "PO-78945612",
  },
  {
    id: "TX12345679",
    date: "2025-02-17T09:22:15Z",
    type: "convert",
    amount: 200,
    currency: "XCoin",
    targetAmount: 1400,
    targetCurrency: "RMB",
    fee: 1,
    status: "completed",
    reference: "CV-45678932",
  },
  {
    id: "TX12345680",
    date: "2025-02-15T16:48:33Z",
    type: "withdraw",
    amount: 150,
    currency: "XCoin",
    fee: 0.75,
    status: "completed",
    reference: "WD-32165498",
  },
  {
    id: "TX12345681",
    date: "2025-02-14T11:12:09Z",
    type: "deposit",
    amount: 1000,
    currency: "XCoin",
    fee: 0,
    status: "completed",
    reference: "DP-65432198",
  },
  {
    id: "TX12345682",
    date: "2025-02-12T08:56:41Z",
    type: "sell",
    amount: 75,
    currency: "XCoin",
    targetAmount: 525,
    targetCurrency: "RMB",
    fee: 1.5,
    status: "completed",
    reference: "SO-98765432",
  },
  {
    id: "TX12345683",
    date: "2025-02-10T15:18:22Z",
    type: "convert",
    amount: 300,
    currency: "XCoin",
    targetAmount: 165000,
    targetCurrency: "FCFA",
    fee: 1.5,
    status: "completed",
    reference: "CV-12378945",
  },
  {
    id: "TX12345684",
    date: "2025-02-09T10:05:17Z",
    type: "buy",
    amount: 250,
    currency: "XCoin",
    fee: 1.25,
    status: "completed",
    reference: "PO-45612378",
  },
  {
    id: "TX12345685",
    date: "2025-02-07T19:33:56Z",
    type: "withdraw",
    amount: 100,
    currency: "XCoin",
    fee: 0.5,
    status: "failed",
    reference: "WD-78945612",
    description: "Insufficient funds",
  },
  {
    id: "TX12345686",
    date: "2025-02-05T12:29:14Z",
    type: "deposit",
    amount: 800,
    currency: "XCoin",
    fee: 0,
    status: "completed",
    reference: "DP-36985214",
  },
  {
    id: "TX12345687",
    date: "2025-02-03T08:47:30Z",
    type: "convert",
    amount: 150,
    currency: "XCoin",
    targetAmount: 1050,
    targetCurrency: "RMB",
    fee: 0.75,
    status: "completed",
    reference: "CV-85214796",
  },
  {
    id: "TX12345688",
    date: "2025-02-01T16:51:08Z",
    type: "sell",
    amount: 50,
    currency: "XCoin",
    targetAmount: 350,
    targetCurrency: "RMB",
    fee: 1,
    status: "completed",
    reference: "SO-74125896",
  },
  {
    id: "TX12345689",
    date: "2025-01-30T11:24:37Z",
    type: "buy",
    amount: 300,
    currency: "XCoin",
    fee: 1.5,
    status: "pending",
    reference: "PO-96325874",
  },
];

export const mockProfile: UserProfile = {
  id: "USR38429571",
  name: "Jennis Mike",
  email: "jennis44@gmail.com",
  phone: "+1 (555) 123-4567",
  country: "China",
  joinedDate: "2023-07-15T08:30:00Z",
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
