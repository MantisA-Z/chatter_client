import React, { useContext, createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

const UseSocketContext = () => useContext(SocketContext);

const SocketContextProvider = ({ children }) => {
  const socketServerUrl = process.env.REACT_APP_SERVER_URL;
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(socketServerUrl);
    setSocket(newSocket);

    // Cleanup function to disconnect socket on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [socketServerUrl]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export { UseSocketContext, SocketContextProvider };
