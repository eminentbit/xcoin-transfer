import { SetStateAction, useState } from "react";
import { ExhangeRateType } from "../../utils/types";

function CalculatorSection() {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("RMB");
  const exchangeRates: ExhangeRateType = { RMB: 7.2, XAF: 600 };

  const handleAmountChange = (e: {
    target: { value: SetStateAction<string> };
  }) => {
    setAmount(e.target.value);
  };

  const handleCurrencyChange = (e: {
    target: { value: SetStateAction<string> };
  }) => {
    setCurrency(e.target.value);
  };

  const calculateReceivedAmount = () => {
    return amount
      ? (parseFloat(amount) * exchangeRates[currency]).toFixed(2)
      : "0.00";
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
          <div className="lg:col-span-6">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Calculate Your Transfer
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Get an instant quote for your money transfer
            </p>
          </div>

          <div className="mt-8 lg:mt-0 lg:col-span-6">
            <div className="bg-gray-50 rounded-lg p-8">
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    You Send
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="number"
                      value={amount}
                      onChange={handleAmountChange}
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-4 pr-12 sm:text-sm border-gray-300 rounded-md"
                      placeholder="0.00"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">Xcoin</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Destination Currency
                  </label>
                  <select
                    title="Currency"
                    value={currency}
                    onChange={handleCurrencyChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="RMB">RMB</option>
                    <option value="XAF">XAF</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    You Receive
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="text"
                      value={calculateReceivedAmount()}
                      readOnly
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-4 pr-12 sm:text-sm border-gray-300 rounded-md bg-gray-100"
                      placeholder="0.00"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">
                        {currency}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Get Started
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CalculatorSection;
