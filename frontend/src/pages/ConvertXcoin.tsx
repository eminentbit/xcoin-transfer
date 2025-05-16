import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import axios, { AxiosError } from "axios";
import getToken from "@/utils/GetCampayToken";

type Conversion = {
  id: number;
  date: string;
  fromAmount: number;
  fromCurrency: string;
  toAmount: number;
  toCurrency: string;
  status: string;
};

const rates = {
  xcoin: {
    rmb: 5.42,
    fcfa: 467.52,
    usd: 0.74,
  },
};

const KValues = [
  {
    id: 1,
    date: "2025-02-15",
    fromAmount: 50,
    fromCurrency: "XCoin",
    toAmount: 350,
    toCurrency: "RMB",
    status: "Completed",
  },
  {
    id: 2,
    date: "2025-02-12",
    fromAmount: 75,
    fromCurrency: "XCoin",
    toAmount: 41250,
    toCurrency: "FCFA",
    status: "Completed",
  },
  {
    id: 3,
    date: "2025-02-08",
    fromAmount: 200,
    fromCurrency: "XCoin",
    toAmount: 1400,
    toCurrency: "RMB",
    status: "Completed",
  },
];

function ConvertXcoinPage() {
  // Wallet holds only XCoin, so fromCurrency is fixed.
  const fromCurrency = "xcoin";
  const [amount, setAmount] = useState("");
  const [username, setUsername] = useState("");
  const [toCurrency, setToCurrency] = useState<"rmb" | "fcfa" | "usd">("rmb");
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [recentConversions, setRecentConversions] =
    useState<Conversion[]>(KValues);

  // New state for dynamic exchange rates and last update time
  const [exchangeRates, setExchangeRates] = useState(rates);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [isRatesLoading, setIsRatesLoading] = useState(false);

  useEffect(() => {
    const fetchExchangeRates = async () => {
      setIsRatesLoading(true);
      try {
        const url = `${import.meta.env.VITE_ROOT_URL}/payments/data/rates`;
        const response = await axios.get(url, { withCredentials: true });
        setExchangeRates(response.data.rates);
        setLastUpdate(
          new Date(response.data.lastUpdated * 1000).toLocaleString()
        );
      } catch (error) {
        console.error("Failed to fetch exchange rates", error);
      } finally {
        setIsRatesLoading(false);
      }
    };

    // Fetch exchange rates immediately
    fetchExchangeRates();

    // Set up interval to fetch rates periodically
    const intervalId = setInterval(fetchExchangeRates, 100000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (amount && toCurrency) {
      const amountNum = parseFloat(amount);
      if (!isNaN(amountNum)) {
        const convertedValue =
          amountNum * exchangeRates[fromCurrency][toCurrency];
        setConvertedAmount(convertedValue);
      }
    } else {
      setConvertedAmount(0);
    }
  }, [amount, toCurrency, fromCurrency, exchangeRates]);

  const handleToCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setToCurrency(e.target.value as "rmb" | "fcfa" | "usd");
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (parseFloat(value) < 0 && value !== "") return;
    setAmount(value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    await getToken();
    try {
      const url = import.meta.env.VITE_ROOT_URL;
      const form = e.target as HTMLFormElement;
      const destCurrency = (
        form.elements.namedItem("destCurrency") as HTMLSelectElement
      ).value;
      if (import.meta.env.DEV) {
        console.log(destCurrency);
      }
      if (destCurrency === "rmb") {
        const response = await axios.post(
          `${url}/transactions/request`,
          {
            username,
            amount: parseFloat(amount),
            fromCurrency: "XCoin",
            toCurrency: toCurrency.toUpperCase(),
            convertedAmount,
          },
          { withCredentials: true }
        );

        if (import.meta.env.DEV) {
          console.log("API Response:", response.data);
        }

        // Add the new conversion to the history
        const newConversion: Conversion = {
          id: recentConversions.length + 1,
          date: new Date().toISOString().split("T")[0],
          fromAmount: parseFloat(amount),
          fromCurrency: "XCoin",
          toAmount: convertedAmount,
          toCurrency: getCurrencyName(toCurrency),
          status: response.data.status || "Completed",
        };
        setRecentConversions([newConversion, ...recentConversions]);
        setShowConfirmation(true);
      } else if (destCurrency === "fcfa") {
        try {
          const phone = (
            form.elements.namedItem("phoneNumber") as HTMLInputElement
          ).value;
          const response = await axios.post(
            `${url}/payments/campay/withdraw`,
            {
              amount: convertedAmount,
              to: `237${phone}`,
              description: `Withdrawal of ${amount}`,
            },
            { withCredentials: true }
          );
          if (import.meta.env.DEV) {
            console.log("Withdrawal successful:", response.data);
          }

          alert("Withdrawal request sent successfully!");
        } catch (error) {
          if (error instanceof AxiosError) {
            console.error("Error:", error.response?.data || error.message);
            alert(
              error.response?.data?.error || "Failed to process withdrawal."
            );
          }
        }
      }
    } catch (error) {
      console.error("Conversion failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrencyName = (code: string): string => {
    switch (code.toLowerCase()) {
      case "xcoin":
        return "XCoin";
      case "rmb":
        return "RMB";
      case "fcfa":
        return "FCFA";
      case "usd":
        return "USD";
      default:
        return code.toUpperCase();
    }
  };

  const getCurrencySymbol = (code: string): string => {
    switch (code.toLowerCase()) {
      case "xcoin":
        return "X";
      case "rmb":
        return "¥";
      case "fcfa":
        return "CFA";
      case "usd":
        return "$";
      default:
        return "";
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6 flex max-sm:flex-col">
        <div className="flex flex-row max-sm:flex-col">
          <div className="max-w-2xl mx-auto">
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 text-center">
                Convert XCoin
              </h1>
            </header>
            {showConfirmation ? (
              <div className="bg-green-100 text-green-800 p-6 rounded-lg text-center">
                <h2 className="text-2xl font-bold mb-4">
                  Conversion Successful!
                </h2>
                <p className="text-xl mb-4">
                  {parseFloat(amount)} XCoin ={" "}
                  <span className="font-semibold">
                    {convertedAmount.toFixed(2)} {getCurrencyName(toCurrency)}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmation(false);
                    setAmount("");
                    setConvertedAmount(0);
                  }}
                  className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md"
                >
                  Make Another Conversion
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded-lg shadow-lg space-y-6 max-w-2xl mx-auto"
              >
                {/* Fixed "From" field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From
                  </label>
                  <div className="flex items-center">
                    <div className="w-20 px-4 py-3 border border-gray-300 rounded-md bg-gray-100 text-center font-semibold">
                      XCoin
                    </div>
                    <div className="relative flex-1 ml-4">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        {getCurrencySymbol("xcoin")}
                      </span>
                      <input
                        type="number"
                        step="any"
                        placeholder="Enter amount"
                        value={amount}
                        onChange={handleAmountChange}
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>
                {/* Destination Currency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To
                  </label>
                  <div className="flex items-center">
                    <select
                      title="destCurrency"
                      name="destCurrency"
                      value={toCurrency}
                      onChange={handleToCurrencyChange}
                      className="min-w-20 px-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="rmb">RMB</option>
                      <option value="fcfa">FCFA</option>
                      <option value="usd">USD</option>
                    </select>
                    <div className="relative flex-1 ml-4">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        {getCurrencySymbol(toCurrency)}
                      </span>
                      <input
                        type="text"
                        readOnly
                        value={
                          convertedAmount ? convertedAmount.toFixed(2) : ""
                        }
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>

                {/* Show if Destination currency is FCFA */}
                {toCurrency === "fcfa" && (
                  <div>
                    <label
                      htmlFor="phoneNumber"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Mobile Money Number
                    </label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      placeholder="Enter your mobile number"
                      pattern="\d{9,}"
                      title="Number should be at least 9 digits"
                      minLength={9}
                      maxLength={9}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                )}

                {toCurrency === "rmb" && (
                  <div className="flex flex-col w-full mx-auto mt-4">
                    <label
                      htmlFor="username"
                      className="mb-2 text-lg font-semibold"
                    >
                      Enter your Alipay/WeChat username
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      placeholder="John Doe"
                      value={username}
                      className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => {
                        setUsername(e.target.value);
                      }}
                      required
                    />
                  </div>
                )}

                {/* Rate Information */}
                <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
                  {isRatesLoading ? (
                    <p className="text-xs">Loading exchange rates...</p>
                  ) : (
                    <>
                      <p>
                        <span className="font-medium">Current Rate:</span> 1
                        XCoin = {exchangeRates.xcoin[toCurrency]}{" "}
                        {getCurrencyName(toCurrency)}
                      </p>
                      {lastUpdate && (
                        <p className="mt-1 text-xs">
                          *Rates updated: {lastUpdate}
                        </p>
                      )}
                    </>
                  )}
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={isLoading || amount === ""}
                    className={`w-full px-6 py-3 rounded-md font-medium ${
                      isLoading || amount === ""
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-500 hover:bg-blue-600 text-white"
                    }`}
                  >
                    {isLoading ? "Processing..." : "Convert Now"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Info Panel*/}
          <div className="space-y-6 ml-6">
            {/* Recent Conversions */}
            <div className="max-w-lg mx-auto mt-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                Recent Conversions
              </h2>
              <div className="bg-white p-4 rounded-lg shadow-lg overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-3 text-left text-gray-600 text-sm">
                        Date
                      </th>
                      <th className="p-3 text-left text-gray-600 text-sm">
                        From
                      </th>
                      <th className="p-3 text-left text-gray-600 text-sm">
                        To
                      </th>
                      <th className="p-3 text-left text-gray-600 text-sm">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentConversions.map((conversion) => (
                      <tr key={conversion.id} className="border-b">
                        <td className="p-3 text-sm">{conversion.date}</td>
                        <td className="p-3 text-sm">
                          {conversion.fromAmount.toFixed(2)}{" "}
                          {conversion.fromCurrency}
                        </td>
                        <td className="p-3 text-sm">
                          {conversion.toAmount.toFixed(2)}{" "}
                          {conversion.toCurrency}
                        </td>
                        <td className="p-3">
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                            {conversion.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Help Box */}
            <div>
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
                <h3 className="text-lg font-medium mb-3">Need Help?</h3>
                <p className="mb-4">
                  Our support team is available 24/7 to assist you with your
                  XCoin purchases.
                </p>
                <a
                  href="/#ContactSection"
                  className="inline-block bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ConvertXcoinPage;
