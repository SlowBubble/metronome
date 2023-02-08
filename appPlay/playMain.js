import * as banner from '../esModules/ephemeral-banner/index.js';
import { NoteOnEvt } from '../esModules/midi-data/midiEvent.js';
import * as sound from '../esModules/musical-sound/musicalSound.js';
import * as pubSub from '../esModules/pub-sub/pubSub.js';
import * as math from '../esModules/math-util/mathUtil.js';

main();

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
  let spokenStyle = false;
  document.getElementById('change-beat-style').onclick = evt => {
    spokenStyle = !spokenStyle;
    evt.target.style.background = spokenStyle ? 'beige' : '';

    if (playingIntervalId) {
      restart();
    }
  }
  document.getElementById('incr-bpm').onclick = _ => {
      beatsPerMin += 10;
      if (playingIntervalId) {
        restart();
      }
  }
  document.getElementById('decr-bpm').onclick = _ => {
      if (beatsPerMin <= 10) {
          return;
      }
      beatsPerMin -= 10;
      if (playingIntervalId) {
        restart();
      }
  }
  document.getElementById('incr-beats').onclick = _ => {
      beatsPerBar += 1;
      if (playingIntervalId) {
        restart();
      }
  }
  document.getElementById('decr-beats').onclick = _ => {
      if (beatsPerBar <= 1) {
          return;
      }
      beatsPerBar -= 1;
      if (playingIntervalId) {
        restart();
      }
  }
  document.getElementById('play-toggle').onclick = evt => {
      if (playingIntervalId) {
          clearInterval(playingIntervalId);
          playingIntervalId = null;
          evt.target.style.background = '';
          return;
      }

      evt.target.style.background = 'red';
      restart();
  }
  function restart() {
      if (playingIntervalId) {
        clearInterval(playingIntervalId);
        playingIntervalId = null;
      }
      musicalSound.configure([{
        channelNum: 0,
        instrumentName: sound.instruments.synth_drum,
      }]);
      playingIntervalId = window.setInterval(_ => {
        if (spokenStyle) {
          let utterance = new SpeechSynthesisUtterance(`${currBeat + 1}`);
          utterance.rate = 0.9;
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
      return [{noteNum: 36, velocity: 90}, {noteNum: 42, velocity: 30}];
    }
    if (idx == numBeats - 1) {
      return [{noteNum: 37, velocity: 30}, {noteNum: 42, velocity: 30}];
    }
    if (math.mod(idx, 2) == 0) {
      return [{noteNum: 36, velocity: 30}, {noteNum: 42, velocity: 30}];
    }
    return [{noteNum: 36, velocity: 30}, {noteNum: 44, velocity: 60}];
}
