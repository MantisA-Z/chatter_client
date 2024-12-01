import React, { useEffect, useState } from "react";
import "./Call.css";
import { IoCall as CallIcon } from "react-icons/io5";
import { MdWifiCalling3 as JoinCallIcon } from "react-icons/md";

const Call = ({ socket, connectionId, group }) => {
  const [incomingCall, setIncomingCall] = useState(false);
  useEffect(() => {
    if (!socket) return;

    socket.on("server:user-calling", () => {
      setIncomingCall(true);
      setTimeout(() => {
        setIncomingCall(false);
      }, 4000);
    });

    return () => {
      socket.off("server:user-calling");
    };
  }, [socket, connectionId, group]);

  const call = () => {
    if (!group) return;
    socket.emit("user:initiate-call", { group });
  };
  return (
    <div className="icon" onClick={call}>
      <CallIcon />
      <div
        className={incomingCall ? "incoming-call show" : "incoming-call hidden"}
      >
        <div className="group-name">call from: {group?.name}</div>
      </div>
    </div>
  );
};

export default Call;
