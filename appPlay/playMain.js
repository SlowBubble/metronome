import * as banner from '../esModules/ephemeral-banner/index.js';
import { NoteOnEvt } from '../esModules/midi-data/midiEvent.js';
import * as sound from '../esModules/musical-sound/musicalSound.js';
import * as pubSub from '../esModules/pub-sub/pubSub.js';
import * as math from '../esModules/math-util/mathUtil.js';
import { getLocales } from './speech.js';

main();

// The wake lock sentinel.
let wakeLock = null;

// Function that attempts to request a screen wake lock.
const requestWakeLock = async () => {
  try {
    wakeLock = await navigator.wakeLock.request();
    wakeLock.addEventListener('release', () => {
      console.log('Screen Wake Lock released:', wakeLock.released);
    });
    console.log('Screen Wake Lock released:', wakeLock.released);
  } catch (err) {
    console.error(`${err.name}, ${err.message}`);
  }
};

function main() {
  const [soundPub, soundSub] = pubSub.make();
  const [readyPub, readySub] = pubSub.make();

  const eBanner = banner.setup();
  const musicalSound = new sound.MusicalSound({
    midiJs: window.MIDI, soundSub: soundSub, 
    eBanner: eBanner, readyPub: readyPub
  });


  let beatsPerBar = 4;
  let currBeat = 0;
  let playingIntervalId = null;
  let beatsPerMin = 60;
  let spokenStyleIdx = 0;
  let utteranceRate = 0.9;
  document.getElementById('change-beat-style').onclick = evt => {
    const locales = getLocales();
    spokenStyleIdx += 1;
    spokenStyleIdx = spokenStyleIdx % (locales.length + 1);
    console.log(locales);
    evt.target.textContent = spokenStyleIdx === 0 ? 'Drums' : locales[spokenStyleIdx - 1].name;

    if (playingIntervalId) {
      restart();
    }
  }
  const incrBpmElt = document.getElementById('incr-bpm');
  document.getElementById('incr-bpm').onclick = _ => {
      beatsPerMin += 10;
      incrBpmElt.textContent = `${beatsPerMin} BPM`;
      if (playingIntervalId) {
        restart();
      }
  }
  document.getElementById('decr-bpm').onclick = _ => {
      if (beatsPerMin <= 10) {
          return;
      }
      beatsPerMin -= 10;
      incrBpmElt.textContent = `${beatsPerMin} BPM`;
      if (playingIntervalId) {
        restart();
      }
  }
  const incrBeatsElt = document.getElementById('incr-beats');
  incrBeatsElt.onclick = _ => {
      beatsPerBar += 1;
      incrBeatsElt.textContent = `${beatsPerBar} beats`;
      if (playingIntervalId) {
        restart();
      }
  }
  document.getElementById('decr-beats').onclick = _ => {
      if (beatsPerBar <= 1) {
          return;
      }
      beatsPerBar -= 1;
      incrBeatsElt.textContent = `${beatsPerBar} beats`;
      if (playingIntervalId) {
        restart();
      }
  }
  const playToggleElt = document.getElementById('play-toggle');
  playToggleElt.onclick = _ => {
      if (playingIntervalId) {
        stop();
        return;
      }

      restart();
  }
  function stop() {
    if (!playingIntervalId) {
      return;
    }
    clearInterval(playingIntervalId);
    playingIntervalId = null;
    playToggleElt.style.background = '';
    if (wakeLock) {
      wakeLock.release();
      wakeLock = null;
    }
  }
  function restart() {
      stop();

      playToggleElt.style.background = 'salmon';
      musicalSound.configure([{
        channelNum: 0,
        instrumentName: sound.instruments.synth_drum,
      }]);

      if (spokenStyleIdx > 0) {
        requestWakeLock();
      }

      playingIntervalId = window.setInterval(_ => {
        if (spokenStyleIdx > 0) {
          if (window.speechSynthesis.speaking) {
            utteranceRate += 0.1;
            console.log('Utterance rate is too low. Increased to', utteranceRate);
          }
          let utterance = new SpeechSynthesisUtterance(`${currBeat + 1}`);
          utterance.rate = utteranceRate;
          utterance.voice = getLocales()[spokenStyleIdx - 1].voice;
          window.speechSynthesis.speak(utterance);
        } else {
          getEvts(currBeat, beatsPerBar).forEach(evt => {
            evt.channelNum = 0;
            musicalSound.execute(new NoteOnEvt(evt));
          });
        }
        currBeat += 1;
        currBeat = currBeat % beatsPerBar;
      }, 60 / beatsPerMin * 1000);
  }
}

function getEvts(idx, numBeats) {
    if (idx == 0) {
      return [{noteNum: 35, velocity: 120}, {noteNum: 42, velocity: 90}];
    }
    if (idx == numBeats - 1) {
      return [{noteNum: 37, velocity: 90}, {noteNum: 42, velocity: 60}];
    }
    if (math.mod(idx, 2) == 0) {
      return [{noteNum: 36, velocity: 50}, {noteNum: 42, velocity: 50}];
    }
    return [{noteNum: 37, velocity: 30}, {noteNum: 44, velocity: 80}];
}
