const METERED_USERNAME = "aa290ff90082e23ff6ebdb6d";
const METERED_CREDENTIAL = "Pwdmu1lzCG8EIrEe";

export const peerConfigConnections = {
  iceServers: [
    {
      urls: "stun:stun.relay.metered.ca:80",
    },
    {
      urls: "turn:in.relay.metered.ca:80",
      username: METERED_USERNAME,
      credential: METERED_CREDENTIAL,
    },
    {
      urls: "turn:in.relay.metered.ca:80?transport=tcp",
      username: METERED_USERNAME,
      credential: METERED_CREDENTIAL,
    },
    {
      urls: "turn:in.relay.metered.ca:443",
      username: METERED_USERNAME,
      credential: METERED_CREDENTIAL,
    },
    {
      urls: "turns:in.relay.metered.ca:443?transport=tcp",
      username: "aa290ff90082e23ff6ebdb6d",
      credential: "Pwdmu1lzCG8EIrEe",
    },
  ]
};
// No async API call needed; returns ready-to-use static authenticated iceServers immediately
export function getFreshIceServers() {
  return peerConfigConnections.iceServers;
}


