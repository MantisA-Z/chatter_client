import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFetchContext } from "../../contexts/FetchContext";
import { MdOutlineModeEdit as EditIcon } from "react-icons/md";
import "./GroupSettings.css";

const GroupSettings = () => {
  const [groupData, setGroupData] = useState(null);
  const [members, setMembers] = useState(null);
  const { groupId } = useParams();
  const sendReq = useFetchContext();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await sendReq(
          "http://127.0.0.1:8000/api/update-group",
          {},
          JSON.stringify({ groupId })
        );
        if (!response) {
          console.log("server not responding");
          navigate("/");
          return;
        }
        const { data, status } = response;
        if (status === 200) {
          setGroupData(data.group);
          setMembers(data.members);
          console.log(data.group, data.members);
        }
      } catch (err) {
        console.log(err);
      }
    };
    checkAuth();
  }, [groupId, sendReq]);
  return groupData !== null ? (
    <div className="settings-container">
      <div className="basic-settings">
        <div className="logo-setting">
          {groupData.logo ? <img src={groupData.logo} alt="" /> : ""}
          <div className="edit-logo">
            <EditIcon />
          </div>
          <div className="group-name">
            <h2>{groupData.name}</h2>
            <div className="edit-name">
              <EditIcon />
            </div>
          </div>
        </div>
      </div>
      <div className="members-container" id="members-container">
        <label htmlFor="member-container">Members</label>
        <div className="members">
          {members && members.length > 0
            ? members.map((member, i) => (
                <div className="member">
                  <div className="name">{member.name}</div>
                </div>
              ))
            : "No members"}
        </div>
      </div>
    </div>
  ) : (
    <h2>You don't have permission to view this page</h2>
  );
};

export default GroupSettings;
