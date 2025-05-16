import axios, { AxiosError } from "axios";
import { decryptData, isEncryptedResponse } from "@/utils/CryptoService";

async function getPaymentLink({
  amount,
  currency,
  description,
  redirectUrl,
}: {
  amount?: string;
  currency?: string;
  description?: string;
  redirectUrl?: string;
}): Promise<string | undefined> {
  try {
    if (import.meta.env.DEV) {
      console.log("Fetching payment link...");
    }
    const url = import.meta.env.VITE_ROOT_URL;
    const response = await axios.post(
      `${url}/payments/payment-link`,
      {
        amount: amount,
        currency: currency || "XAF",
        description: description || "Test",
        redirect_url: redirectUrl || "http://localhost:5173/dashboard",
      },
      { withCredentials: true }
    );
    if (import.meta.env.DEV) {
      console.log("Payment link:", response.data);
    }

    if (isEncryptedResponse(response.data)) {
      const decryptedData: { transaction: { id: string }; link: string } =
        await decryptData(response.data);
      sessionStorage.setItem("transactionId", decryptedData.transaction.id);
      return decryptedData.link;
    }
  } catch (error: unknown) {
    console.error(
      "Error fetching payment link:",
      error instanceof AxiosError ? error.response?.data : String(error)
    );
  }
}

export default getPaymentLink;
