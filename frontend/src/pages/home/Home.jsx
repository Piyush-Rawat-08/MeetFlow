import React from 'react';
import { useState, useEffect, useContext } from 'react';
import withAuth from '../../utils/withAuth';
import "./home.css";
import "../../styles/MeetFlow_DesignSystem.css";
import { useNavigate } from "react-router-dom";
import { AuthContext, client } from "../../context/AuthContext";

import HomeHeader from "./components/HomeHeader";
import HomeSidebar from "./components/HomeSidebar";
import DashboardTab from "./components/DashboardTab";
import ScheduledTab from "./components/ScheduledTab";
import HistoryTab from "./components/HistoryTab";
import RecordingsTab from "./components/RecordingsTab";
import VideoPlaybackModal from "./components/VideoPlaybackModal";

function HomeComponent() {
    const navigate = useNavigate();

    const { userData } = useContext(AuthContext);
    const userId = userData?.username || localStorage.getItem("username");
    const userEmail = userData?.email || localStorage.getItem("email");

    const [joinCode, setJoinCode] = useState("");
    const [scheduleTitle, setScheduleTitle] = useState("");
    const [scheduleDate, setScheduleDate] = useState("");
    const [history, setHistory] = useState([]);
    const [meetingTitle, setMeetingTitle] = useState("");
    const [activeTab, setActiveTab] = useState("dashboard");
    const [currentTime, setCurrentTime] = useState(new Date());
    const [recordings, setRecordings] = useState([]);
    const [activeVideoModal, setActiveVideoModal] = useState(null);

    const fetchRecordings = async () => {
        try {
            const currentUserId = userId || localStorage.getItem("username");
            if (!currentUserId) {
                return;
            }
            const response = await client.get(`/get_recordings?user_id=${currentUserId}`);
            const data = Array.isArray(response.data) ? response.data : response.data.recordings;
            setRecordings(data || []);
        } catch (error) {
            console.error("Error fetching recordings: ", error);
        }
    };

    const fetchHistory = async () => {
        try {
            const currentUserId = userId || localStorage.getItem("username");
            if (!currentUserId) return;
            const res = await client.get(`/get_all_activity?user_id=${currentUserId}`);
            setHistory(res.data.history || []);
        }
        catch (e) {
            console.log("error in fetching history", e);
        }
    };

    useEffect(() => {
        const currentUserId = userId || localStorage.getItem("username");
        if (currentUserId) {
            fetchHistory();
            fetchRecordings();
        }
    }, [userId]);

    const handleDeleteRecording = async (id) => {
        if (!window.confirm("Are you sure you want to delete this recording ?")) {
            return;
        }
        try {
            await client.delete(`/delete_recording/${id}`);
            setRecordings((prev) => prev.filter((rec) => rec._id !== id));
        } catch (error) {
            console.error("Error deleting recording:", error);
            alert("failed to delete recording.");
        }
    };

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const generateMeetingId = () => {
        const random = Math.random().toString(36).substring(2, 7) + "-" + Math.random().toString(36).substring(2, 7);
        return random;
    };

    const handleStartNewMeeting = async () => {
        const newMeetingId = generateMeetingId();
        try {
            await client.post('/add_to_activity', {
                user_id: userId,
                meeting_id: newMeetingId,
                title: meetingTitle || "Instant Meeting",
                isScheduled: false,
                createdAt: new Date(),
            });
            navigate(`/${newMeetingId}`, {
                state: {
                    title: meetingTitle || "Instant Meeting"
                }
            });
        }
        catch (e) {
            console.log("Error Starting Meeting", e);
        }
    };

    const handleJoinMeeting = async (codeToJoin = joinCode, titleToJoin = "Joined Meeting", scheduledFor = null) => {
        try {
            if (codeToJoin.trim() === "") {
                alert("Please enter a meeting code first");
                return;
            };

            if (scheduledFor) {
                const now = new Date();
                const scheduledTime = new Date(scheduledFor);
                if (now < scheduledTime) {
                    alert(`This meeting hasn't started yet!`);
                    return;
                }
            }
            await client.post('/add_to_activity', {
                user_id: userId,
                meeting_id: codeToJoin,
                isScheduled: false,
                title: titleToJoin,
                createdAt: new Date(),
            });
            navigate(`/${codeToJoin}`, {
                state: { title: titleToJoin }
            });
        }
        catch (e) {
            console.log("Error Joining Meeting", e);
        }
    };

    const handleScheduleMeeting = async () => {
        try {
            if (scheduleTitle.trim() === "" || scheduleDate === "") {
                alert("Please enter both title and date for the meeting");
                return;
            }
            const meetingId = generateMeetingId();
            await client.post("/add_to_activity", {
                user_id: userId,
                meeting_id: meetingId,
                title: scheduleTitle,
                scheduledDate: scheduleDate,
                isScheduled: true,
                createdAt: new Date(),
            });
            setScheduleTitle("");
            setScheduleDate("");
            alert("Meeting Scheduled Successfully");
            fetchHistory();
        }
        catch (e) {
            console.log("Error Scheduling Meeting", e);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        navigate("/");
    };

    const handleDeleteMeeting = async (meetingId) => {
        try {
            if (!window.confirm("Are you sure you want to delete this meeting from history?")) return;
            await client.delete(`/delete_activity?meeting_id=${meetingId}&user_id=${userId}`);
            setHistory(prevHistory => prevHistory.filter(m => m.meeting_id !== meetingId));
        } catch (e) {
            console.log("Error deleting meeting", e);
            alert("Failed to delete meeting.");
        }
    };

    const handleSidebarClick = (tab) => {
        setActiveTab(tab);
        if (tab === "history" || tab === "scheduled" || tab === "dashboard") {
            fetchHistory();
        }
        if (tab === "recordings" || tab === "dashboard") {
            fetchRecordings();
        }
    };

    const upcomingMeetings = history.filter(m => {
        if (m.status !== 'scheduled') return false;
        return currentTime >= new Date(m.scheduled_for);
    });

    return (
        <div className="home-minimal-container">
            {/* Header Component */}
            <HomeHeader
                userId={userId}
                userEmail={userEmail}
                upcomingMeetings={upcomingMeetings}
                onTabChange={handleSidebarClick}
            />

            {/* Split Screen Dashboard Layout */}
            <div className="dashboard-layout">
                {/* Sidebar Navigation Component */}
                <HomeSidebar
                    activeTab={activeTab}
                    onTabChange={handleSidebarClick}
                    onLogout={handleLogout}
                />

                {/* Main Tab Content */}
                <main className="home-content">
                    {activeTab === "dashboard" && (
                        <DashboardTab
                            meetingTitle={meetingTitle}
                            setMeetingTitle={setMeetingTitle}
                            handleStartNewMeeting={handleStartNewMeeting}
                            joinCode={joinCode}
                            setJoinCode={setJoinCode}
                            handleJoinMeeting={handleJoinMeeting}
                            scheduleTitle={scheduleTitle}
                            setScheduleTitle={setScheduleTitle}
                            scheduleDate={scheduleDate}
                            setScheduleDate={setScheduleDate}
                            handleScheduleMeeting={handleScheduleMeeting}
                            history={history}
                            recordings={recordings}
                            setActiveVideoModal={setActiveVideoModal}
                            handleDeleteRecording={handleDeleteRecording}
                        />
                    )}

                    {activeTab === "scheduled" && (
                        <ScheduledTab
                            history={history}
                            currentTime={currentTime}
                            handleDeleteMeeting={handleDeleteMeeting}
                            handleJoinMeeting={handleJoinMeeting}
                        />
                    )}

                    {activeTab === "history" && (
                        <HistoryTab
                            history={history}
                            handleJoinMeeting={handleJoinMeeting}
                            handleDeleteMeeting={handleDeleteMeeting}
                        />
                    )}

                    {activeTab === "recordings" && (
                        <RecordingsTab
                            recordings={recordings}
                            setActiveVideoModal={setActiveVideoModal}
                            handleDeleteRecording={handleDeleteRecording}
                        />
                    )}
                </main>
            </div>

            {/* Video Playback Modal Component */}
            <VideoPlaybackModal
                videoUrl={activeVideoModal}
                onClose={() => setActiveVideoModal(null)}
            />
        </div>
    );
}

export default withAuth(HomeComponent);