import React from 'react';

export default function RecordingsTab({
    recordings,
    setActiveVideoModal,
    handleDeleteRecording,
}) {
    return (
        <section className="history-section glass-panel">
            <div className="history-header-bar">
                <h2>My Meeting Recordings</h2>
                <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                    {recordings.length} {recordings.length === 1 ? "recording" : "recordings"} saved on Cloudinary
                </span>
            </div>
            {recordings.length === 0 ? (
                <div className="empty-history">
                    <p>You haven't recorded any meetings yet.</p>
                    <small style={{ color: "var(--text-muted)" }}>
                        Click the Record button during any live meeting to save it here.
                    </small>
                </div>
            ) : (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 340px))",
                    gap: "1.5rem",
                    marginTop: "1.5rem"
                }}>
                    {recordings.map((rec) => (
                        <div
                            key={rec._id}
                            className="glass-panel"
                            style={{
                                padding: "1.2rem",
                                borderRadius: "16px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                border: "1px solid rgba(255, 255, 255, 0.1)",
                                maxWidth: "340px",
                                width: "100%"
                            }}
                        >
                            <div>
                                {/* Thumbnail Container */}
                                <div
                                    onClick={() => setActiveVideoModal(rec.video_url)}
                                    style={{
                                        height: "150px",
                                        borderRadius: "12px",
                                        backgroundColor: "rgba(0, 0, 0, 0.6)",
                                        position: "relative",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                        overflow: "hidden",
                                        marginBottom: "1rem"
                                    }}
                                >
                                    <video
                                        src={rec.video_url}
                                        style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.5 }}
                                    />
                                    <div style={{
                                        position: "absolute",
                                        width: "44px",
                                        height: "44px",
                                        borderRadius: "50%",
                                        backgroundColor: "var(--primary-glow, #6366f1)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "white",
                                        fontSize: "1.1rem",
                                        boxShadow: "0 4px 15px rgba(99, 102, 241, 0.5)"
                                    }}>
                                        ▶
                                    </div>
                                    <span style={{
                                        position: "absolute",
                                        bottom: "8px",
                                        right: "8px",
                                        backgroundColor: "rgba(0,0,0,0.85)",
                                        color: "white",
                                        fontSize: "0.75rem",
                                        padding: "2px 8px",
                                        borderRadius: "4px"
                                    }}>
                                        {rec.duration}
                                    </span>
                                </div>
                                {/* Title & Date */}
                                <h4 style={{ color: "white", margin: "0 0 6px 0", fontSize: "1.05rem" }}>
                                    {rec.title}
                                </h4>
                                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "0 0 12px 0" }}>
                                    Room: {rec.meeting_id} • {new Date(rec.date).toLocaleDateString()}
                                </p>
                            </div>
                            {/* Action Buttons */}
                            <div style={{ display: "flex", gap: "0.6rem", marginTop: "0.8rem" }}>
                                <button
                                    className="btn-primary"
                                    style={{ flex: 1, padding: "8px 10px", fontSize: "0.85rem" }}
                                    onClick={() => setActiveVideoModal(rec.video_url)}
                                >
                                    Watch
                                </button>
                                <a
                                    href={rec.video_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    download={`recording-${rec.meeting_id}.webm`}
                                    className="btn-outline"
                                    style={{
                                        textDecoration: "none",
                                        padding: "8px 12px",
                                        fontSize: "0.85rem",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center"
                                    }}
                                    title="Download Video"
                                >
                                    ⬇
                                </a>
                                <button
                                    className="delete-btn"
                                    style={{ minWidth: "auto", padding: "8px 12px" }}
                                    onClick={() => handleDeleteRecording(rec._id)}
                                    title="Delete Recording"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
