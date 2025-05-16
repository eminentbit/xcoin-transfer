import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { ProtectedWrapperProps } from "@/utils/types";
import Spinner from "@/components/Spinner";
import { decryptData, isEncryptedResponse } from "@/utils/CryptoService";

const ProtectedWrapper: React.FC<ProtectedWrapperProps> = ({
  children,
  isAdmin = false,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const url = `${import.meta.env.VITE_ROOT_URL}/auth/verify`;
    const checkAuth = async () => {
      try {
        const response = await axios.get(url, {
          withCredentials: true,
        });
        if (isEncryptedResponse(response.data)) {
          const user = await decryptData(response.data);
          if (import.meta.env.DEV) {
            console.log(user);
          }
          setIsAuthenticated(!!user);
        }
      } catch {
        setIsAuthenticated(false);
      }
    };

    const checkAdmin = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const response = await axios.get(
          `${import.meta.env.VITE_ROOT_URL}/admin/auth/verify`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (isEncryptedResponse(response.data)) {
          const user = await decryptData(response.data);
          setIsAuthenticated(!!user);
        } else {
          const user = await response.data;
          setIsAuthenticated(!!user);
        }
      } catch {
        setIsAuthenticated(false);
      }
    };

    if (!isAdmin) {
      checkAuth();
    } else {
      checkAdmin();
    }
  }, [isAdmin]);

  if (isAuthenticated === null) {
    return (
      <div>
        <Spinner />
      </div>
    );
  }

  return isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to={isAdmin ? "/admin/login" : "/login"} replace />
  );
};

export default ProtectedWrapper;
