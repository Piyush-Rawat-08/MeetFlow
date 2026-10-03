import React, { useState } from 'react';
import styles from '../styles/videoMeet.module.css';
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

            document.exeCommand("copy");
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
        <div className={styles.lobbyContainer}>
            <div className={styles.lobbyCard}>
                <div className={styles.lobbyMeetingInfo}>
                    <div className={styles.lobbyLogoContainer}>
                        <img
                            src="/meetflow_logo.png"
                            alt="MeetFlow Logo"
                            className={styles.lobbyLogo}
                        />
                        <span className={styles.lobbyLogoText}>MeetFlow</span>
                    </div>
                    <h2 className={styles.meetingTitle}>{meetingTitle}</h2>
                    <div className={styles.meetingDetails}>
                        <span className={styles.detailBadge}>
                            <span className={styles.pulseDot}></span>
                            Ready to Join
                        </span>
                        {attendeesCount > 0 && (
                            <span className={styles.detailBadge}>
                                {attendeesCount} waiting
                            </span>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={handleCopyCode}
                        className={styles.lobbyCopyBtn}
                        title="Click to copy meeting code"
                    >
                        <ContentCopyIcon style={{ fontSize: "0.95rem" }} />
                        <span>{copied ? "Code copied!" : `Code: ${meetingCode}`}</span>
                    </button>
                </div>

                <div className={styles.videoPreviewWrapper}>
                    <video className={styles.videoPreview}
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
                <div className={styles.controlButtons}>
                    <button className=
                        {`${styles.roundBtn} 
                      ${!audioAvailable ? styles.roundBtnDanger : ''}`}
                        onClick={toggleAudio}
                    >
                        {audioAvailable ? <MicIcon /> : <MicOffIcon />}
                    </button>

                    <button className=
                        {`${styles.roundBtn} 
                      ${!videoAvailable ? styles.roundBtnDanger : ''}`}
                        onClick={toggleVideo}
                    >
                        {videoAvailable ? <VideocamIcon /> : <VideocamOffIcon />}
                    </button>
                </div>

                <div className={styles.joinSection}>
                    <input
                        type="text"
                        className={styles.nameInput}
                        placeholder="Enter your name"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <button
                        className={styles.joinBtn}
                        onClick={connect}
                    >
                        Join Meeting
                    </button>
                </div>
            </div>
        </div>
    )

}
