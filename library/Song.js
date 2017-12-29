const crypto = require('crypto');

/**
 * Song Class
 */
class Song {
  constructor(path, name) {
    this.uuid = ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,b=>(b^crypto.rng(1)[0]%16>>b/4).toString(16));
    this.name = name;
    this.albums = new Map();
    this.artists = new Map();
    this.tags = [];
    this.matched = new Map();
    this.masterSong = undefined;
    this.hasMaster = false;
    this.file = path;
  }

  set master(newMaster) {
    this.masterSong = newMaster;
    if (newMaster === undefined) {
      this.hasMaster = false;
    } else {
      this.hasMaster = true;
    }
  }

  get master() {
    return this.masterSong;
  }

  get penultimateMaster() {
    let master = this.master;
    while(master !== undefined) {
      master = master.master;
    }
  }

  get normalizedName() {
    return this.name.toLowerCase().trim();
  }

  addMatch(song) {
    this.matched.set(song.uuid, song);
    for (let artist in song.artists) {
      if (!this.artists.has(artist.uuid)) {
        this.addArtist(artist);
      }
    }
  }
  
  addAlbum(album) {
    this.albums.set(album.uuid, album);
  }

  addArtist(artist) {
    this.artists.set(artist.uuid, artist);
    artist.addSong(this);
  }
  
  enforce() {
    for (let [uuid, album] in this.albums) {
      album.addSong(this);
    }

    for (let [uuid, artist] in this.artists) {
      artist.addSong(this);
    }
  }
}

module.exports = Song;