import React from "react";

export default function RecordingIndicator({ isRecording, isUploading, recordingTime, formatDuration }) {
  return (
    <>
      {isRecording && (
        <div style={{
          position: "absolute",
          top: "-55px",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "rgba(220, 38, 38, 0.95)",
          color: "white",
          padding: "6px 18px",
          borderRadius: "20px",
          fontWeight: "700",
          fontSize: "0.9rem",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          boxShadow: "0 0 15px rgba(239, 68, 68, 0.7)",
          letterSpacing: "1px"
        }}>
          <span style={{
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            backgroundColor: "white",
            display: "inline-block"
          }}></span>
          REC {formatDuration(recordingTime)}
        </div>
      )}
      {isUploading && (
        <div style={{
          position: "absolute",
          top: "-55px",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "rgba(59, 130, 246, 0.95)",
          color: "white",
          padding: "6px 18px",
          borderRadius: "20px",
          fontWeight: "600",
          fontSize: "0.9rem",
          boxShadow: "0 0 15px rgba(59, 130, 246, 0.6)"
        }}>
          Uploading to Cloudinary... ⏳
        </div>
      )}
    </>
  );
}
