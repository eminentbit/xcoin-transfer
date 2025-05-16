import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import useModal from "@/components/UseModal";
import PaymentModal from "@/components/PaymentModal";
import getToken from "@/utils/GetCampayToken";

// Custom country code selector component
function CountryCodeSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (code: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const options = [
    // TODO: Add more countries and their codes here
    { code: "237", country: "Cameroon" },
    // { code: "234", country: "Nigeria" },
  ];

  const handleSelect = (code: string) => {
    onChange(code);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        className="w-full text-left px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        +{value}
      </button>
      {isOpen && (
        <ul className="absolute z-20 mt-1 w-[11em] bg-white border border-gray-300 rounded-md shadow-lg">
          {options.map((option) => (
            <li
              key={option.code}
              onClick={() => handleSelect(option.code)}
              className="cursor-pointer px-4 py-2 hover:bg-gray-100"
            >
              {option.country} (+{option.code})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function BuyXcoinPage() {
  const navigate = useNavigate();
  const { isOpen, openModal, closeModal } = useModal();
  const [phoneNum, setPhoneNum] = useState("");
  const [countryCode, setCountryCode] = useState("237"); // Default: Cameroon
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("momo");
  const [rmbEquivalent, setRmbEquivalent] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const xcoinAmount = parseFloat(e.target.value);
    if (!isNaN(xcoinAmount)) {
      setAmount(e.target.value);
      setRmbEquivalent(xcoinAmount * 7);
    } else {
      setAmount("");
      setRmbEquivalent(0);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNum(e.target.value);
  };

  const handlePaymentMethodChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setPaymentMethod(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    // Merge country code (without '+') with phone number
    const mergedPhoneNumber = countryCode + phoneNum;
    if (import.meta.env.DEV) {
      console.log("Merged Phone Number:", mergedPhoneNumber);
    }
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setShowConfirmation(true);
    }, 1500);

    const form = e.currentTarget;
    const accountType = (form.elements.namedItem("method") as HTMLInputElement)
      .value;

    if (
      accountType.toLowerCase().includes("momo") ||
      accountType.toLowerCase().includes("orange")
    ) {
      getToken();
      openModal();
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 max-sm:p-3 max-sm:mt-6">
      <Sidebar />
      <main className="flex-1 p-6 max-w-screen-lg mx-auto relative">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">Buy XCoin</h1>
          <button
            type="button"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium shadow-md cursor-pointer"
            onClick={() => {
              navigate("/dashboard");
            }}
          >
            Back to Dashboard
          </button>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Buy XCoin Form */}
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl">
            <h2 className="text-xl font-medium text-gray-800 mb-6">
              Purchase XCoin
            </h2>

            {showConfirmation ? (
              <div className="text-center py-8">
                <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-6">
                  <h3 className="font-bold text-lg mb-2">
                    Purchase Initiated!
                  </h3>
                  <p>Your purchase of {amount} XCoin is being processed.</p>
                  <p className="mt-2">
                    Please follow the payment instructions sent to your
                    registered contact method.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmation(false);
                    setAmount("");
                    setRmbEquivalent(0);
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md font-medium shadow-md"
                >
                  Make Another Purchase
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="amount"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Amount to Purchase (XCoin)
                  </label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={handleAmountChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                  {rmbEquivalent > 0 && (
                    <p className="mt-2 text-gray-600">
                      Equivalent:{" "}
                      <span className="font-semibold">{rmbEquivalent} RMB</span>
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="paymentMethod"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Payment Method
                  </label>
                  <select
                    name="method"
                    id="paymentMethod"
                    value={paymentMethod}
                    onChange={handlePaymentMethodChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  >
                    <option value="momo">MTN Mobile Money</option>
                    <option value="orange">Orange Money</option>
                    <option value="bankTransfer" disabled>
                      Bank Transfer
                    </option>
                    <option value="alipay">Alipay</option>
                    <option value="wechat">WeChat Pay</option>
                  </select>
                </div>

                {paymentMethod !== "alipay" && (
                  <div>
                    <label
                      htmlFor="phoneNumber"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      {paymentMethod.toUpperCase()} Number
                    </label>
                    <div className="flex space-x-2">
                      <CountryCodeSelector
                        value={countryCode}
                        onChange={setCountryCode}
                      />
                      <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        placeholder="Enter your mobile number"
                        minLength={9}
                        maxLength={15}
                        onChange={handlePhoneChange}
                        title="Number should be at least 9 digits"
                        className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                )}

                {(paymentMethod === "alipay" || paymentMethod === "wechat") && (
                  <div>
                    <label
                      htmlFor="qrCode"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Scan QR Code
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <div className="bg-gray-100 w-48 h-48 mx-auto flex items-center justify-center">
                        <p className="text-gray-500">QR Code Placeholder</p>
                      </div>
                      <p className="mt-4 text-sm text-gray-600">
                        Scan with your{" "}
                        {paymentMethod === "alipay" ? "Alipay" : "WeChat Pay"}{" "}
                        app
                      </p>
                    </div>
                  </div>
                )}

                {paymentMethod === "bankTransfer" && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">
                      Bank Transfer Details
                    </h4>
                    <ul className="space-y-1 text-sm text-blue-800">
                      <li>
                        <span className="font-medium">Bank:</span> China
                        Construction Bank
                      </li>
                      <li>
                        <span className="font-medium">Account Name:</span> XCoin
                        Exchange Ltd.
                      </li>
                      <li>
                        <span className="font-medium">Account Number:</span>{" "}
                        6225 **** **** 1234
                      </li>
                      <li>
                        <span className="font-medium">Reference:</span> Please
                        include your User ID
                      </li>
                    </ul>
                  </div>
                )}

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isLoading || amount === ""}
                    className={`w-full px-6 py-3 rounded-md font-medium shadow-md ${
                      isLoading || amount === ""
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-500 hover:bg-blue-600 text-white"
                    }`}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        Processing...
                      </span>
                    ) : (
                      "Complete Purchase"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Information Panel */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-medium text-gray-700 mb-4">
                Current Exchange Rates
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">1 XCoin =</span>
                  <span className="font-semibold">5.42 RMB</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">1 XCoin =</span>
                  <span className="font-semibold">467.52 FCFA</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">1 XCoin =</span>
                  <span className="font-semibold">0.74 USD</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-medium text-gray-700 mb-4">
                Purchase History
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-3 text-left text-gray-600 text-sm">
                        Date
                      </th>
                      <th className="p-3 text-left text-gray-600 text-sm">
                        Amount
                      </th>
                      <th className="p-3 text-left text-gray-600 text-sm">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-3 text-sm">2025-02-15</td>
                      <td className="p-3 text-sm">250 XCoin</td>
                      <td className="p-3">
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                          Complete
                        </span>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 text-sm">2025-02-10</td>
                      <td className="p-3 text-sm">500 XCoin</td>
                      <td className="p-3">
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                          Complete
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 text-sm">2025-02-01</td>
                      <td className="p-3 text-sm">100 XCoin</td>
                      <td className="p-3">
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                          Complete
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
              <h3 className="text-lg font-medium mb-3">Need Help?</h3>
              <p className="mb-4">
                Our support team is available 24/7 to assist you with your XCoin
                purchases.
              </p>
              <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                Contact Support
              </button>
            </div>
          </div>

          <PaymentModal
            isOpen={isOpen}
            closeModal={closeModal}
            paymentData={{
              amount: amount,
              currency: "XAF",
              description: "Buy Xcoin",
              from: countryCode + phoneNum,
            }}
            setAmount={setAmount}
            setCurrency={() => "XAF"}
          />
        </div>
      </main>
    </div>
  );
}

export default BuyXcoinPage;
