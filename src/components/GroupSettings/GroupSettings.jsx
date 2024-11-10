import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFetchContext } from "../../contexts/FetchContext";
import { MdOutlineModeEdit as EditIcon } from "react-icons/md";
import { RiImageAddLine as AddImageIcon } from "react-icons/ri";
import { IoMdPricetag, IoMdClose as RemoveMemberIcon } from "react-icons/io";
import { FcInvite as InviteIcon } from "react-icons/fc";
import "./GroupSettings.css";

const GroupSettings = () => {
  const [groupData, setGroupData] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [members, setMembers] = useState(null);
  const [preLogo, setPreLogo] = useState("/defaultGroupLogo.jpg");
  const [accordianDisplay, setAccordianDisplay] = useState(false);
  const [removedUsers, setRemovedUsers] = useState([]);
  const [edit, setEdit] = useState({});
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
          setGroupName(data.group.name);
          console.log(data.group, data.members);
        }
      } catch (err) {
        console.log(err);
      }
    };
    checkAuth();
  }, [groupId, sendReq]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreLogo(reader.result);
        setEdit((e) => ({ ...e, logoFile: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGroupNameChange = (e) => {
    setEdit((edit) => ({ ...edit, name: e.target.value }));
    setGroupName(e.target.value);
    console.log(e.target.value);
  };

  const showAccoridan = (e) => {
    setAccordianDisplay((b) => !b);
  };

  const handleRemoveUser = (connectionId) => {
    const removed = edit.remove || [];
    setEdit((e) => ({ ...e, remove: [...removed, connectionId] }));
    setRemovedUsers((r) => [...r, connectionId]);
  };

  return groupData !== null ? (
    <div className="settings-container">
      <div className="basic-settings">
        <div className="logo-setting">
          {groupData.logo && preLogo === "/defaultGroupLogo.jpg" ? (
            <img src={groupData.logo} alt="" />
          ) : (
            <img src={preLogo}></img>
          )}
          <div className="edit-logo">
            <input
              type="file"
              accept="image/*"
              id="image-logo"
              onChange={handleFileChange}
            />
            <label htmlFor="image-logo">
              <AddImageIcon />
            </label>
          </div>
          <div className="group-name">
            <input
              type="text"
              value={groupName}
              onChange={handleGroupNameChange}
            />
            <div className="edit-name">
              <EditIcon />
            </div>
          </div>
        </div>
      </div>
      <div className="members-container" id="members-container">
        <label htmlFor="member-container">Members</label>
        <div
          className={
            accordianDisplay
              ? "accordian-invite show"
              : "accordian-invite hidden"
          }
        >
          <label htmlFor="connectionId">ConnectionId</label>
          <input type="text" id="connectionId" />
          <button>Invite</button>
        </div>
        <div className="members">
          <div className="invite-member" onClick={showAccoridan}>
            <div className="name">Invite New Members</div>
            <div className="icon">
              <InviteIcon />
            </div>
          </div>
          {members && members.length > 0
            ? members.map((member, i) => (
                <div
                  className={
                    removedUsers.includes(member.connectionId)
                      ? "member removed"
                      : "member"
                  }
                  key={i}
                >
                  <div className="name">{member.name}</div>
                  <div
                    className="icon"
                    onClick={() => handleRemoveUser(member.connectionId)}
                  >
                    <RemoveMemberIcon />
                  </div>
                </div>
              ))
            : "No members"}
          <div className="member">
            <div className="name">Lakshya</div>
            <div className="icon">
              <RemoveMemberIcon />
            </div>
          </div>
          <div className="member">
            <div className="name">Arjun</div>
            <div className="icon">
              <RemoveMemberIcon />
            </div>
          </div>
          <div className="member">
            <div className="name">Karma</div>
            <div className="icon">
              <RemoveMemberIcon />
            </div>
          </div>
          <div className="member">
            <div className="name">Rexpiro</div>
            <div className="icon">
              <RemoveMemberIcon />
            </div>
          </div>
        </div>
      </div>
      <div className="submit">
        <button className="cancel">cancel</button>
        <button className="edit">submit</button>
      </div>
    </div>
  ) : (
    <h2>You don't have permission to view this page</h2>
  );
};

export default GroupSettings;
