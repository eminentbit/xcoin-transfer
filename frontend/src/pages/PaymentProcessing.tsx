import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import getToken from "@/utils/GetCampayToken";
import { decryptData, isEncryptedResponse } from "@/utils/CryptoService";

const PaymentProcessing: React.FC = () => {
  const [status, setStatus] = useState<string>("pending");
  const [cancelled, setCancelled] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const intervalRef = useRef<number | null>(null);
  const navigate = useNavigate();

  // Warn the user if they attempt to leave the page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (status.toLowerCase() === "pending") {
        e.preventDefault();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [status]);

  // Poll the transaction status every 5 seconds
  useEffect(() => {
    if (cancelled || status.toLowerCase() !== "pending") return;

    const checkStatus = async () => {
      await getToken();
      try {
        const ref = sessionStorage.getItem("transaction_reference");
        const transId = sessionStorage.getItem("transaction_id");
        if (!ref) {
          setErrorMessage("Reference not found in session storage");
          setStatus("failed");
          return;
        }

        if (!ref) {
          setErrorMessage("Transaction ID not found in session Storage");
          setStatus("failed");
        }

        const response = await axios.get(
          `${import.meta.env.VITE_ROOT_URL}/payments/status/${ref}`,
          {
            withCredentials: true,
            params: {
              transactionId: transId,
            },
          }
        );
        if (isEncryptedResponse(response.data)) {
          const data: { status: string } = await decryptData(response.data);

          if (import.meta.env.DEV) {
            console.log("Status is:", data.status);
          }

          if (
            data.status.toLowerCase().includes("failed") ||
            data.status.toLowerCase().includes("sucess")
          ) {
            setStatus(data.status.toLowerCase());
            sessionStorage.removeItem("reference");
          }
        } else {
          setStatus(response.data.status.toLowerCase());
        }
      } catch (error) {
        console.error("Error checking transaction status:", error);
        setErrorMessage("Failed to check transaction status");
      }
      if (import.meta.env.DEV) {
        console.log("Checking transaction status...", status);
      }
    };

    // Initial check
    checkStatus();

    // Set up interval for polling
    intervalRef.current = window.setInterval(checkStatus, 5000);

    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [cancelled, status]);

  // Navigate to dashboard after a successful transaction
  useEffect(() => {
    if (status.toLowerCase() === "success") {
      const timer = setTimeout(() => {
        navigate("/dashboard");
      }, 2000); // Display the tick for 2 seconds
      return () => clearTimeout(timer);
    }
  }, [status, navigate]);

  // Cancel transaction handler
  const handleCancel = () => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setCancelled(true);
    setStatus("cancelled");

    // Use timeout to give user time to read the message before navigating
    setTimeout(() => {
      navigate("/dashboard");
    }, 5000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h2 className="text-2xl font-bold mb-4">Processing Payment</h2>

      {status.toLowerCase() === "pending" && (
        <>
          <p className="text-lg mb-6">
            Please complete the transaction on your mobile device. Dial *126 if
            it doesn't appear automatically.
          </p>
          <div className="w-16 h-16 border-4 border-blue-400 border-t-blue-600 rounded-full animate-spin mb-6"></div>
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none"
          >
            Cancel Transaction
          </button>
        </>
      )}

      {status.toLowerCase() === "completed" && (
        <div className="flex flex-col items-center">
          <div className="text-green-500 text-8xl mb-4">&#10003;</div>
          <p className="text-lg text-green-600 mb-6">
            Transaction completed successfully!
          </p>
          <p className="text-sm text-gray-600">Redirecting to dashboard...</p>
        </div>
      )}

      {status.toLowerCase() === "failed" && (
        <div className="flex flex-col items-center">
          <div className="text-red-500 text-8xl mb-4">&#10007;</div>
          <p className="text-lg text-red-600 mb-6">
            Transaction failed. {errorMessage || "Please try again."}
          </p>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
          >
            Return to Dashboard
          </button>
        </div>
      )}

      {status.toLowerCase() === "cancelled" && (
        <div className="flex flex-col items-center">
          <div className="text-yellow-500 text-8xl mb-4">&#8635;</div>
          <p className="text-lg text-yellow-600 mb-6">
            Transaction cancelled. Please reject on mobile phone to prevent
            unexpected errors.
          </p>
          <p className="text-sm text-gray-600">Redirecting to dashboard...</p>
        </div>
      )}
    </div>
  );
};

export default PaymentProcessing;
