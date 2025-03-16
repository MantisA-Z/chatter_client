import React, { useEffect, useState, useRef } from "react";
import "./InCall.css";
import { UseConnectionId } from "../../contexts/ConnectionId";
import { UseSocketContext } from "../../contexts/SocketContext";
import { BsMicMute as MutedIcon } from "react-icons/bs";
import { IoVideocamOffOutline as VideoOff } from "react-icons/io5";
import { IoIosVideocam as VideoOn } from "react-icons/io";
import { AiOutlineUsergroupAdd as AddCallIcon } from "react-icons/ai";
import { useParams } from "react-router-dom";

const InCall = () => {
  const [streams, setStreams] = useState([]);
  const localVideoRef = useRef(null);
  const userVideosRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const connectionId = UseConnectionId();
  const socket = UseSocketContext();
  const { groupId } = useParams();
  const peerConnections = useRef({});

  useEffect(() => {
    if (!connectionId || !socket) return;

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setLocalStream(stream);

        socket.emit("user:join-call", { connectionId, groupId });
      })
      .catch((err) => console.log(err));

    return () => {
      Object.values(peerConnections.current).forEach((peer) => peer.close());
      socket.off("user:joined-call");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
    };
  }, [socket, connectionId, groupId]);

  useEffect(() => {
    if (streams && userVideosRef.current !== null) {
      userVideosRef.current.className =
        streams.length === 0
          ? "userVideosOne"
          : streams.length === 1
          ? "userVideosTwo"
          : "userVideos";
    }
  }, [streams]);

  useEffect(() => {
    if (!socket || !localStream) return;

    socket.on("user:joined-call", ({ userConnectionId }) => {
      if (userConnectionId !== connectionId) {
        createOffer(userConnectionId);
        console.log(userConnectionId);
      }
    });

    socket.on("offer", async ({ offer, from }) => {
      await handleOffer(offer, from);
    });

    socket.on("answer", async ({ answer, from }) => {
      if (peerConnections.current[from]) {
        await peerConnections.current[from].setRemoteDescription(answer);
      }
    });

    socket.on("ice-candidate", ({ candidate, from }) => {
      if (peerConnections.current[from]) {
        peerConnections.current[from].addIceCandidate(candidate);
      }
    });
  }, [socket, localStream]);

  const createOffer = async (userId) => {
    const peer = new RTCPeerConnection();
    peerConnections.current[userId] = peer;

    localStream
      .getTracks()
      .forEach((track) => peer.addTrack(track, localStream));

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          candidate: event.candidate,
          to: userId,
        });
      }
    };

    peer.ontrack = (event) => {
      setStreams((prevStreams) => [
        ...prevStreams,
        { userId, stream: event.streams[0] },
      ]);
    };

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    socket.emit("offer", { offer, to: userId });
  };

  const handleOffer = async (offer, from) => {
    const peer = new RTCPeerConnection();
    peerConnections.current[from] = peer;

    localStream
      .getTracks()
      .forEach((track) => peer.addTrack(track, localStream));

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { candidate: event.candidate, to: from });
      }
    };

    peer.ontrack = (event) => {
      setStreams((prevStreams) => [
        ...prevStreams,
        { userId: from, stream: event.streams[0] },
      ]);
    };

    await peer.setRemoteDescription(offer);
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    socket.emit("answer", { answer, to: from });
  };

  const toggleMic = () => {
    if (localStream) {
      setIsMuted((prevMuted) => {
        const newMutedState = !prevMuted;
        localStream.getAudioTracks()[0].enabled = !newMutedState;
        return newMutedState;
      });
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks()[0].enabled = !isVideoOn;
      setIsVideoOn(!isVideoOn);
    }
  };

  return (
    <div className="videoCallContainer">
      <div className="userVideosContainer">
        <div className="userVideos" ref={userVideosRef}>
          <div className="videoBox">
            <video ref={localVideoRef} autoPlay muted></video>
            {isMuted && (
              <div className="userMutedIcon">
                <MutedIcon />
              </div>
            )}
          </div>
          {streams.map(({ userId, stream }) => (
            <div className="videoBox" key={userId}>
              <video
                autoPlay
                ref={(video) => {
                  if (video) video.srcObject = stream;
                }}
              ></video>
            </div>
          ))}
        </div>
      </div>
      <div className="userOptions">
        <button
          onClick={toggleMic}
          className={isMuted ? "micOption muted" : "micOption"}
        >
          <MutedIcon />
        </button>
        <button onClick={toggleVideo} className="videoOption">
          {isVideoOn ? <VideoOn /> : <VideoOff />}
        </button>
        <button className="addCallOption">
          <AddCallIcon />
        </button>
      </div>
    </div>
  );
};

export default InCall;
