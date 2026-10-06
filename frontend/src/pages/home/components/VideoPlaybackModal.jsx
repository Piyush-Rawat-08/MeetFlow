import React from 'react';

export default function VideoPlaybackModal({ videoUrl, onClose }) {
    if (!videoUrl) return null;

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                backgroundColor: "rgba(0, 0, 0, 0.85)",
                backdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
            }}
            onClick={onClose}
        >
            <div
                style={{
                    width: "90%",
                    maxWidth: "900px",
                    backgroundColor: "#171827",
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    position: "relative",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "1rem 1.5rem",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
                }}>
                    <h3 style={{ color: "white", margin: 0, fontSize: "1.1rem" }}>
                        Recording Playback
                    </h3>
                    <button
                        onClick={onClose}
                        style={{
                            background: "none",
                            border: "none",
                            color: "white",
                            fontSize: "1.5rem",
                            cursor: "pointer",
                            lineHeight: 1
                        }}
                    >
                        ✕
                    </button>
                </div>
                <video
                    src={videoUrl}
                    controls
                    autoPlay
                    style={{ width: "100%", maxHeight: "72vh", display: "block", backgroundColor: "black" }}
                />
            </div>
        </div>
    );
}
