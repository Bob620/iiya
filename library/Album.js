const crypto = require('crypto');

/**
 * Album Class
 */
class Album {
  constructor(name, ...artists) {
    this.uuid = ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,b=>(b^crypto.rng(1)[0]%16>>b/4).toString(16));
    this.name = name;
    this.order = [];
    this.tags = [];
    this.songs = new Map();
    this.artists = new Map();

    artists.forEach((artist) => {
      this.addArtist(artist);
    });
  }
  
  get normalizedName() {
    return this.name.toLowerCase().trim();
  }

  get exportable() {
    let lean = {
      uuid: this.uuid,
      name: this.name,
      order: this.order,
      tags: this.tags,
      songs: [],
      artists: []
    }
    for (let [songUuid, song] of this.songs) {
      lean.songs.push(song.lean);
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
      order: this.order,
      tags: this.tags,
      songs: [],
      artists: []
    }
    for (let [songUuid, song] of this.songs) {
      lean.songs.push(songUuid);
    }
    for (let [artistUuid, artist] of this.artists) {
      lean.artists.push(artistUuid);
    }
    return lean;
  }

  addSong(song) {
    this.songs.set(song.uuid, song);
    if (!song.albums.has(this.uuid)) {
      song.addAlbum(this);
    }
  }

  addArtist(artist) {
    this.artists.set(artist.uuid, artist);
    if (!artist.albums.has(this.uuid)) {
      artist.addAlbum(this);
    }
  }

  enforce() {
    for (let [uuid, song] of this.songs) {
      if (!song.albums.has(this.uuid)) {
        song.addAlbum(this);
      }
    }

    for (let [uuid, artist] of this.artists) {
      if (!song.artists.has(this.uuid)) {
        artist.addAlbum(this);
      }
    }
  }

  merge(album) {
    for (let [uuid, song] of album.songs) {
      this.songs.set(uuid, song);
    }

    for (let [uuid, artist] of album.artists) {
      this.artists.set(uuid, artist);
    }

    this.enforce();
  }
}

module.exports = Album;