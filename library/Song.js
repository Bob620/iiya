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

  get exportable() {
    let lean = {
      uuid: this.uuid,
      name: this.name,
      albums: [],
      artists: [],
      tags: this.tags,
      master: this.master
    }
    for (let [albumUuid, album] of this.albums) {
      lean.albums.push(album.lean);
    }
    for (let [artistUuid, artist] of this.artists) {
      lean.artists.push(artist.lean);
    }
    return lean;
  }

  get lean() {
    let lean = {
      uuid: this.uuid,
      name: this.name,
      albums: [],
      artists: [],
      tags: this.tags,
      master: this.master
    }
    for (let [albumUuid, album] of this.albums) {
      lean.albums.push(albumUuid);
    }
    for (let [artistUuid, artist] of this.artists) {
      lean.artists.push(artistUuid);
    }
    return lean;
  }

  addMatch(song) {
    this.matched.set(song.uuid, song);
    for (let [uuid, artist] of song.artists) {
      if (!this.artists.has(uuid)) {
        this.addArtist(artist);
      }
    }
    this.enforce();
  }
  
  addAlbum(album) {
    this.albums.set(album.uuid, album);
    if (album.songs.has(this.uuid)) {
      album.addSong(this);
    }
    for (let [uuid, artist] of this.artists) {
      if (!album.artists.has(uuid)) {
        album.addArtist(artist);
      }
    }
  }

  addArtist(artist) {
    this.artists.set(artist.uuid, artist);
    if (!artist.songs.has(this.uuid)) {
      artist.addSong(this);
    }
  }
  
  enforce() {
    for (let [uuid, album] of this.albums) {
      if (!album.songs.has(this.uuid)) {
        album.addSong(this);
      }
    }

    for (let [uuid, artist] of this.artists) {
      if (!artist.songs.has(this.uuid)) {
        artist.addSong(this);
      }
    }
  }
}

module.exports = Song;