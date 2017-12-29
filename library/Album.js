const crypto = require('crypto');

/**
 * Album Class
 */
class Album {
  constructor(name, ...artists) {
    this.uuid = ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,b=>(b^crypto.rng(1)[0]%16>>b/4).toString(16));
    this.name = name;
    this.order = [];
    this.songs = new Map();
    this.artists = new Map();
    this.tags = [];

    artists.forEach((artist) => {
      this.addArtist(artist);
    });
  }

  addSong(song) {
    this.songs.set(song.uuid, song);
  }

  addArtist(artist) {
    this.artists.set(artist.uuid, artist);
  }

  get normalizedName() {
    return this.name.toLowerCase().trim();
  }

  enforce() {
    for (let [uuid, song] in this.songs) {
      song.addAlbum(this);
    }

    for (let [uuid, artist] in this.artists) {
      artist.addAlbum(this);
    }
  }

  merge(album) {
    for (let [uuid, song] in album.songs) {
      this.songs.set(uuid, song);
    }

    for (let [uuid, artist] in album.artist) {
      this.artists.set(uuid, artist);
    }
  }
}

module.exports = Album;