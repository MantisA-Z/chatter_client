import React, { useEffect, useState } from "react";
import "./Call.css";
import { IoCall as CallIcon } from "react-icons/io5";
import { MdWifiCalling3 as JoinCallIcon } from "react-icons/md";
import { MdCallEnd as RejectCallIcon } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const Call = ({ socket, connectionId, group }) => {
  const [incomingCall, setIncomingCall] = useState(false);
  const navigate = useNavigate();
  let timeout;
  useEffect(() => {
    if (!socket) return;
    socket.on("server:user-calling", () => {
      setIncomingCall(true);
      timeout = setTimeout(() => {
        setIncomingCall(false);
      }, 4000);
    });

    return () => {
      clearTimeout(timeout);
      socket.off("server:user-calling");
    };
  }, [socket]);

  useEffect(() => {
    console.log(incomingCall);
  }, [incomingCall]);

  const call = () => {
    if (!group) return;
    socket.emit("user:initiate-call", { group });
  };
  const receiveCall = () => {
    if (!group || !connectionId) return;
    navigate(`/call/${group._id}/${connectionId}`);
  };
  const rejectCall = () => {
    setIncomingCall(false);
    console.log("rejected");
  };
  return (
    <div className="icon">
      <div className="callIcon" onClick={call}>
        <CallIcon />
      </div>
      <div
        className={incomingCall ? "incoming-call show" : "incoming-call hidden"}
      >
        <div className="receive-call" onClick={receiveCall}>
          <JoinCallIcon />
        </div>
        <div className="reject-call" onClick={rejectCall}>
          <RejectCallIcon />
        </div>
        <div className="group-name">call from: {group?.name}</div>
      </div>
    </div>
  );
};

export default Call;
