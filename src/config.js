export const GAME_WIDTH = 320;
export const GAME_HEIGHT = 180;
export const CAMERA_ZOOM = 2;
export const PHYSICS_SETTINGS = {
  default: 'arcade',
  arcade: {
    gravity: { y: 0 },
    debug: false,
  },
};

export const SAVE_VERSION = 1;

export const COLORS = {
  background: 0x0f1327,
  hero: 0x6dc2ff,
  sage: 0xffd37f,
  archivist: 0x9fffa1,
  groundskeeper: 0xff8fb1,
  scroll: 0xfff7c2,
  gate: 0x6b5b95,
};

export const WORLD_BOUNDS = {
  width: 2000,
  height: 1400,
};

export const DAY_NIGHT = {
  durationMs: 60000,
  amplitude: 0.3,
};
