import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { client } from "../../../../context/AuthContext.jsx";
import { server } from "../../../../config/environment.js";
import { peerConfigConnections } from "./webrtcConfig.js";
import { blackSilence } from "./dummyStreams.js";

const server_url = server;

export function useWebRTC() {

  const socketRef = useRef(null);
  const socketIdRef = useRef(null);
  const localVideoRef = useRef(null);
  const videoRef = useRef([]);

  let connectionsRef = useRef({});
  let pendingCandidatesRef = useRef({});
  let negotiatingRef = useRef({});

  const [videoAvailable, setVideoAvailable] = useState(true);
  const [audioAvailable, setAudioAvailable] = useState(true);
  const [video, setVideo] = useState(true);
  const [audio, setAudio] = useState(true);
  const [screen, setScreen] = useState(false);
  const [screenAvailable, setScreenAvailable] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessages, setNewMessages] = useState(0);
  const [askForUsername, setAskForUsername] = useState(true);
  const [username, setUsername] = useState("");
  const [videos, setVideos] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();

  const [meetingTitle, setMeetingTitle] = useState(location.state?.title || "Loading...");
  const [attendeesCount, setAttendeesCount] = useState(0);

  const meetingCode = window.location.pathname.split("/").filter(Boolean).pop();

  useEffect(() => {
    const fetchMeetingInfo = async () => {
      try {
        const response = await client.get(`/get_meeting_info/${meetingCode}`);
        const fetchedTitle = response.data.title;
        setMeetingTitle(fetchedTitle);
        setAttendeesCount(response.data.attendeesCount);
        const loggedInUser = localStorage.getItem("username");
        if (loggedInUser && fetchedTitle && fetchedTitle !== "Loading...") {
          await client.post("/add_to_activity", {
            user_id: loggedInUser,
            meeting_id: meetingCode,
            title: fetchedTitle,
            isScheduled: false,
            date: new Date(),
          });
        }
      } catch (error) {
        console.log("Error fetching meeting info", error);
        if (meetingTitle === "Loading...") {
          setMeetingTitle("Instant Meeting");
        }
      }
    };

    fetchMeetingInfo();
  }, [meetingCode]);

  const getPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      const hasVideo = stream.getVideoTracks().length > 0;
      const hasAudio = stream.getAudioTracks().length > 0;
      setVideoAvailable(hasVideo);
      setAudioAvailable(hasAudio);
      setVideo(hasVideo);
      setAudio(hasAudio);
      setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia);

      window.localStream = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.log("getUserMedia fallback to dummy stream:", err.name, err);
      setVideoAvailable(false);
      setAudioAvailable(false);
      setVideo(false);
      setAudio(false);
      window.localStream = blackSilence();
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = window.localStream;
      }
    }
  };

  useEffect(() => {
    getPermissions();
  }, []);

  const cleanupMediaAndConnections = () => {
    if (window.localStream) {
      window.localStream.getTracks().forEach((track) => track.stop());
      window.localStream = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    Object.keys(connectionsRef.current).forEach((id) => {
      if (connectionsRef.current[id]) {
        connectionsRef.current[id].close();
      }
    });
    connectionsRef.current = {};
    pendingCandidatesRef.current = {};
    negotiatingRef.current = {};

    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      cleanupMediaAndConnections();
    };
  }, []);

  const makeOffer = (id) => {
    const pc = connectionsRef.current[id];
    if (!pc) {
      console.log("No connection found for id:", id);
      return;
    }
    if (negotiatingRef.current[id] || pc.signalingState !== "stable") {
      console.log(
        "Skipping offer for",
        id,
        "| signalingState:",
        pc.signalingState,
        "| negotiating:",
        negotiatingRef.current[id],
      );
      return;
    }
    negotiatingRef.current[id] = true;
    pc
      .createOffer()
      .then((description) => pc.setLocalDescription(description))
      .then(() => {
        if (socketRef.current && socketRef.current.connected) {
          socketRef.current.emit(
            "signal",
            id,
            JSON.stringify({ sdp: pc.localDescription }),
          );
        }
      })
      .catch((e) => console.log("offer error:", e))
      .finally(() => {
        negotiatingRef.current[id] = false;
      });
  };


  const gotMessageFromServer = useCallback((fromId, message) => {
    const signal = typeof message === "string" ? JSON.parse(message) : message;
    console.log("Received signal from", fromId, ":", signal);
    if (fromId === socketIdRef.current) return;

    const pc = connectionsRef.current[fromId];

    if (signal.sdp) {
      if (!pc) {
        return;
      }
      pc.setRemoteDescription(new RTCSessionDescription(signal.sdp))
        .then(() => {
          if (pendingCandidatesRef.current[fromId]) {
            pendingCandidatesRef.current[fromId].forEach((c) =>
              pc.addIceCandidate(c).catch((e) => console.log(e)),
            );
            pendingCandidatesRef.current[fromId] = [];
          }

          if (signal.sdp.type === "offer") {
            negotiatingRef.current[fromId] = true;
            pc
              .createAnswer()
              .then((description) =>
                pc.setLocalDescription(description),
              )
              .then(() => {
                if (socketRef.current && socketRef.current.connected) {
                  socketRef.current.emit(
                    "signal",
                    fromId,
                    JSON.stringify({ sdp: pc.localDescription }),
                  );
                }
              })
              .catch((e) => console.log("Answer error:", e))
              .finally(() => {
                negotiatingRef.current[fromId] = false;
              });
          }
        })
        .catch((e) => console.log("setRemoteDescription error:", e));
    }

    if (signal.ice) {
      const candidate = new RTCIceCandidate(signal.ice);
      if (pc &&
        pc.remoteDescription &&
        pc.remoteDescription.type
      ) {
        pc
          .addIceCandidate(candidate)
          .catch((e) => console.log(e));
      } else {
        pendingCandidatesRef.current[fromId] = pendingCandidatesRef.current[fromId] || [];
        pendingCandidatesRef.current[fromId].push(candidate);
      }
    }
  }, []);

  const addMessage = useCallback((data, sender, socketIdSender) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: sender, data: data, socketIdSender: socketIdSender },
    ]);
    if (socketIdSender !== socketIdRef.current) {
      setNewMessages((prevMessages) => prevMessages + 1);
    }
  }, []);

  const connectToSocketServer = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    const socket = io(server_url, { secure: false, autoConnect: true });
    socketRef.current = socket;
    socket.on("signal", gotMessageFromServer);
    socket.on("chat-message", addMessage);
    socket.on("connect", () => {
      socketIdRef.current = socket.id;
      socket.emit("join-call", meetingCode)
    });
    socket.on("user-left", (id) => {
      setVideos((vids) => vids.filter((v) => v.socketId !== id));
      if (connectionsRef.current[id]) {
        connectionsRef.current[id].close();
        delete connectionsRef.current[id];
        delete pendingCandidatesRef.current[id];
        delete negotiatingRef.current[id];
      }
    });
    socket.on("user-joined", (id, clients) => {
      clients.forEach((socketListId) => {
        if (socketListId === socketIdRef.current) return;
        if (connectionsRef.current[socketListId]) return;
        const pc = new RTCPeerConnection(
          peerConfigConnections,
        );
        connectionsRef.current[socketListId] = pc;
        pc.onicecandidate = (event) => {
          if (event.candidate && socketRef.current?.connected) {
            socketRef.current.emit(
              "signal",
              socketListId,
              JSON.stringify({ ice: event.candidate }),
            );
          }
        };
        pc.ontrack = (event) => {
          const remoteStream = event.streams && event.streams[0] ? event.streams[0] : new MediaStream([event.track]);
          setVideos((currentVideos) => {
            const exists = currentVideos.some(
              (v) => v.socketId === socketListId,
            );
            if (exists) {
              const updatedVideos = currentVideos.map((v) =>
                v.socketId === socketListId
                  ? { ...v, stream: remoteStream }
                  : v,
              );
              videoRef.current = updatedVideos;
              return updatedVideos;
            } else {
              const newVideo = {
                socketId: socketListId,
                stream: remoteStream,
                autoPlay: true,
                playsInline: true,
              };
              const updatedVideos = [...currentVideos, newVideo];
              videoRef.current = updatedVideos;
              return updatedVideos;
            }
          });
        };
        const activeStream = window.localStream || blackSilence();
        activeStream.getTracks().forEach((track) => {
          pc.addTrack(track, activeStream);
        })
      });
      if (id === socketIdRef.current) {
        for (let remoteId in connectionsRef.current) {
          if (remoteId === socketIdRef.current) continue;
          makeOffer(remoteId);
        }
      }
    });
  };

  const handleVideo = () => {
    const nextState = !video;
    setVideo(nextState);
    if (window.localStream) {
      window.localStream.getVideoTracks().forEach((track) => {
        track.enabled = nextState;
      });
    }
  };

  const handleAudio = () => {
    const nextState = !audio;
    setAudio(nextState);
    if (window.localStream) {
      window.localStream.getAudioTracks().forEach((track) => {
        track.enabled = nextState;
      });
    }
  };

  const handleScreen = async () => {
    if (screen) {
      setScreen(false);
      const camTrack = window.localStream?.getVideoTracks()[0];
      if (camTrack) {
        Object.values(connectionsRef.current).forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track && s.track.kind === "video");
          if (sender) {
            sender.replaceTrack(camTrack);
          }
        });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = window.localStream;
        }
      }
    } else {
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
        setScreen(true);
        const screenTrack = displayStream.getVideoTracks()[0];
        Object.values(connectionsRef.current).forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track && s.track.kind === "video");
          if (sender) {
            sender.replaceTrack(screenTrack);
          }
        });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = window.localStream;
        }
      } catch (error) {
        console.log("screen share error", error);
      }
    }
  };

  const handleEndCall = async (onBeforeEnd) => {
    try {
      if (onBeforeEnd) {
        await onBeforeEnd();
      }
      cleanupMediaAndConnections();

      const loggedInUser = localStorage.getItem("username");
      if (loggedInUser && meetingTitle && meetingTitle !== "Loading...") {
        await client.post("/add_to_activity", {
          user_id: loggedInUser,
          meeting_id: meetingCode,
          title: meetingTitle,
          isScheduled: false,
        }).catch((err) => console.log("Failed to log activity: ", err));
      }
    } catch (e) {
      console.log("Error during call end cleanup", e);
    } finally {
      const token = localStorage.getItem("token");
      const targetDestination = token ? "/home" : "/";
      try {
        navigate(targetDestination);
      } catch {
        window.location.replace(targetDestination);
      }
    }
  };

  const openChat = () => {
    setShowChat(true);
    setNewMessages(0);
  };

  const closeChat = () => {
    setShowChat(false);
  };

  const connect = () => {
    setAskForUsername(false);
    connectToSocketServer();
  };

  return {
    socketRef,
    socketIdRef,
    localVideoRef,
    videoRef,
    videoAvailable,
    setVideoAvailable,
    audioAvailable,
    setAudioAvailable,
    video,
    audio,
    screen,
    screenAvailable,
    videos,
    showChat,
    messages,
    newMessages,
    askForUsername,
    setAskForUsername,
    username,
    setUsername,
    meetingTitle,
    meetingCode,
    attendeesCount,
    handleVideo,
    handleAudio,
    handleScreen,
    handleEndCall,
    openChat,
    closeChat,
    connect,
  };
}
