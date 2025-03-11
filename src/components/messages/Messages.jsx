import React, { useEffect, useState } from "react";
import { useFetchContext } from "../../contexts/FetchContext";
import "./messages.css";

const Messages = () => {
  const [globalMessages, setGlobalMessages] = useState([]);
  const sendReq = useFetchContext();

  useEffect(() => {
    const updateMessages = async () => {
      try {
        const REACT_APP_SERVER_URL = process.env.REACT_APP_SERVER_URL;
        const { data, status } = await sendReq(
          `${REACT_APP_SERVER_URL}/api/msg`,
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
