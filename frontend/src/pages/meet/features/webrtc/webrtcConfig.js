// Default STUN configuration
export const defaultIceServers = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
  { urls: "stun:stun3.l.google.com:19302" },
  { urls: "stun:stun4.l.google.com:19302" },
];

// Fallback configuration object used synchronously by RTCPeerConnection
export const peerConfigConnections = {
  iceServers: [
    ...defaultIceServers,
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443?transport=tcp",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ],
  iceCandidatePoolSize: 10,
};

export async function getFreshIceServers(appName = "meet-flow", apiKey = "AfhvfuFF4pCu56oNQbN4K9HJEZdKWjmku4xmmvxrCpoY-Eq7") {
  if (!appName || !apiKey) {
    return peerConfigConnections.iceServers;
  }
  try {
    const response = await fetch(
      `https://${appName}.metered.live/api/v1/turn/credentials?apiKey=${apiKey}`
    );
    if (response.ok) {
      const dynamicIceServers = await response.json();
      peerConfigConnections.iceServers = dynamicIceServers;
      return dynamicIceServers;
    }
  } catch (error) {
    console.warn("Failed to fetch dynamic TURN credentials, using fallback:", error);
  }
  return peerConfigConnections.iceServers;
}

