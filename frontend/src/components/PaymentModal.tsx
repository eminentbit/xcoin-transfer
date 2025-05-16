import { MouseEvent, useEffect, useState } from "react";
import { PaymentModalType } from "@/utils/types";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { decryptData, isEncryptedResponse } from "@/utils/CryptoService";

const PaymentModal = ({
  isOpen,
  closeModal,
  paymentData,
  setAmount,
  setCurrency = () => {},
}: PaymentModalType) => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [data, setData] = useState("");
  useEffect(() => {
    const testElement = document.getElementById("test");
    if (testElement) {
      testElement.innerHTML = data;
    }
  }, [data]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [closeModal]);

  if (!isOpen) return null;

  const handlePayment = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    let data;
    const phoneNum = paymentData.from || phone;
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_ROOT_URL}/payments/pay`,
        {
          ...paymentData,
          from: phoneNum,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (import.meta.env.DEV) {
        console.log("Payment Successful", response.data.data);
      }
      if (isEncryptedResponse(response.data)) {
        data = await decryptData(response.data);
      } else {
        data = await response.data;
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Error: ", error.response?.data);
      }
    }

    setData("Payment Successful");

    closeModal();

    // Store each property separately
    try {
      if (import.meta.env.DEV) {
        console.log("Data is:", data);
      }
      if (data.reference) {
        sessionStorage.setItem("transaction_reference", String(data.reference));
      }

      if (data.id !== undefined && data.id !== null) {
        sessionStorage.setItem("transaction_id", String(data.id));
      }
    } catch (error) {
      console.error("Error storing individual properties:", error);
    }

    setTimeout(() => {
      navigate("/payment");
    }, 3000);

    setPhone("");
    setAmount("");
    setCurrency("");
  };

  return (
    <div className="flex flex-col items-center justify-center fixed inset-0">
      <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex justify-center items-center">
        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
          <h2 className="text-xl font-bold mb-4">Confirm Payment</h2>
          <div className="space-y-3">
            <p>
              <strong>Amount:</strong> {paymentData.amount}{" "}
              {paymentData.currency}
            </p>
            <p>
              <strong>Description:</strong> {paymentData.description}
            </p>
            <p>
              <strong>Reference:</strong> {"Buying Xcoin"}
            </p>
            {/* Editable Phone Number */}
            <label className="block text-sm font-medium text-gray-700">
              Phone Number:
            </label>
            <input
              type="text"
              required
              minLength={8}
              value={paymentData.from || phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div className="mt-4 flex justify-between">
            <button
              type="button"
              onClick={() => {
                closeModal();
                setAmount("");
                setCurrency("");
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePayment}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
      <div className="text-white" id="test"></div>
    </div>
  );
};

export default PaymentModal;
