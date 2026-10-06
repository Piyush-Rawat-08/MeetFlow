import React, { useState } from 'react';
import './VideoLobby.css';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';


export default function VideoLobby({
    username,
    setUsername,
    audioAvailable,
    setAudioAvailable,
    videoAvailable,
    setVideoAvailable,
    connect,
    localVideoRef,
    meetingTitle,
    attendeesCount,
}) {

    const [copied, setCopied] = useState(false);

    const meetingCode = window.location.pathname.split("/").filter(Boolean).pop();

    const fallbackCopy = (text) => {
        try {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = "fixed";
            textArea.style.left = "-999999px";
            textArea.style.top = "-999999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            document.execCommand("copy");
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("failed to copy code :", err);
        }
    };

    const handleCopyCode = () => {
        if (navigator?.clipboard?.writeText) {
            navigator.clipboard.writeText(meetingCode)
                .then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                })
                .catch(() => fallbackCopy(meetingCode));
        } else {
            fallbackCopy(meetingCode);
        }
    }


    const toggleAudio = () => {
        const newState = !audioAvailable;
        setAudioAvailable(newState);
        if (window.localStream) {
            window.localStream.getAudioTracks().forEach(track => {
                track.enabled = newState;
            });
        }
    }

    const toggleVideo = () => {
        const newState = !videoAvailable;
        setVideoAvailable(newState);
        if (window.localStream) {
            window.localStream.getVideoTracks().forEach(track => {
                track.enabled = newState;
            });
        }
    }

    return (
        <div className="lobbyContainer">
            <div className="lobbyCard">
                <div className="lobbyMeetingInfo">
                    <div className="lobbyLogoContainer">
                        <img
                            src="/meetflow_logo.png"
                            alt="MeetFlow Logo"
                            className="lobbyLogo"
                        />
                        <span className="lobbyLogoText">MeetFlow</span>
                    </div>
                    <h2 className="meetingTitle">{meetingTitle}</h2>
                    <div className="meetingDetails">
                        <span className="detailBadge">
                            <span className="pulseDot"></span>
                            Ready to Join
                        </span>
                        {attendeesCount > 0 && (
                            <span className="detailBadge">
                                {attendeesCount} waiting
                            </span>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={handleCopyCode}
                        className="lobbyCopyBtn"
                        title="Click to copy meeting code"
                    >
                        <ContentCopyIcon style={{ fontSize: "0.95rem" }} />
                        <span>{copied ? "Code copied!" : `Code: ${meetingCode}`}</span>
                    </button>
                </div>

                <div className="videoPreviewWrapper">
                    <video className="videoPreview"
                        ref={(ref) => {
                            if (ref) {
                                localVideoRef.current = ref;
                                if (ref.srcObject != window.localStream) {
                                    ref.srcObject = window.localStream;
                                }
                            }
                        }}
                        autoPlay
                        muted
                    ></video>
                </div>
                <div className="controlButtons">
                    <button className=
                        {`roundBtn ${!audioAvailable ? 'roundBtnDanger' : ''}`}
                        onClick={toggleAudio}
                    >
                        {audioAvailable ? <MicIcon /> : <MicOffIcon />}
                    </button>

                    <button className=
                        {`roundBtn ${!videoAvailable ? 'roundBtnDanger' : ''}`}
                        onClick={toggleVideo}
                    >
                        {videoAvailable ? <VideocamIcon /> : <VideocamOffIcon />}
                    </button>
                </div>

                <div className="joinSection">
                    <input
                        type="text"
                        className="nameInput"
                        placeholder="Enter your name"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <button
                        className="joinBtn"
                        onClick={connect}
                    >
                        Join Meeting
                    </button>
                </div>
            </div>
        </div>
    )

}
