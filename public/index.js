const playButton = document.querySelector('#button-play');
const stopButton = document.querySelector('#button-stop');
const nextButton = document.querySelector('#button-next');

class Song {
  constructor(uuid, audioCtx=new (window.AudioContext || window.webkitAudioContext)()) {
    this.audioCtx = audioCtx;
    this.uuid = uuid;
    this.buffer;
    this.duration;
    this.sourceNode;
    this.loading = false;
    this.preloaded = false;
    this.playing = false;
    this.onended = () => {};
  }

//  get duration() {
//    console.log(this.buffer);
//    return this.buffer.duration;
//  }

  start(delay) {
    if (!this.playing && this.preloaded) {
      this.playing = true;
      this.preloaded = false;
      this.sourceNode.start(delay);
    }
  }

  stop(delay) {
    if (this.playing) {
      this.playing = false;
      this.sourceNode.stop(delay);
      this.sourceNode = undefined;
    }
  }

  download() {
    if (this.buffer === undefined) {
      if (this.loading) {
        return Promise.reject();
      }
      return new Promise((resolve, reject) => {
        this.loading = true;
        const request = new XMLHttpRequest();
        request.open('GET', `stream/${this.uuid}`, true);
        request.responseType = 'arraybuffer';
      
        request.onload = () => {
          this.buffer = request.response;
          this.loading = false;
          resolve();
        }
      
        request.send();
      });
    } else {
      return Promise.resolve();
    }
  }

  dump() {
    this.buffer = undefined;
    this.preloaded = false;
  }

  preload(destination) {
    if (!this.preloaded && this.buffer !== undefined) {
      return new Promise((resolve, reject) => {
        this.audioCtx.decodeAudioData(this.buffer, (buffer) => {
          this.duration = buffer.duration;
          this.preloaded = true;
          this.sourceNode = this.audioCtx.createBufferSource();
          this.sourceNode.buffer = buffer;
          this.sourceNode.connect(destination);
          this.sourceNode.onended = () => {this.onended()};
          resolve();
        },
        (e) => {
          console.log(e);
          reject();
        });
      })
    }
    return Promise.reject();
  }
}

class AudioOutput {
  constructor(defaultQueueUuids=[]) {
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.audioGain = this.audioCtx.createGain();
    this.queue = [];
    this.playing = false;
    this.position = 0;
    this.timeOffset = 0;
    this.ready = false;

    defaultQueueUuids.forEach((uuid) => {
      this.queue.push(new Song(uuid, this.audioCtx));
    });

    this.audioGain.gain.value = 0.1;
    this.audioGain.connect(this.audioCtx.destination);

    if (this.queue.length > 0) {
      this.tryPreloadCurrent();
    }
  }

  tryPreloadCurrent() {
    const pos = this.position;
    const song = this.queue[pos];
    song.download().then(() => {
      song.preload(this.audioGain).then(() => {
        song.onended = (event) => {
          if (this.playing) {
            if (pos+1 < this.queue.length) {
              this.start();
            } else {
              this.stop();
            }
          } else {
            this.stop();
          }
        }
        console.log(`Supposed to have Preloaded ${pos}, actual value: ${song.preloaded}`);
      
        if (!this.ready && !this.playing) {
          this.ready = true;
          try {
            this.onready();
          } catch(err) {}
        }
      }).catch((err) => {});
    }).catch((err) => {});
    this.tryPreloadNext();
  }

  tryPreloadNext() {
    this.tryPreload(this.position+1);
  }

  tryPreload(pos) {
    if (this.queue.length > pos) {
      const song = this.queue[pos];
      song.download().then(() => {
        song.preload(this.audioGain).then(() => {
          song.onended = (event) => {
            if (this.playing) {
              if (pos+1 < this.queue.length) {
                this.start();
              } else {
                this.stop();
              }
            } else {
              this.stop();
            }
          }
          console.log(`Supposed to have Preloaded ${pos}, actual value: ${song.preloaded}`);
        }).catch((err) => {});
      }).catch((err) => {});
    }
  }

/**
 * In-line playing (such as for stringing audio clips togeather with no silence between)
 *
  start() {
    if (!this.playing) {
      this.playing = true;
      this.timeOffset = this.audioCtx.currentTime + 0.010;
      this.queue[this.position].start(this.timeOffset);
      this.timeOffset += (this.queue[this.position] !== undefined ? this.queue[this.position].duration : 0);
      this.queue[this.position+1].start(this.timeOffset);
      this.position += 2;
      this.tryPreloadCurrent();
    } else if (this.ready) {
      this.playing = true;
      this.timeOffset += (this.queue[this.position] !== undefined ? this.queue[this.position].duration : 0);
      this.queue[this.position].start(this.timeOffset);
      this.position++;
      this.tryPreloadCurrent();
    }
  }
*/
  /**
   * Play a full-length mp3 while background loading/attaching (but not starting) next track
   */
  start() {
    if (!this.playing) {
      this.playing = true;
      this.timeOffset = this.audioCtx.currentTime + 0.020; // 20 ms delay till start
      const song = this.queue[this.position];
      song.start(this.timeOffset); // Start the song with const delay
      window.setTimeout(() => { // Set a delay for the next tick
        console.log(song.duration);
        this.timeOffset = this.timeOffset + song.duration + 0.500; // Increment delay to a position just after this song ends (500ms gap)
        this.tryPreloadNext(); // Make sure the next song is downloaded and preloaded
      }, 1000);
    } else {
      this.position++; // Increment the position to prepare for playing the next song
      console.log(this.position);
      console.log(this.queue[this.position]);
      const song = this.queue[this.position];
      song.start(this.timeOffset);
      window.setTimeout(() => {
        console.log(song.duration);
        this.timeOffset = this.timeOffset + song.duration + 0.500;
        this.tryPreloadNext();
      }, 1000);
    }
  }

  stop() {
    if (this.playing) {
      this.playing = false;
      this.queue[this.position].stop();
    }
    
    // Reset the position
    this.position = 0;
    this.tryPreloadCurrent();
  }

  next() {
    const pos = this.position;
    this.timeOffset = this.audioCtx.currentTime + 0.500;
    this.stop();
    this.position = pos;
    this.playing = true;
  }

  prev() {
    const pos = this.position - 2;
    this.timeOffset = this.audioCtx.currentTime + 0.500;
    this.stop();
    this.position = pos;
    this.playing = true;
  }

  enqueue(uuid) {
    this.queue.push(new Song(uuid, this.audioCtx));
    this.tryPreloadCurrent();
  }

  dequeue(pos) {
    this.queue.splice(pos, 1);
    this.tryPreloadCurrent();
  }

  changePosition(currentPos, newPos) {
    const song = this.queue[currentPos];
    this.dequeue(currentPos);
    newPos = newPos > currentPos ? newPos - 1 : newPos;
    for (let i = this.queue.length-1; i > newPos; i++) {
      this.queue[i] = this.queue[i-1];
    }
    this.queue[newPos] = song;
    this.tryPreloadCurrent();
  }
}

//const audioOutput = new AudioOutput([
//  'out000.mp3', 'out001.mp3', 'out002.mp3', 'out003.mp3',
//  'out004.mp3', 'out005.mp3', 'out006.mp3', 'out007.mp3',
//  'out008.mp3', 'out009.mp3', 'out010.mp3', 'out011.mp3',
//  'out012.mp3', 'out013.mp3', 'out014.mp3', 'out015.mp3',
//  'out016.mp3', 'out017.mp3', 'out018.mp3', 'out019.mp3',
//  'out020.mp3', 'out021.mp3'
//]);

const audioOutput = new AudioOutput();

function getSongs() {
  axios.get('/entry/songs')
  .then((res) => {
    res.data.forEach((song) => {
      audioOutput.enqueue(song.uuid);
    });
  }).catch((err) => {
    console.log(err);
  })
}

getSongs();

audioOutput.onready = () => {
  playButton.removeAttribute('disabled');
}

playButton.onclick = () => {
  audioOutput.start();
  playButton.setAttribute('disabled', 'disabled');
  nextButton.removeAttribute('disabled');
  stopButton.removeAttribute('disabled');
}

stopButton.onclick = () => {
  audioOutput.stop();
  playButton.removeAttribute('disabled');
  nextButton.setAttribute('disabled', 'disabled');
  stopButton.setAttribute('disabled', 'disabled');
}

nextButton.onclick = () => {
  audioOutput.next();
}