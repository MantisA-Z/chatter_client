import React, { useEffect, useState } from "react";
import "./home.css";
import { IoSettingsOutline as SettingsIcon } from "react-icons/io5";
import { MdOutlineChatBubble as ChatIcon } from "react-icons/md";
import { IoPersonAdd as AddFriendIcon } from "react-icons/io5";
import { MdOutlineGroupAdd as NewGroupIcon } from "react-icons/md";
import { UseSocketContext } from "../../contexts/SocketContext";
import { IoCloseSharp as CloseIcon } from "react-icons/io5";
import { RiImageAddLine as AddImageIcon } from "react-icons/ri";

const Home = () => {
  const socket = UseSocketContext();
  const [openNewGroupAccordion, setOpenNewGroupAccordion] = useState(false);
  const [connectionId, setConnectionId] = useState(null);
  const [newRoomName, setNewRoomName] = useState("");
  const [groups, setGroups] = useState([]);
  const handleNewGroup = () => {
    setOpenNewGroupAccordion((b) => !b);
  };

  const handleCloseNewGroup = () => {
    setOpenNewGroupAccordion(false);
  };

  useEffect(() => {
    if (!socket) return;
    const token = localStorage.getItem("token");

    //emits
    socket.emit("user:connection-id", { token });

    //listeners
    socket.on("server:user-connectionId", ({ connectionId }) => {
      setConnectionId(connectionId);
      console.log(connectionId);
    });
  }, [socket]);

  const updateNewRoomName = (e) => {
    setNewRoomName(e.target.value);
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("server:created-new-room", ({ name: roomName }) => {
      setGroups((g) => [...g, { name: roomName }]);
    });

    return () => {
      socket.off("server:created-new-room");
    };
  }, [connectionId, socket]);

  const createNewRoom = (e) => {
    e.preventDefault();
    if (newRoomName === "" || connectionId === null) return;

    socket.emit("user:create-new-room", { name: newRoomName, connectionId });
    console.log(newRoomName);
  };

  return (
    <div className="home-container">
      <div className="groups">
        <div className="group new-group">
          <div className="start" onClick={handleNewGroup}>
            <NewGroupIcon />
            <div className="name">Group</div>
          </div>
          <div
            className={
              openNewGroupAccordion ? "accordion show" : "accordion hidden"
            }
          >
            <div className="options" onClick={handleCloseNewGroup}>
              <CloseIcon />
            </div>
            <form>
              <div className="logo">
                <label htmlFor="image">
                  <AddImageIcon />
                </label>
                <input id="image" type="file" accept="image/*" />
              </div>
              <label htmlFor="name">Room Name</label>
              <input onChange={updateNewRoomName} id="name" type="text" />
              <button
                onClick={createNewRoom}
                className="createRoom"
                type="submit"
              >
                Create
              </button>
            </form>
          </div>
        </div>
        {groups.map((val, i) => {
          <div className="group" key={i}>
            <div className="log">
              {val?.src ? <img src={val.src} alt="" /> : ""}
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
