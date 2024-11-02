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

const Home = () => {
  const socket = UseSocketContext();
  const [preImage, setPreImage] = useState("/defaultGroupLogo.jpg");
  const [openNewGroupAccordion, setOpenNewGroupAccordion] = useState(false);
  const [connectionId, setConnectionId] = useState(null);
  const [newRoomName, setNewRoomName] = useState("");
  const [groups, setGroups] = useState([]);
  const [logoFile, setLogoFile] = useState(null);
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

    return () => {
      socket.off("server:user-connectionId");
      socket.off("server:created-new-room");
    };
  }, [connectionId, socket]);

  const handleNewGroup = () => {
    setOpenNewGroupAccordion((b) => !b);
  };

  const handleCloseNewGroup = () => {
    setOpenNewGroupAccordion(false);
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
      const { data, status } = await sendReq(
        "http://127.0.0.1:8000/upload",
        {},
        JSON.stringify({ file: logoFile })
      );

      if (status === 422) {
        console.log("Not enough info");
      } else if (status === 500) {
        console.log("Internal server error");
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
          <div className="group" key={i}>
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
        <div className="chat"></div>
        <div className="inputs">
          <input type="text" placeholder="..." />
        </div>
      </div>
    </div>
  );
};

export default Home;
