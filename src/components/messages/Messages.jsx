import React, { useEffect, useState } from "react";
import { useFetchContext } from "../../contexts/FetchContext";
import "./messages.css"; // Ensure your styles are consolidated here
import { UseSocketContext } from "../../contexts/SocketContext";

const MergedMessages = () => {
  const [globalMessages, setGlobalMessages] = useState([]);
  const [connectionId, setConnectionId] = useState();
  const [activeTab, setActiveTab] = useState("Global");
  const sendReq = useFetchContext();
  const socket = UseSocketContext();

  // Fetch messages from API
  const fetchMsg = async () => {
    try {
      const REACT_APP_SERVER_URL = process.env.REACT_APP_SERVER_URL;
      const { data } = await sendReq(
        `${REACT_APP_SERVER_URL}/api/msg`,
        {},
        null,
        "GET"
      );
      setGlobalMessages(data.globalMessages || []);
      setConnectionId(data.connectionId);
    } catch (err) {
      console.error("An error occurred while fetching messages:", err);
    }
  };

  useEffect(() => {
    const updateMessages = async () => {
      await fetchMsg();
    };

    updateMessages();
  }, [sendReq]);

  useEffect(() => {
    if (!socket) return;
    socket.on("updated-messages", async () => {
      await fetchMsg();
    });
  }, [socket]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const goHome = () => {
    window.location.href = "/";
  };

  const handleDeclineRequest = (i) => {
    socket.emit("user:decline-req", {
      req: globalMessages[i],
      connectionId,
    });
  };

  const handleAcceptRequest = (i) => {
    socket.emit("user:accept-req", { req: globalMessages[i], connectionId });
  };

  return (
    <div className="message-app">
      <div className="tabs">
        <div
          className={`tab ${activeTab === "Global" ? "active" : ""}`}
          onClick={() => handleTabClick("Global")}
        >
          Global
        </div>
        <div
          className={`tab ${activeTab === "Friends" ? "active" : ""}`}
          onClick={() => handleTabClick("Friends")}
        >
          Friends
        </div>
      </div>
      <div className="content-container">
        <div
          className="slider"
          style={{
            transform:
              activeTab === "Global" ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 0.5s ease",
          }}
        >
          <div className="messages">
            {globalMessages.map((val, i) => (
              <div className="message" key={i}>
                <p className="small-text">
                  From {val.from} {val.msg.at}
                </p>
                <div className="main">
                  <p className="main-text">{val.msg.text}</p>
                  <div className="buttons">
                    <button
                      className="decline"
                      onClick={() => handleDeclineRequest(i)}
                    >
                      Decline
                    </button>
                    <button
                      className="accept"
                      onClick={() => handleAcceptRequest(i)}
                    >
                      Accept
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <button className="back" onClick={goHome}>
        Back
      </button>
    </div>
  );
};
{
  /*mergedmessages refers to global and old code merged*/
}
export default MergedMessages;

