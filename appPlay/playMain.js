
main();

function main() {
  let beatsPerBar = 4;
  let numSubdivisions = 1;
  let currBeat = 0;
  let playingIntervalId = null;
  let beatsPerMin = 60;
  document.getElementById('incr-bpm').onclick = _ => {
      beatsPerMin += 10;
      restart();
  }
  document.getElementById('decr-bpm').onclick = _ => {
      if (beatsPerMin <= 10) {
          return;
      }
      beatsPerMin -= 10;
      restart();
  }
  document.getElementById('incr-beats').onclick = _ => {
      beatsPerBar += 1;
      restart();
  }
  document.getElementById('decr-beats').onclick = _ => {
      if (beatsPerBar <= 1) {
          return;
      }
      beatsPerBar -= 1;
      restart();
  }
  document.getElementById('play-toggle').onclick = _ => {
      if (playingIntervalId) {
          clearInterval(playingIntervalId);
          playingIntervalId = null;
          return;
      }
      restart();
  }
  function restart() {
      if (playingIntervalId) {
        clearInterval(playingIntervalId);
        playingIntervalId = null;
      }
      playingIntervalId = window.setInterval(_ => {
          let utterance = new SpeechSynthesisUtterance(`${currBeat + 1}`);
          utterance.rate = 0.9;
          window.speechSynthesis.speak(utterance);
          currBeat += 1;
          currBeat = currBeat % beatsPerBar;
      }, 60 / beatsPerMin * 1000);
  }
}

function createCycle(beatsPerBar, numSubdivisions) {

}