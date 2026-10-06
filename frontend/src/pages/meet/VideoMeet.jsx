import React from "react";
import styles from "./videoMeet.module.css";
import VideoLobby from "../lobby/VideoLobby";

import { useWebRTC } from "./features/webrtc/useWebRTC";
import { useMeetingRecorder } from "./features/recording/useMeetingRecorder";
import RoomInfoPill from "./features/roomInfo/RoomInfoPill";
import VideoGrid from "./features/videoGrid/VideoGrid";
import MeetingControls from "./features/controls/MeetingControls";
import ChatBox from "./features/chat/ChatBox";

export default function VideoMeet() {
  const webrtc = useWebRTC();

  const recorder = useMeetingRecorder({
    meetingCode: webrtc.meetingCode,
    meetingTitle: webrtc.meetingTitle,
    username: webrtc.username,
  });

  return (
    <div>
      {webrtc.askForUsername === true ? (
        <VideoLobby
          username={webrtc.username}
          setUsername={webrtc.setUsername}
          audioAvailable={webrtc.audioAvailable}
          setAudioAvailable={webrtc.setAudioAvailable}
          videoAvailable={webrtc.videoAvailable}
          setVideoAvailable={webrtc.setVideoAvailable}
          connect={webrtc.connect}
          localVideoRef={webrtc.localVideoRef}
          meetingTitle={webrtc.meetingTitle}
          attendeesCount={webrtc.attendeesCount}
        />
      ) : (
        <div className={styles.mainContainer}>
          <div className={styles.meetVideoContainer}>
            <RoomInfoPill
              meetingTitle={webrtc.meetingTitle}
              meetingCode={webrtc.meetingCode}
            />

            <MeetingControls
              video={webrtc.video}
              handleVideo={webrtc.handleVideo}
              audio={webrtc.audio}
              handleAudio={webrtc.handleAudio}
              screen={webrtc.screen}
              screenAvailable={webrtc.screenAvailable}
              handleScreen={webrtc.handleScreen}
              handleEndCall={() => webrtc.handleEndCall(recorder.stopRecording)}
              isRecording={recorder.isRecording}
              isUploading={recorder.isUploading}
              recordingTime={recorder.recordingTime}
              formatDuration={recorder.formatDuration}
              handleToggleRecording={recorder.handleToggleRecording}
              newMessages={webrtc.newMessages}
              openChat={webrtc.openChat}
            />

            <VideoGrid
              localVideoRef={webrtc.localVideoRef}
              videos={webrtc.videos}
            />
          </div>

          {webrtc.showChat && (
            <ChatBox
              closeChat={webrtc.closeChat}
              messages={webrtc.messages}
              socket={webrtc.socketRef.current}
              username={webrtc.username}
            />
          )}
        </div>
      )}
    </div>
  );
}
