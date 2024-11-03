import React, { useEffect, useState } from "react";
import "./home.css";
import { useFetchContext } from "../../contexts/FetchContext";
import { IoSettingsOutline as SettingsIcon } from "react-icons/io5";
import { MdOutlineChatBubble as ChatIcon } from "react-icons/md";
import { IoPersonAdd as AddFriendIcon } from "react-icons/io5";
import { MdOutlineGroupAdd as NewGroupIcon } from "react-icons/md";
import { UseSocketContext } from "../../contexts/SocketContext";
import { IoCloseSharp as CloseIcon } from "react-icons/io5";
import { RiImageAddLine as AddImageIcon } from "react-icons/ri";
import { LuSendHorizonal as SendIcon } from "react-icons/lu";

const Home = () => {
  const socket = UseSocketContext();
  const [preImage, setPreImage] = useState("/defaultGroupLogo.jpg");
  const [openNewGroupAccordion, setOpenNewGroupAccordion] = useState(false);
  const [connectionId, setConnectionId] = useState(null);
  const [newRoomName, setNewRoomName] = useState("");
  const [groups, setGroups] = useState([]);
  const [logoFile, setLogoFile] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const currentGroup = groups[selectedGroup] || null;
  console.log(currentGroup);
  const [userMsg, setUserMsg] = useState("");
  const sendReq = useFetchContext();

  useEffect(() => {
    if (!socket) return;
    const token = localStorage.getItem("token");

    //emits
    socket.emit("user:connection-id", { token });
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    //listeners
    socket.on("server:user-connectionId", ({ connectionId, groups }) => {
      setConnectionId(connectionId);
      setGroups(groups);
      console.log(connectionId);
    });

    socket.on(
      "server:created-new-room",
      ({ name, logoImgUrl, groupInstance }) => {
        setGroups((g) => [...g, { name, src: logoImgUrl, groupInstance }]);
      }
    );

    socket.on("server:room-msg", ({ msg, from, groupId }) => {
      console.log("called");
      function formatDate(date) {
        const options = { month: "2-digit", day: "2-digit", year: "numeric" };
        const formattedDate = new Intl.DateTimeFormat("en-US", options).format(
          date
        );

        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? "PM" : "AM";

        hours = hours % 12;
        hours = hours === 0 ? 12 : hours;

        const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;

        return `${formattedDate} ${hours}:${formattedMinutes} ${ampm}`;
      }

      const now = new Date();
      const createdAt = formatDate(now);

      // Find the target room by ID
      const targetRoomIndex = groups.findIndex((val) => val._id === groupId);
      if (targetRoomIndex === -1) return; // If no room is found, exit

      // Update the groups state
      setGroups((prevG) =>
        prevG.map((group, i) =>
          i === targetRoomIndex
            ? { ...group, chat: [...group.chat, { from, msg, createdAt }] }
            : group
        )
      );
    });

    return () => {
      socket.off("server:user-connectionId");
      socket.off("server:created-new-room");
      socket.off("server:user-msg");
    };
  }, [connectionId, socket]);

  const handleGroupSelection = (i) => {
    setSelectedGroup(i);
    console.log(groups, i);
  };

  const handleNewGroup = () => {
    setOpenNewGroupAccordion((b) => !b);
  };

  const handleCloseNewGroup = () => {
    setOpenNewGroupAccordion(false);
  };

  const handleSendMsg = () => {
    if (userMsg.trim() === "" || groups.length === 0 || currentGroup === null)
      return;
    const groupId = currentGroup._id;
    socket.emit("user:msg", { connectionId, groupId, msg: userMsg });
  };

  const changeNewLogo = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreImage(reader.result);
        setLogoFile(reader.result);
      };
      reader.readAsDataURL(file);
    }
    console.log(file);
  };

  const createNewRoom = async (e) => {
    e.preventDefault();
    if (newRoomName === "" || connectionId === null) return;

    try {
      const response = await sendReq(
        "http://127.0.0.1:8000/upload",
        {},
        JSON.stringify({ file: logoFile })
      );

      if (!response || !response.data) {
        console.log("Server did not responded");
        return;
      }

      const { data, status } = response;

      if (status === 422) {
        console.log("Not enough info");
        return;
      } else if (status === 500) {
        console.log("Internal server error");
        return;
      } else if (status !== 200) {
        console.log("something went wrong while fetching user data");
        return;
      }

      socket.emit("user:create-new-room", {
        name: newRoomName,
        connectionId,
        logoImgUrl: data.fileUrl,
      });
    } catch (err) {
      console.log(err);
      return;
    }
  };

  const updateNewRoomName = (e) => {
    setNewRoomName(e.target.value);
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
                <img src={preImage} />
                <label htmlFor="image">
                  <AddImageIcon />
                </label>
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={changeNewLogo}
                />
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
        {groups.map((val, i) => (
          <div
            className="group"
            key={i}
            onClick={() => handleGroupSelection(i)}
          >
            <div className="logo">
              {val?.src ? (
                <img src={val.src} alt="" />
              ) : (
                <img src="/defaultGroupLogo.jpg"></img>
              )}
            </div>
            <p className="name">{val.name}</p>
          </div>
        ))}
      </div>
      <div className="options">
        <ChatIcon />
        <AddFriendIcon />
        <SettingsIcon />
      </div>
      <div className="chat-container">
        <div className="chats">
          {currentGroup !== null
            ? currentGroup.chat.map((message, index) => (
                <div className="chat" key={index}>
                  <div className="cred">
                    <div className="from">{message.from}</div>
                    <div className="time">{message.createdAt}</div>
                  </div>
                  <div className="mg">{message.msg}</div>
                </div>
              ))
            : ""}
        </div>
        <div className="inputs">
          <input
            type="text"
            placeholder="..."
            value={userMsg}
            onChange={(e) => setUserMsg(e.target.value)}
          />
          <button onClick={handleSendMsg}>
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
