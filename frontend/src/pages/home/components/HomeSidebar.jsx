import React from 'react';

export default function HomeSidebar({
    activeTab,
    onTabChange,
    onLogout,
}) {
    return (
        <aside className="sidebar glass-panel">
            <ul className="sidebar-nav">
                <li
                    className={activeTab === "dashboard" ? "active" : ""}
                    onClick={() => onTabChange("dashboard")}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                >
                    <i className="fa-solid fa-house"></i>
                    Dashboard
                </li>
                <li
                    className={activeTab === "scheduled" ? "active" : ""}
                    onClick={() => onTabChange("scheduled")}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                >
                    <i className="fa-solid fa-calendar-days"></i>
                    Scheduled
                </li>
                <li
                    className={activeTab === "history" ? "active" : ""}
                    onClick={() => onTabChange("history")}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                >
                    <i className="fa-solid fa-clock-rotate-left"></i>
                    History
                </li>
                <li
                    className={activeTab === "recordings" ? "active" : ""}
                    onClick={() => onTabChange("recordings")}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                >
                    <i className="fa-solid fa-video"></i>
                    Recordings
                </li>
            </ul>

            {/* Bottom Sidebar Actions */}
            <ul className="sidebar-nav" style={{ marginTop: 'auto', paddingTop: '3rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <li
                    onClick={onLogout}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ef4444', cursor: 'pointer' }}
                >
                    <i className="fa-solid fa-right-from-bracket"></i>
                    Log Out
                </li>
            </ul>
        </aside>
    );
}
