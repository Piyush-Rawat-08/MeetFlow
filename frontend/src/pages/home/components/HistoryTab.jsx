import React from 'react';

export default function HistoryTab({
    history,
    handleJoinMeeting,
    handleDeleteMeeting,
}) {
    const pastMeetings = history.filter(m => m.status !== "scheduled");

    return (
        <section className="history-section glass-panel">
            <div className="history-header-bar">
                <h2>Your Activities</h2>
            </div>

            <div className="history-table-container">
                {pastMeetings.length === 0 ? (
                    <p className="empty-history">No past or scheduled meetings found.</p>
                ) : (
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Meeting Title</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pastMeetings.map((meeting) => (
                                <tr key={meeting._id}>
                                    <td>
                                        {meeting.status === 'scheduled'
                                            ? new Date(meeting.scheduled_for).toLocaleDateString()
                                            : new Date(meeting.createdAt || Date.now()).toLocaleDateString()
                                        }
                                    </td>
                                    <td>
                                        <strong>{meeting.title}</strong>
                                        <br />
                                        <small style={{ color: 'var(--text-muted)' }}>ID: {meeting.meeting_id}</small>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${meeting.status}`}>
                                            {meeting.status}
                                        </span>
                                    </td>
                                    <td>
                                        {meeting.status !== 'completed' ? (
                                            <button
                                                onClick={() => {
                                                    handleJoinMeeting(meeting.meeting_id, meeting.title);
                                                }}
                                                className="btn-outline join-now-btn"
                                            >
                                                Join Now
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleDeleteMeeting(meeting.meeting_id)}
                                                className="btn-outline delete-btn"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </section>
    );
}
