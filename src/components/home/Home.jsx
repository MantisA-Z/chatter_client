import React, { useEffect, useRef, useState } from "react";
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
import { Navigate, useNavigate } from "react-router-dom";

const Home = () => {
  const socket = UseSocketContext();
  const [preImage, setPreImage] = useState("/defaultGroupLogo.jpg");
  const [openNewGroupAccordion, setOpenNewGroupAccordion] = useState(false);
  const [connectionId, setConnectionId] = useState(null);
  const [newRoomName, setNewRoomName] = useState("");
  const [groups, setGroups] = useState([]);
  const invisDivRef = useRef(null);
  const [logoFile, setLogoFile] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loader, setLoader] = useState(false);
  const navigate = useNavigate();
  const currentGroup = selectedGroup !== null ? groups[selectedGroup] : null;
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

    socket.on("server:created-new-room", ({ groupInstance }) => {
      setGroups((g) => [...g, groupInstance]);
    });

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

  useEffect(() => {
    if (currentGroup?.chat.length) {
      invisDivRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentGroup?.chat.length]);

  useEffect(() => {
    if (!invisDivRef.current) return;
    invisDivRef.current.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [groups]); // Adding `groups` to watch all updates

  const handleGroupSelection = (i) => {
    setSelectedGroup(i);
    console.log(groups, i);
  };

  const handleNewGroup = () => {
    setOpenNewGroupAccordion((b) => !b);
    console.log(openNewGroupAccordion);
  };

  const handleCloseNewGroup = () => {
    setOpenNewGroupAccordion(false);
  };

  const handleSendMsg = () => {
    if (userMsg.trim() === "" || groups.length === 0 || currentGroup === null)
      return;
    const groupId = currentGroup._id;
    socket.emit("user:msg", { connectionId, groupId, msg: userMsg });
    setUserMsg("");
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
  };

  const createNewRoom = async (e) => {
    e.preventDefault();
    if (newRoomName === "" || connectionId === null) return;
    setLoader(true);

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

      if (status === 500) {
        console.log("Internal server error");
        return;
      }

      socket.emit("user:create-new-room", {
        name: newRoomName,
        connectionId,
        logoImgUrl: data.fileUrl || "/defaultGroupLogo.jpg",
      });

      setLoader(false);
    } catch (err) {
      console.log(err);
      setLoader(false);
      return;
    }
  };

  const updateNewRoomName = (e) => {
    setNewRoomName(e.target.value);
  };

  const openGroupSettings = () => {
    if (!currentGroup) return;
    navigate(`/groupSettings/${currentGroup._id}`);
  };

  return (
    <div className="home-container">
      <div
        className={
          loader ? "loader-container loader-show" : "loader-container hidden"
        }
      >
        <div className="loader"></div>
      </div>
      <div className="groups">
        <div className="group new-group">
          <div className="start" onClick={handleNewGroup}>
            <NewGroupIcon />
            <div className="name">Group</div>
          </div>
        </div>
        {groups && groups.length > 0
          ? groups.map((val, i) => (
              <div
                className={
                  selectedGroup === i ? "group selected-group" : "group"
                }
                key={i}
                onClick={() => handleGroupSelection(i)}
              >
                <div className="logo">
                  {val?.logo ? (
                    <img src={val.logo} alt="" />
                  ) : (
                    <img src="/defaultGroupLogo.jpg"></img>
                  )}
                </div>
                <p className="name">{val.name}</p>
              </div>
            ))
          : ""}
      </div>
      <div className="options">
        <ChatIcon />
        <AddFriendIcon />
        <SettingsIcon />
      </div>
      <div className="chat-container">
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
        <div className="chats">
          {currentGroup !== null
            ? currentGroup.chat.map((message, index) => (
                <div className="chat" key={index}>
                  <div className="cred">
                    <div className="from">{message.from}</div>
                    <div className="time">{message.createdAt}</div>
                  </div>
                  <div className="msg">{message.msg}</div>
                </div>
              ))
            : ""}
          <div className="invis" ref={invisDivRef}></div>
        </div>
        <div className="inputs">
          {currentGroup !== null ? (
            <div className="group-settings" onClick={openGroupSettings}>
              <SettingsIcon />
            </div>
          ) : (
            ""
          )}
          <input
            type="text"
            placeholder="..."
            value={userMsg}
            onChange={(e) => setUserMsg(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSendMsg(); // Call the send message function
              }
            }}
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
