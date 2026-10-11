let sharedAudioCtx = null;
export const silence = () => {
  if (!sharedAudioCtx || sharedAudioCtx.state === "closed") {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    sharedAudioCtx = new AudioContextClass();
  }
  if (sharedAudioCtx.state === "suspended") {
    sharedAudioCtx.resume().catch(() => { });
  }
  const oscillator = sharedAudioCtx.createOscillator();
  const dst = oscillator.connect(sharedAudioCtx.createMediaStreamDestination());
  oscillator.start();
  const track = dst.stream.getAudioTracks()[0];
  track.enabled = false;
  return track;
};

export const black = ({ width = 640, height = 480 } = {}) => {
  const canvas = Object.assign(document.createElement("canvas"), {
    width,
    height,
  });

  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);
  }
  const stream = canvas.captureStream();
  const track = stream.getVideoTracks()[0];
  track.enabled = false;
  return track;
};

export const blackSilence = (...args) =>
  new MediaStream([black(...args), silence()]);
