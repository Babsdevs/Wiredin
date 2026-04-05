import { Audio } from 'expo-av';

const sounds = {};
let backgroundMusic = null;
let isMuted = false;
let musicVolume = 0.3;

const SOUND_FILES = {
  correct: require('../assets/sounds/correct.mp3'),
  wrong: require('../assets/sounds/wrong.mp3'),
  levelwin: require('../assets/sounds/levelwin.mp3'),
  gameover: require('../assets/sounds/gameover.mp3'),
  coin: require('../assets/sounds/coin.mp3'),
  click: require('../assets/sounds/click.mp3'),
};

export async function loadSounds() {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
    });

    for (const [key, file] of Object.entries(SOUND_FILES)) {
      try {
        const { sound } = await Audio.Sound.createAsync(file, {
          shouldPlay: false,
          volume: 1.0,
        });
        sounds[key] = sound;
      } catch (e) {
        console.log(`Could not load sound: ${key}`);
      }
    }
  } catch (e) {
    console.log('Audio setup error:', e);
  }
}

export async function playBackgroundMusic(track = 'gameplay') {
  if (isMuted) return;
  try {
    if (backgroundMusic) {
      await backgroundMusic.stopAsync();
      await backgroundMusic.unloadAsync();
      backgroundMusic = null;
    }

    const trackFile = track === 'home'
      ? require('../assets/sounds/home.mp3')
      : require('../assets/sounds/background.mp3');

    const { sound } = await Audio.Sound.createAsync(
      trackFile,
      {
        shouldPlay: true,
        isLooping: true,
        volume: track === 'home' ? musicVolume * 0.8 : musicVolume,
      }
    );
    backgroundMusic = sound;
  } catch (e) {
    console.log('Background music error:', e);
  }
}

export async function stopBackgroundMusic() {
  try {
    if (backgroundMusic) {
      await backgroundMusic.stopAsync();
      await backgroundMusic.unloadAsync();
      backgroundMusic = null;
    }
  } catch (e) {}
}

export async function fadeOutMusic(durationMs = 800) {
  if (!backgroundMusic) return;
  const steps = 20;
  const interval = durationMs / steps;
  const startVolume = musicVolume;

  for (let i = steps; i >= 0; i--) {
    try {
      if (!backgroundMusic) break;
      await backgroundMusic.setVolumeAsync((startVolume * i) / steps);
      await new Promise(resolve => setTimeout(resolve, interval));
    } catch (e) {
      break;
    }
  }

  await stopBackgroundMusic();
}

export async function duckMusic() {
  try {
    if (backgroundMusic) {
      await backgroundMusic.setVolumeAsync(musicVolume * 0.3);
    }
  } catch (e) {}
}

export async function restoreMusic() {
  try {
    if (backgroundMusic) {
      await backgroundMusic.setVolumeAsync(musicVolume);
    }
  } catch (e) {}
}

export async function playSound(name) {
  if (isMuted) return;
  try {
    const sound = sounds[name];
    if (sound) {
      await sound.setPositionAsync(0);
      await sound.playAsync();
    }
  } catch (e) {
    console.log('Play sound error:', e);
  }
}

export function setMuted(value) {
  isMuted = value;
  if (value) {
    stopBackgroundMusic();
  }
}

export function setMusicVolume(value) {
  musicVolume = value;
  if (backgroundMusic) {
    backgroundMusic.setVolumeAsync(value);
  }
}

export function getMuted() {
  return isMuted;
}

export async function unloadSounds() {
  for (const sound of Object.values(sounds)) {
    try {
      await sound.unloadAsync();
    } catch (e) {}
  }
  await stopBackgroundMusic();
}