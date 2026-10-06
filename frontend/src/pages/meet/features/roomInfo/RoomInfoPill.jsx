import React, { useState } from "react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import styles from "../../videoMeet.module.css";

export default function RoomInfoPill({ meetingTitle, meetingCode }) {
  const [copiedCode, setCopiedCode] = useState(false);

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
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  const handleCopyCode = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(meetingCode)
        .then(() => {
          setCopiedCode(true);
          setTimeout(() => setCopiedCode(false), 2000);
        })
        .catch(() => fallbackCopy(meetingCode));
    } else {
      fallbackCopy(meetingCode);
    }
  };

  return (
    <div className={styles.meetingInfoPill}>
      <div className={styles.pillTitleSection}>
        <span className={styles.pillDot}></span>
        <span className={styles.pillTitle} title={meetingTitle}>{meetingTitle}</span>
      </div>
      <div className={styles.pillDivider}></div>
      <button
        type="button"
        className={styles.pillCopyBtn}
        onClick={handleCopyCode}
        title="Click to copy meeting code"
      >
        <ContentCopyIcon style={{ fontSize: "0.95rem" }} />
        <span>{copiedCode ? "Code Copied! ✓" : meetingCode}</span>
      </button>
    </div>
  );
}
