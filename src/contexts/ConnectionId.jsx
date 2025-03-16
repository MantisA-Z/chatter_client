import React, { useContext, createContext, useEffect, useState } from "react";
import { UseSocketContext } from "./SocketContext";

const ConnectionId = createContext(null);

const UseConnectionId = () => useContext(ConnectionId); // Corrected context reference

const ConnectionIdContextProvider = ({ children }) => {
  const socket = UseSocketContext();
  const [connectionId, setConnectionId] = useState();

  useEffect(() => {
    if (!socket) return;
    const token = localStorage.getItem("token");

    socket.emit("user:connection-id", { token });

    const handleConnectionId = ({ connectionId }) => {
      setConnectionId(connectionId);
    };

    socket.on("server:user-connectionId", handleConnectionId);

    return () => {
      socket.off("server:user-connectionId", handleConnectionId);
    };
  }, [socket]); // Corrected dependency array

  return (
    <ConnectionId.Provider value={connectionId}>
      {children}
    </ConnectionId.Provider>
  );
};

export { UseConnectionId, ConnectionIdContextProvider };
