const METERED_USERNAME = "aa290ff90082e23ff6ebdb6d";
const METERED_CREDENTIAL = "Pwdmu1lzCG8EIrEe";

export const peerConfigConnections = {
  iceServers: [
    // Standard STUN servers for direct LAN / same-Wi-Fi connections
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun.relay.metered.ca:80" },
    // Authenticated Metered TURN Relay Servers (Port 80 and 443 over UDP and TCP)
    {
      urls: "turn:meet-flow.metered.live:80",
      username: METERED_USERNAME,
      credential: METERED_CREDENTIAL,
    },
    {
      urls: "turn:meet-flow.metered.live:443",
      username: METERED_USERNAME,
      credential: METERED_CREDENTIAL,
    },
    {
      urls: "turn:meet-flow.metered.live:443?transport=tcp",
      username: METERED_USERNAME,
      credential: METERED_CREDENTIAL,
    },
    {
      urls: "turns:meet-flow.metered.live:443?transport=tcp",
      username: METERED_USERNAME,
      credential: METERED_CREDENTIAL,
    },
  ],
  iceCandidatePoolSize: 10,
};
// No async API call needed; returns ready-to-use static authenticated iceServers immediately
export function getFreshIceServers() {
  return peerConfigConnections.iceServers;
}


