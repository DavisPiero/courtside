"use strict";
// Settings: Video, Audio, Gameplay and Controls. Saved in this browser between visits.
// SET holds the current values; SETTINGS describes each row of the settings screen.
const SET = {
  pixel: 3, // screen pixels per game pixel: 2 sharp, 3 classic, 4 chunky
  lighting: "high", // high: light shafts, light pools, rim light on players. low: flat and fast.
  fog: 1,
  bloom: 1,
  vignette: 1,
  scanlines: 0,
  grain: 0,
  grade: "none", // colour grade: none, warm, cool, vivid
  reflections: 1,
  shake: 1,
  sfx: 1,
  volume: 70,
  camera: "chase",
  nameTag: 1,
  meter: 1,
};
const SETTINGS = [
  { tab: "VIDEO", k: "pixel", label: "Pixel size", opts: [[2, "SHARP"], [3, "CLASSIC"], [4, "CHUNKY"]] },
  { tab: "VIDEO", k: "lighting", label: "Lighting", opts: [["low", "SIMPLE"], ["high", "DRAMATIC"]] },
  { tab: "VIDEO", k: "fog", label: "Atmospheric fog", opts: [[0, "OFF"], [1, "ON"]] },
  { tab: "VIDEO", k: "bloom", label: "Bloom glow", opts: [[0, "OFF"], [1, "ON"]] },
  { tab: "VIDEO", k: "reflections", label: "Floor reflections", opts: [[0, "OFF"], [1, "ON"]] },
  { tab: "VIDEO", k: "grade", label: "Colour grade", opts: [["none", "NONE"], ["warm", "WARM"], ["cool", "COOL"], ["vivid", "VIVID"]] },
  { tab: "VIDEO", k: "vignette", label: "Vignette", opts: [[0, "OFF"], [1, "ON"]] },
  { tab: "VIDEO", k: "scanlines", label: "CRT scanlines", opts: [[0, "OFF"], [1, "ON"]] },
  { tab: "VIDEO", k: "grain", label: "Film grain", opts: [[0, "OFF"], [1, "ON"]] },
  { tab: "VIDEO", k: "shake", label: "Screen shake", opts: [[0, "OFF"], [1, "ON"]] },
  { tab: "AUDIO", k: "sfx", label: "Sound effects", opts: [[0, "OFF"], [1, "ON"]] },
  { tab: "AUDIO", k: "volume", label: "Volume", opts: [[30, "LOW"], [70, "MEDIUM"], [100, "HIGH"]] },
  { tab: "GAMEPLAY", k: "camera", label: "Camera", opts: [["chase", "CHASE"], ["broadcast", "BROADCAST"]] },
  { tab: "GAMEPLAY", k: "nameTag", label: "Name over your player", opts: [[0, "OFF"], [1, "ON"]] },
  { tab: "GAMEPLAY", k: "meter", label: "Shot meter", opts: [[0, "OFF"], [1, "ON"]] },
];
const SAVE_KEY = "courtside.settings.v1";
function loadSettings() {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY) || "{}");
    for (const k in SET) if (k in s) SET[k] = s[k];
  } catch (e) {
    /* private window or blocked storage: keep defaults */
  }
}
function saveSettings() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(SET));
  } catch (e) {
    /* not saved, still applied for this visit */
  }
}
// Apply a setting that needs more than a re-read each frame.
function applySetting(k) {
  if (k === "pixel") rs();
  if (k === "camera") G.cm = SET.camera === "broadcast" ? "b" : "c";
  if (k === "sfx") AU.mute = SET.sfx ? 0 : 1;
}
loadSettings();
