import React from "react";
import { IconButton } from "@mui/material";
import VideoCamIcon from "@mui/icons-material/Videocam";
import VideoCamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import styles from "../../videoMeet.module.css";

import RecordingIndicator from "../recording/RecordingIndicator";
import ChatButton from "../chat/ChatButton";

export default function MeetingControls({
  video,
  handleVideo,
  audio,
  handleAudio,
  screen,
  screenAvailable,
  handleScreen,
  handleEndCall,
  isRecording,
  isUploading,
  recordingTime,
  formatDuration,
  handleToggleRecording,
  newMessages,
  openChat,
}) {
  return (
    <div className={styles.buttonContainer}>
      <RecordingIndicator
        isRecording={isRecording}
        isUploading={isUploading}
        recordingTime={recordingTime}
        formatDuration={formatDuration}
      />

      <IconButton onClick={handleVideo} style={{ color: "white" }} title="Toggle Video">
        {video === true ? <VideoCamIcon /> : <VideoCamOffIcon />}
      </IconButton>

      <IconButton onClick={handleEndCall} style={{ color: "red" }} title="Leave Call">
        <CallEndIcon />
      </IconButton>

      <IconButton onClick={handleAudio} style={{ color: "white" }} title="Toggle Mic">
        {audio === true ? <MicIcon /> : <MicOffIcon />}
      </IconButton>

      <IconButton
        onClick={handleToggleRecording}
        disabled={isUploading}
        style={{ color: isRecording ? "#ef4444" : "white" }}
        title={isRecording ? "Stop Recording" : "Start Recording"}
      >
        {isRecording ? <StopCircleIcon /> : <RadioButtonCheckedIcon />}
      </IconButton>

      {screenAvailable === true && (
        <IconButton onClick={handleScreen} style={{ color: "white" }} title="Share Screen">
          {screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon />}
        </IconButton>
      )}

      <ChatButton newMessages={newMessages} openChat={openChat} />
    </div>
  );
}
