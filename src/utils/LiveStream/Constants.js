const LIVE_STATUS = {
  PREPARE: 0,
  ON_LIVE: 1,
  FINISH: 2,
};

const videoConfig = {
  preset: 1,
  bitrate: 500000,
  profile: 1,
  fps: 15,
  videoFrontMirror: false,
};

export { videoConfig, LIVE_STATUS };
