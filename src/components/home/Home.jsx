import React, { useState } from "react";
import "./home.css";
import { IoSettingsOutline as SettingsIcon } from "react-icons/io5";
import { MdOutlineChatBubble as ChatIcon } from "react-icons/md";
import { IoPersonAdd as AddFriendIcon } from "react-icons/io5";
import { MdOutlineGroupAdd as NewGroupIcon } from "react-icons/md";
import { UseSocketContext } from "../../contexts/SocketContext";
import { IoCloseSharp as CloseIcon } from "react-icons/io5";

const Home = () => {
  const socket = UseSocketContext();
  const [openNewGroupAccordian, setOpenNewGroupAccordian] = useState(false);
  const [groups, setGroups] = useState([]);
  const handleNewGroup = () => {
    setOpenNewGroupAccordion((b) => !b);
  };

  return (
    <div className="home-container">
      <div className="groups">
        <div className="group new-group" onClick={handleNewGroup}>
          <NewGroupIcon />
          <div className="name">New Group</div>
          <div
            className={
              openNewGroupAccordion ? "accordion show" : "accordion hidden"
            }
          >
            <div className="options">
              <CloseIcon />
            </div>
            <h2>New Room</h2>
            <form>
              <label htmlFor="name">Room Name</label>
              <input id="name" type="text" />
            </form>
          </div>
        </div>
        {groups.map((val, i) => {
          <div className="group" key={i}>
            <div className="log">
              <img src={val.src} alt="" />
            </div>
            <div className="name">{val.name}</div>
          </div>;
        })}
      </div>
      <div className="options">
        <ChatIcon />
        <AddFriendIcon />
        <SettingsIcon />
      </div>
      <div className="chat-container">
        <div className="chat"></div>
        <div className="inputs">
          <input type="text" placeholder="..." />
        </div>
      </div>
    </div>
  );
};

export default Home;
