import { useState, useEffect, FormEvent } from "react";
import Sidebar from "../components/Sidebar";
import DashboardHeader from "../components/DashboardHeader";
import { Card, Subscription, Transaction } from "../utils/types";
import axios from "axios";
import WalletBalanceCard from "../components/WalletBalanceCard";
import getToken from "../utils/GetCampayToken";
import PaymentModal from "../components/PaymentModal";
import useModal from "../components/UseModal";
import { decryptData, isEncryptedResponse } from "../utils/CryptoService";
import ConvertXcoinModal from "@/components/ConvertXcoinModal";

function UserDashboard() {
  // For the wallet conversion functionality
  const [rmbValue, setRmbValue] = useState(0);
  const { isOpen, openModal, closeModal } = useModal();
  const [currency, setCurrency] = useState("fcfa");
  const [amount, setAmount] = useState("");
  const [buyAmt, setBuyAmt] = useState("");
  const [buyCurrency, setBuyCurrency] = useState("");
  const [transactions, setTransactions] = useState<Transaction[] | null>();
  const [cardDetails, setCardDetails] = useState<Card>({
    balance: 0,
    subscriptionType: "standard",
    rate: 0,
  });

  // Store rates for different currencies
  const [rates, setRates] = useState<Record<string, number>>({
    fcfa: 0,
    rmb: 0,
    usd: 0,
  });

  const sortedTransactions = transactions
    ?.slice() // Create a shallow copy to avoid mutating the original array
    .sort((a, b) => a.amount - b.amount);

  const limitedTransactions = sortedTransactions?.slice(0, 3);

  // Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const url = `${import.meta.env.VITE_ROOT_URL}/transactions`;
        const response = await axios.get(url, { withCredentials: true });
        if (isEncryptedResponse(response.data)) {
          const decryptedData: Transaction[] = await decryptData(response.data);
          setTransactions(decryptedData);
        } else {
          setTransactions(response.data);
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };
    fetchTransactions();
  }, []);

  // Fetch rates for different currencies
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const url = `${import.meta.env.VITE_ROOT_URL}/payments/data/rates`;
        const response = await axios.get(url, { withCredentials: true });

        let ratesData;
        if (isEncryptedResponse(response.data)) {
          ratesData = await decryptData(response.data);
        } else {
          ratesData = response.data;
        }

        setRates(ratesData.rates.xcoin || { fcfa: 550, rmb: 10.5, usd: 0.74 });
      } catch (error) {
        console.error("Error fetching rates:", error);
        // Set fallback rates
        setRates({ fcfa: 550, rmb: 10.5 });
      }
    };
    fetchRates();
  }, []);

  // Fetch subscription data
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const url = `${import.meta.env.VITE_ROOT_URL}/subscriptions`;
        const response = await axios.get(url, { withCredentials: true });

        if (isEncryptedResponse(response.data)) {
          const decryptedData: Card = await decryptData(response.data);
          setCardDetails(decryptedData);
        } else {
          setCardDetails(response.data);
        }
      } catch (error) {
        console.error("Error fetching subscription:", error);
      }
    };

    fetchSubscription();
  }, []);

  // Update conversion value when amount or currency changes
  useEffect(() => {
    const xcoinAmount = parseFloat(amount);
    if (!isNaN(xcoinAmount) && rates[currency]) {
      setRmbValue(xcoinAmount * rates[currency]);
    } else {
      setRmbValue(0);
    }
  }, [amount, currency, rates]);

  const handleConvertConfirm = (data: {
    username?: string;
    amount: number;
    phone?: string;
  }) => {
    // Prepare API call data based on destination currency
    const conversionData =
      currency === "fcfa"
        ? {
            convertedAmount: data.amount,
            phoneNum: data.phone,
            toCurrency: currency,
            fromCurrency: "Xcoin",
            amount: parseFloat(amount),
          }
        : {
            convertedAmount: data.amount,
            username: data.username,
            toCurrency: currency,
            fromCurrency: "Xcoin",
            amount: parseFloat(amount),
          };

    axios
      .post(
        `${import.meta.env.VITE_ROOT_URL}/transactions/request`,
        conversionData,
        {
          withCredentials: true,
        }
      )
      .then((response) => {
        if (import.meta.env.DEV) {
          console.log(response);
        }
        if (currency === "fcfa") {
          alert(
            `Successfully converted ${data.amount} XCoin to ${currency} for phone ${data.phone}`
          );
        } else {
          alert(
            `Successfully converted ${data.amount} XCoin to ${currency} for user ${data.username}`
          );
        }
      })
      .catch((error) => {
        console.error("Conversion failed:", error);
        alert("Failed to process conversion. Please try again.");
      })
      .finally(() => {
        // Close the modal regardless of outcome
        setShowConvertModal(false);
      });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);
  };

  const [showConvertModal, setShowConvertModal] = useState<boolean>(false);

  const handleBuyXcoin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Access form data
    const form = event.currentTarget;
    const accountType = (form.elements.namedItem("method") as HTMLInputElement)
      .value;
    const amount = (form.elements.namedItem("amount") as HTMLInputElement)
      .value;

    if (accountType.toLowerCase().includes("momo")) {
      if (import.meta.env.DEV) {
        console.log("MTN MoMo selected");
      }
      openModal();
      await getToken();
      setBuyAmt(amount);
      setBuyCurrency("XAF");
    } else if (accountType.toLowerCase().includes("wechat")) {
      if (import.meta.env.DEV) {
        console.log("Alipay/WeChat selected");
      }
      // Handle WeChat payment flow
      setBuyAmt(amount);
      setBuyCurrency("RMB");
      // Implement WeChat specific payment flow here
    }
  };

  // Subscription state
  const [subscription, setSubscription] = useState<Subscription | null>({
    type: "standard",
    trialEnd: null,
  });

  const [isExpired, setIsExpired] = useState(false);

  const changeCurrency = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    setShowConvertModal(true);
  };

  // Fetch subscription status
  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        const url = `${import.meta.env.VITE_ROOT_URL}/subscriptions`;
        const response = await axios.get(url, { withCredentials: true });

        if (response.status >= 300) {
          throw new Error("Failed to fetch subscription");
        }

        if (isEncryptedResponse(response.data)) {
          const data: { type: string; trialEnd?: string } = await decryptData(
            response.data
          );
          setSubscription({
            type: data.type,
            trialEnd: data.trialEnd ? new Date(data.trialEnd) : null,
          });
        } else {
          const data = response.data;
          setSubscription({
            type: data.type,
            trialEnd: data.trialEnd ? new Date(data.trialEnd) : null,
          });
        }
      } catch (error) {
        console.error("Error fetching subscription status:", error);
      }
    };

    fetchSubscriptionStatus();
  }, []);

  // Check if subscription is expired
  useEffect(() => {
    if (subscription?.type !== "standard" && subscription?.trialEnd) {
      const now = new Date();
      setIsExpired(now > subscription.trialEnd);
    } else {
      setIsExpired(false);
    }
  }, [subscription]);

  const handleUpgrade = () => {
    // Implement upgrade flow
    alert("Redirecting to payment/upgrade flow...");
  };

  return (
    <div className="flex h-screen bg-gray-50 max-sm:p-3 max-sm:mt-6">
      <Sidebar />
      <main className="flex-1 p-6 max-w-screen-lg mx-auto">
        {/* Header */}
        <DashboardHeader />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Wallet Balance Card */}
          <WalletBalanceCard
            balance={cardDetails.balance}
            subscriptionType={cardDetails.subscriptionType}
            isExpired={isExpired}
          />

          {/* Currency Conversion Card */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex flex-row justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-700">
                Convert XCoin to:
              </h3>
              <select
                title="destCurrency"
                name="destCurrency"
                id="destCurrency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toLowerCase())}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="fcfa">FCFA</option>
                <option value="rmb">RMB</option>
              </select>
            </div>

            <form className="space-y-4" onSubmit={changeCurrency}>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700"
              >
                Amount in XCoin
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                placeholder="Enter amount"
                value={amount}
                onChange={handleAmountChange}
                min={0}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-gray-700">
                Equivalent in {currency.toUpperCase()}:{" "}
                <strong>{rmbValue.toFixed(2)}</strong>
              </p>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium w-full shadow-md"
              >
                Convert Now
              </button>
            </form>
          </div>

          {/* Buy XCoin Card */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-medium text-gray-700 mb-4">
              Buy XCoin
            </h3>
            <form className="space-y-4" onSubmit={handleBuyXcoin}>
              <label
                htmlFor="paymentMethod"
                className="block text-sm font-medium text-gray-700"
              >
                Payment Method
              </label>
              <select
                name="method"
                id="paymentMethod"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              >
                <option value="momo">MTN MoMo</option>
                <option value="wechat">Alipay/WeChat</option>
                <option value="bankTransfer" disabled>
                  Bank Transfer
                </option>
              </select>
              <input
                type="number"
                id="amount"
                name="amount"
                value={buyAmt}
                onChange={(e) => setBuyAmt(e.target.value)}
                placeholder="Enter amount"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium w-full shadow-md"
              >
                Buy Now
              </button>
            </form>
          </div>

          {/* Transaction History Table */}
          <div className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto col-span-1 md:col-span-2 w-[150%] max-sm:w-full">
            <h3 className="text-lg font-medium text-gray-700 mb-4">
              Transaction History
            </h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left text-gray-700">Date</th>
                  <th className="p-3 text-left text-gray-700">
                    Amount (XCoin)
                  </th>
                  <th className="p-3 text-left text-gray-700">Amount</th>
                  <th className="p-3 text-left text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {limitedTransactions?.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="p-3">{transaction.date}</td>
                    <td className="p-3">{transaction.amount}</td>
                    <td className="p-3">{transaction.targetAmount}</td>
                    <td className="p-3">
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {!limitedTransactions?.length && (
                  <tr>
                    <td colSpan={4} className="p-3 text-center text-gray-500">
                      No transaction history available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Subscription/Upgrade Card */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-medium text-gray-700 mb-4">
              Subscription Options
            </h3>
            <div className="space-y-4">
              <label
                htmlFor="subscriptionType"
                className="block text-sm font-medium text-gray-700"
              >
                Select Card Type
              </label>
              <select
                id="subscriptionType"
                value={subscription?.type}
                onChange={(e) => {
                  const newType = e.target.value;
                  setSubscription({
                    ...subscription,
                    type: newType,
                    trialEnd:
                      newType === "standard"
                        ? null
                        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                  });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              >
                <option value="standard">Standard (Free)</option>
                <option value="premium">Premium</option>
                <option disabled value="business">
                  Business
                </option>
              </select>

              {subscription?.type === "standard" ? (
                <div>
                  <p className="text-green-600">
                    Enjoy your {subscription.type} plan!
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleUpgrade}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium w-full shadow-md"
                >
                  Upgrade Now
                </button>
              )}
            </div>
          </div>
        </div>

        <ConvertXcoinModal
          isOpen={showConvertModal}
          onClose={() => setShowConvertModal(false)}
          onConfirm={handleConvertConfirm}
          destinationCurrency={currency}
          amount={parseFloat(amount)}
        />

        {/* Payment Modal */}
        <PaymentModal
          isOpen={isOpen}
          closeModal={closeModal}
          paymentData={{
            amount: buyAmt,
            currency: buyCurrency,
            description: "Buy Xcoin",
            from: "",
          }}
          setAmount={setBuyAmt}
          setCurrency={setBuyCurrency}
        />
      </main>
    </div>
  );
}

export default UserDashboard;
