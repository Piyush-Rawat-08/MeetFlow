import React from "react";
import { IconButton } from "@mui/material";
import Badge from "@mui/material/Badge";
import ChatIcon from "@mui/icons-material/Chat";

export default function ChatButton({ newMessages, openChat }) {
  return (
    <Badge badgeContent={newMessages} max={999} color="secondary">
      <IconButton onClick={openChat} style={{ color: "white" }} title="Open Chat">
        <ChatIcon />
      </IconButton>
    </Badge>
  );
}
