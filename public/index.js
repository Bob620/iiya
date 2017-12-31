const play = document.querySelector('.play');
const stop = document.querySelector('.stop');

class AudioOutput {
  constructor(playlist) {
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.audioGain = this.audioCtx.createGain();
    this.playlistBuffer = [];
    this.playlist = playlist;
    this.playing = false;
    this.queue = 0;
    this.ready = false;

    this.audioGain.gain.value = 0.02;
    this.audioGain.connect(this.audioCtx.destination);

    for (let i = 0; i < this.playlist.length; i++) {
      const request = new XMLHttpRequest();
      request.open('GET', this.playlist[i], true);
      request.responseType = 'arraybuffer';
    
      request.onload = () => {
        const audioData = request.response;
        this.audioCtx.decodeAudioData(audioData, (buffer) => {
          this.playlistBuffer[i] = buffer
          if (i === 0) {
            this.ready = true;
            try {
              this.onready();
            } catch (err) {}
          }
        },
        (e) => {"Error with decoding audio data" + e.err});
      }
    
      request.send();
    }
  }

  start() {
    if (this.ready) {
      let source = this.source;
      let playing = this.playing;

      source = this.audioCtx.createBufferSource();
      source.buffer = this.playlistBuffer[this.queue];
      source.connect(this.audioGain);
    
      source.onended = (event) => {
        if (playing) {
          this.queue++;
          if (this.queue < this.playlist.length) {
            this.start();
          } else {
            this.stop();
          }
        }
      }
    
      playing = true;
      source.start();
    }
  }

  stop() {
    if (this.playing) {
      this.playing = false;
      this.source.stop();
    
      // Reset the queue
      this.queue = 0;
    }
  }
}

const audioOutput = new AudioOutput(['http://192.168.1.109/kingdom.mp3', 'http://192.168.1.109/tomoyo.mp3']);
//const audioOutput = new AudioOutput(['http://192.168.1.109/out000.mp3', 'http://192.168.1.109/out001.mp3', 'http://192.168.1.109/out002.mp3', 'http://192.168.1.109/out003.mp3']);

audioOutput.onready = () => {
  play.removeAttribute('disabled');
  stop.removeAttribute('disabled');
}

play.onclick = () => {
  audioOutput.start();
  play.setAttribute('disabled', 'disabled');
}

stop.onclick = () => {
  audioOutput.stop();
  play.removeAttribute('disabled');
}