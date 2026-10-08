import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import { client } from "../../../../context/AuthContext.jsx";
import { server } from "../../../../config/environment.js";
import { peerConfigConnections } from "./webrtcConfig.js";
import { blackSilence } from "./dummyStreams.js";

const server_url = server;

let connections = {};
let pendingCandidates = {};
let negotiating = {};

export function useWebRTC() {
  const socketRef = useRef();
  const socketIdRef = useRef();
  const localVideoRef = useRef();
  const videoRef = useRef([]);

  const [videoAvailable, setVideoAvailable] = useState(true);
  const [audioAvailable, setAudioAvailable] = useState(true);
  const [video, setVideo] = useState(undefined);
  const [audio, setAudio] = useState(undefined);
  const isMediaLoaded = useRef(false);
  const [screen, setScreen] = useState();
  const [screenAvailable, setScreenAvailable] = useState();

  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessages, setNewMessages] = useState(0);

  const [askForUsername, setAskForUsername] = useState(true);
  const [username, setUsername] = useState("");
  const [videos, setVideos] = useState([]);

  const location = useLocation();
  const [meetingTitle, setMeetingTitle] = useState(location.state?.title || "Loading...");
  const [attendeesCount, setAttendeesCount] = useState(0);

  const meetingCode = window.location.pathname.split("/").filter(Boolean).pop();

  useEffect(() => {
    const fetchMeetingInfo = async () => {
      try {
        const code = window.location.pathname.split("/").pop();
        const response = await client.get(`/get_meeting_info/${code}`);
        const fetchedTitle = response.data.title;
        setMeetingTitle(fetchedTitle);
        setAttendeesCount(response.data.attendeesCount);
        const loggedInUser = localStorage.getItem("username");
        if (loggedInUser && fetchedTitle && fetchedTitle !== "Loading...") {
          await client.post("/add_to_activity", {
            user_id: loggedInUser,
            meeting_id: code,
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
  }, []);

  useEffect(() => {
    getPermissions();
  }, []);

  useEffect(() => {
    return () => {
      if (window.localStream) {
        window.localStream.getTracks().forEach((track) => track.stop());
      }
      for (let id in connections) {
        connections[id].close();
      }
      connections = {};
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      if (!isMediaLoaded.current) {
        isMediaLoaded.current = true;
        return;
      }
      getUserMedia();
    }
  }, [video, audio]);

  const makeOffer = (id) => {
    if (!connections[id]) {
      console.log("No connection found for id:", id);
      return;
    }
    if (negotiating[id] || connections[id].signalingState !== "stable") {
      console.log(
        "Skipping offer for",
        id,
        "| signalingState:",
        connections[id].signalingState,
        "| negotiating:",
        negotiating[id],
      );
      return;
    }
    negotiating[id] = true;
    connections[id]
      .createOffer()
      .then((description) => connections[id].setLocalDescription(description))
      .then(() => {
        socketRef.current.emit(
          "signal",
          id,
          JSON.stringify({ sdp: connections[id].localDescription }),
        );
      })
      .catch((e) => console.log("offer error:", e))
      .finally(() => {
        negotiating[id] = false;
      });
  };

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
      setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia);

      window.localStream = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.log("getUserMedia failed:", err.name, err);
      setVideoAvailable(false);
      setAudioAvailable(false);

      window.localStream = blackSilence();
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = window.localStream;
      }
    }
  };

  const getMedia = async () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  };

  const getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    for (let id in connections) {
      if (id === socketIdRef.current) continue;
      connections[id].addStream(window.localStream);
      makeOffer(id);
    }

    stream.getTracks().forEach((track) => {
      track.onended = () => {
        setVideo(false);
        setAudio(false);

        try {
          const currentVideo = localVideoRef.current;
          const currentStream = currentVideo?.srcObject;
          if (currentStream) {
            currentStream.getTracks().forEach((t) => t.stop());
          }
        } catch (e) {
          console.log(e);
        }

        window.localStream = blackSilence();
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = window.localStream;
        }

        for (let id in connections) {
          connections[id].addStream(window.localStream);
          makeOffer(id);
        }
      };
    });
  };

  const getUserMedia = async () => {
    if (!localVideoRef.current) {
      return;
    }

    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSuccess)
        .catch((e) => console.log(e));
    } else {
      try {
        const currentStream = localVideoRef.current?.srcObject;
        if (currentStream) {
          currentStream.getTracks().forEach((track) => track.stop());
        }
      } catch (e) {
        console.log(e);
      }
    }
  };

  const getDisplayMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }
    window.localStream = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
    stream.getVideoTracks()[0].onended = () => {
      setScreen(false);
      getUserMedia();
    };
    for (let id in connections) {
      if (id === socketIdRef.current) continue;
      const videoTrack = stream.getVideoTracks()[0];
      const senders = connections[id].getSenders();
      const sender = senders.find((s) => s.track && s.track.kind === "video");
      if (sender) {
        sender.replaceTrack(videoTrack);
      } else {
        connections[id].addStream(window.localStream);
        makeOffer(id);
      }
    }
  };

  const gotMessageFromServer = (fromId, message) => {
    const signal = typeof message === "string" ? JSON.parse(message) : message;
    console.log("Received signal from", fromId, ":", signal);
    if (fromId === socketIdRef.current) return;

    if (signal.sdp) {
      connections[fromId]
        .setRemoteDescription(new RTCSessionDescription(signal.sdp))
        .then(() => {
          if (pendingCandidates[fromId]) {
            pendingCandidates[fromId].forEach((c) =>
              connections[fromId].addIceCandidate(c).catch((e) => console.log(e)),
            );
            pendingCandidates[fromId] = [];
          }

          if (signal.sdp.type === "offer") {
            negotiating[fromId] = true;
            connections[fromId]
              .createAnswer()
              .then((description) =>
                connections[fromId].setLocalDescription(description),
              )
              .then(() => {
                socketRef.current.emit(
                  "signal",
                  fromId,
                  JSON.stringify({ sdp: connections[fromId].localDescription }),
                );
              })
              .catch((e) => console.log("Answer error:", e))
              .finally(() => {
                negotiating[fromId] = false;
              });
          }
        })
        .catch((e) => console.log("setRemoteDescription error:", e));
    }

    if (signal.ice) {
      const candidate = new RTCIceCandidate(signal.ice);
      if (
        connections[fromId].remoteDescription &&
        connections[fromId].remoteDescription.type
      ) {
        connections[fromId]
          .addIceCandidate(candidate)
          .catch((e) => console.log(e));
      } else {
        pendingCandidates[fromId] = pendingCandidates[fromId] || [];
        pendingCandidates[fromId].push(candidate);
      }
    }
  };

  const addMessage = (data, sender, socketIdSender) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: sender, data: data, socketIdSender: socketIdSender },
    ]);
    if (socketIdSender !== socketIdRef.current) {
      setNewMessages((prevMessages) => prevMessages + 1);
    }
  };

  const connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false });
    socketRef.current.on("signal", gotMessageFromServer);
    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href);
      socketIdRef.current = socketRef.current.id;
      socketRef.current.on("chat-message", addMessage);
      socketRef.current.on("user-left", (id) => {
        setVideos((vids) => vids.filter((v) => v.socketId !== id));
        if (connections[id]) {
          connections[id].close();
          delete connections[id];
        }
      });
      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          if (connections[socketListId]) return;
          connections[socketListId] = new RTCPeerConnection(
            peerConfigConnections,
          );
          connections[socketListId].onicecandidate = (event) => {
            if (event.candidate != null) {
              socketRef.current.emit(
                "signal",
                socketListId,
                JSON.stringify({ ice: event.candidate }),
              );
            }
          };
          connections[socketListId].onaddstream = (event) => {
            setVideos((currentVideos) => {
              const videoExists = currentVideos.find(
                (v) => v.socketId === socketListId,
              );
              if (videoExists) {
                const updatedVideos = currentVideos.map((v) =>
                  v.socketId === socketListId
                    ? { ...v, stream: event.stream }
                    : v,
                );
                videoRef.current = updatedVideos;
                return updatedVideos;
              } else {
                const newVideo = {
                  socketId: socketListId,
                  stream: event.stream,
                  autoPlay: true,
                  playsInline: true,
                };
                const updatedVideos = [...currentVideos, newVideo];
                videoRef.current = updatedVideos;
                return updatedVideos;
              }
            });
          };
          if (window.localStream != null) {
            connections[socketListId].addStream(window.localStream);
          } else {
            window.localStream = blackSilence();
            connections[socketListId].addStream(window.localStream);
          }
        });
        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue;
            try {
              connections[id2].addStream(window.localStream);
            } catch (e) { }
            makeOffer(id2);
          }
        }
      });
    });
  };

  const handleVideo = () => {
    setVideo(!video);
  };

  const handleAudio = () => {
    setAudio(!audio);
  };

  const handleScreen = () => {
    if (screen) {
      setScreen(false);
      getUserMedia();
    } else {
      navigator.mediaDevices
        .getDisplayMedia({ video: true, audio: false })
        .then((stream) => {
          setScreen(true);
          getDisplayMediaSuccess(stream);
        })
        .catch((error) => {
          console.log("screen share error", error);
        });
    }
  };

  const handleEndCall = async (onBeforeEnd) => {
    try {
      if (onBeforeEnd) {
        onBeforeEnd();
      }
      if (localVideoRef.current?.srcObject) {
        localVideoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
      if (window.localStream) {
        window.localStream.getTracks().forEach((track) => track.stop());
      }
      const loggedInUser = localStorage.getItem("username");
      const currentMeetingCode = window.location.pathname.split("/").pop();
      if (loggedInUser && meetingTitle && meetingTitle !== "Loading...") {
        await client.post("/add_to_activity", {
          user_id: loggedInUser,
          meeting_id: currentMeetingCode,
          title: meetingTitle,
          isScheduled: false,
        });
      }
    } catch (e) {
      console.log(e);
    }
    navigate("/home");
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
    getMedia();
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
