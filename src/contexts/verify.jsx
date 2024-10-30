import React, { createContext, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useFetchContext } from "./FetchContext";

const VerifyContext = createContext(null);

const useVerifyContext = () => {
  return useContext(VerifyContext);
};

const VerifyContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const sendReq = useFetchContext();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      // Skip verification for sign-in and sign-up routes
      if (location.pathname === "/signin" || location.pathname === "/signup") {
        return;
      }

      if (!token) {
        console.log("token");
        navigate("/signin");
      } else {
        const { data, status } = await sendReq("http://127.0.0.1:8000/api");
        if (status === 401) {
          navigate("/signin"); // Redirect if the token is invalid
        }
      }
    };

    checkAuth();
  }, [navigate, location.pathname, sendReq]); // Ensure all dependencies are included

  return (
    <VerifyContext.Provider value={null}>{children}</VerifyContext.Provider>
  );
};

export { VerifyContextProvider, useVerifyContext };
