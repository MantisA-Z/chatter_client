import React, { createContext, useContext } from "react";

const FetchContext = createContext(null);

const useFetchContext = () => useContext(FetchContext);

const FetchContextProvider = ({ children }) => {
  const sendReq = async (url, headers = {}, body = null, method = "POST") => {
    try {
      const options = {
        headers: {
          ...headers,
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body,
        method,
      };
      const response = await fetch(url, options);

      const data = await response.json();
      return { data, status: response.status };
    } catch (err) {
      throw err;
    }
  };
  return (
    <FetchContext.Provider value={sendReq}>{children}</FetchContext.Provider>
  );
};

export { FetchContextProvider, useFetchContext };
