import React, { useEffect, useState } from "react";
import { useFetchContext } from "../../contexts/FetchContext";
import "./messages.css";

const Messages = () => {
  const [globalMessages, setGlobalMessages] = useState([]);
  const sendReq = useFetchContext();

  useEffect(() => {
    const updateMessages = async () => {
      try {
        const { data, status } = await sendReq(
          "http://127.0.0.1:8000/api/msg",
          {},
          null,
          "GET"
        );
        console.log(data);
      } catch (err) {
        console.log("An error occured", err);
      }
    };

    updateMessages();
  }, [sendReq]);
  return <div className="messages"></div>;
};

export default Messages;
