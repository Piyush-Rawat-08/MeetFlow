import React, { useState } from 'react';

export default function HomeHeader({
    userId,
    userEmail,
    upcomingMeetings,
    onTabChange,
}) {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    return (
        <header className="home-header">
            <div className="logo-container">
                <span><img src="/meetflow_logo.png" className="brand-logo-img" alt="logo" /></span>
                <div className="logo-text">MeetFlow</div>
            </div>

            <div className="header-actions">
                <span className="welcome-text">Welcome back, {userId}!</span>

                {/* Notification Bell */}
                <div className="profile-container">
                    <div className="notification-icon" onClick={() => {
                        setShowNotifications(!showNotifications);
                        setShowProfileMenu(false);
                    }}>
                        <i className="fa-solid fa-bell"></i>
                        {upcomingMeetings.length > 0 && (
                            <span className="notification-badge">{upcomingMeetings.length}</span>
                        )}
                    </div>
                    {showNotifications && (
                        <div className="profile-dropdown glass-panel notification-dropdown">
                            <div className="dropdown-header">
                                <h4>Notifications</h4>
                            </div>
                            <hr className="dropdown-divider" />
                            <div className="notification-list">
                                {upcomingMeetings.length === 0 ? (
                                    <p className="user-email" style={{ textAlign: 'center', padding: '1rem 0' }}>No upcoming meetings</p>
                                ) : (
                                    upcomingMeetings.map(meeting => (
                                        <div key={meeting._id} className="notification-item" onClick={() => onTabChange('scheduled')}>
                                            <div className="notification-dot"></div>
                                            <div className="notification-content">
                                                <strong>{meeting.title}</strong>
                                                <span>{new Date(meeting.scheduled_for).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="profile-container">
                    <div className="profile-avatar"
                        onClick={() => {
                            setShowProfileMenu(!showProfileMenu);
                            setShowNotifications(false);
                        }}
                    >
                        {userId ? userId.charAt(0).toUpperCase() : "U"}
                    </div>
                    {showProfileMenu && (
                        <div className="profile-dropdown glass-panel">
                            <div className="dropdown-header">
                                <h4>{userId}</h4>
                                <p className="user-email">{userEmail}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
