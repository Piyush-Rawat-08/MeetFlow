import { useRef, useState } from "react";
import { client } from "../../../../context/AuthContext.jsx";

export function useMeetingRecorder({ meetingCode, meetingTitle, username }) {
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const formatDuration = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: { ideal: 30 } },
        audio: true,
      });

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
        ? "video/webm;codecs=vp8,opus"
        : "video/webm";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        clearInterval(recordingTimerRef.current);
        setIsRecording(false);
        setIsUploading(true);

        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        const currentMeetingCode = meetingCode || window.location.pathname.split("/").pop();
        const currentUserId = localStorage.getItem("username") || username || "anonymous";

        const formData = new FormData();
        formData.append("video", blob, `recording-${currentMeetingCode}-${Date.now()}.webm`);
        formData.append("meeting_id", currentMeetingCode);
        formData.append("user_id", currentUserId);
        formData.append("title", meetingTitle || "Meeting Recording");
        formData.append("duration", formatDuration(recordingTime));

        try {
          await client.post("/upload_recording", formData);
          alert("Recording uploaded to cloudinary successfully");
        } catch (err) {
          console.error("Error uploading recording:", err);
          alert("Failed to upload recording to cloudinary.");
        } finally {
          setIsUploading(false);
          setRecordingTime(0);
        }
      };

      stream.getVideoTracks()[0].onended = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.stop();
        }
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Failed to start recording:", err);
    }
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      }
    }
  };

  const handleToggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return {
    isRecording,
    isUploading,
    recordingTime,
    formatDuration,
    handleToggleRecording,
    stopRecording,
  };
}
