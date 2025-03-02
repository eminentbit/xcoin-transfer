async function getToken(): Promise<string | null> {
  try {
    const url = import.meta.env.VITE_ROOT_URL;
    const response = await fetch(`${url}/payments/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    return data.token; // Assuming the token is returned under a 'token' key
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error making POST request:", error.message); // Detailed error message
      alert(`Failed to fetch token: ${error.message}. Please try again.`);
    } else {
      console.error("Unexpected error:", error);
      alert("An unexpected error occurred. Please try again.");
    }
    return null; // return null since the token was not retrieved.
  }
}

export default getToken;
