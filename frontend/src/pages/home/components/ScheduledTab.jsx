import React from 'react';

export default function ScheduledTab({
    history,
    currentTime,
    handleDeleteMeeting,
    handleJoinMeeting,
}) {
    const scheduledMeetings = history.filter(m => m.status === 'scheduled');

    return (
        <section className="history-section glass-panel">
            <div className="history-header-bar">
                <h2>Upcoming Scheduled Meetings</h2>
            </div>
            <div className="history-table-container">
                {scheduledMeetings.length === 0 ? (
                    <p className="empty-history">No upcoming meetings scheduled.</p>
                ) : (
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>Date & time</th>
                                <th>Title</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {scheduledMeetings.map((meeting) => (
                                <tr key={meeting._id}>
                                    <td>
                                        <strong>{new Date(meeting.scheduled_for).toLocaleDateString()}</strong>
                                        <br />
                                        <small style={{ color: 'var(--text-muted)' }}>
                                            {new Date(meeting.scheduled_for).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </small>
                                    </td>
                                    <td>
                                        <strong>{meeting.title}</strong>
                                        <br />
                                        <small style={{ color: 'var(--text-muted)' }}>
                                            ID: {meeting.meeting_id}
                                        </small>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${meeting.status}`}>
                                            {meeting.status}
                                        </span>
                                    </td>
                                    <td>
                                        {currentTime < new Date(meeting.scheduled_for) ? (
                                            <button
                                                onClick={() => handleDeleteMeeting(meeting.meeting_id)}
                                                className="btn-outline delete-btn"
                                            >
                                                Delete
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleJoinMeeting(meeting.meeting_id, meeting.title, meeting.scheduled_for)}
                                                className="btn-outline join-now-btn"
                                            >
                                                Join Now
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
