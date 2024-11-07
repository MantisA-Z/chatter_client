import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useFetchContext } from "../../contexts/FetchContext";

const GroupSettings = () => {
  const { groupId } = useParams();
  const sendReq = useFetchContext();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      const response = await sendReq(
        "http://127.0.0.1:8000/api/update-group",
        {},
        JSON.stringify({ groupId })
      );
      console.log(response.data, response.status);
    };
    checkAuth();
  }, [groupId, sendReq]);
  return <div>Group Settings</div>;
};

export default GroupSettings;
