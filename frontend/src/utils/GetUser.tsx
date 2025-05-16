import axios from "axios";
import { UserMin } from "@/utils/types";
import { decryptData, isEncryptedResponse } from "@/utils/CryptoService";

const getUser = async (): Promise<UserMin | null> => {
  const url = `${import.meta.env.VITE_ROOT_URL}/auth/verify`;
  try {
    // First, let's log the endpoint we're hitting
    if (import.meta.env.DEV) {
      console.log("Fetching user from:", url);
    }

    const response = await axios.get(url, {
      withCredentials: true,
    });

    // Log the raw response structure for debugging
    if (import.meta.env.DEV) {
      console.log("Raw response structure:", {
        status: response.status,
        hasData: !!response.data,
        dataType: typeof response.data,
        isObject: typeof response.data === "object",
        encrypted: isEncryptedResponse(response.data),
        responseKeys: response.data ? Object.keys(response.data) : [],
      });
    }

    // Initialize data as null (safer default)
    let data: { user: UserMin } | null = null;

    if (isEncryptedResponse(response.data)) {
      // Log encryption details for debugging
      if (import.meta.env.DEV) {
        console.log("Encrypted data details:", {
          iv: !!response.data.iv,
          ivLength: response.data.iv.length,
          data: !!response.data.data,
          dataLength: response.data.data.length,
          hasTag: !!response.data.tag,
          timestamp: new Date(response.data.timestamp).toISOString(),
        });
      }

      try {
        // Attempt decryption
        data = await decryptData(response.data);
        if (import.meta.env.DEV) {
          console.log("Successfully decrypted user data", data);
        }
      } catch (decryptError) {
        console.error("Decryption failed:", decryptError);
        // Re-throw to be caught by the outer catch
        throw decryptError;
      }
    } else {
      if (import.meta.env.DEV) {
        console.log("Response was not encrypted");
      }

      // Check if response has expected structure
      if (response.data && response.data.user) {
        data = response.data as { user: UserMin };
      } else {
        console.error("Unexpected response format:", response.data);
        throw new Error("Response doesn't contain user data");
      }
    }

    // Safety check before storing in sessionStorage
    if (data && data.user) {
      sessionStorage.setItem(
        "user",
        JSON.stringify({
          email: data.user.email,
          name: data.user.fullName,
          id: data.user.id,
        })
      );
      return data.user;
    } else {
      console.error("No valid user data to store");
      return null;
    }
  } catch (error) {
    console.error("Error in getUser():", error);
    // Clear any potentially corrupted user data
    sessionStorage.removeItem("user");
    return null;
  }
};

export default getUser;
