const crypto = require('crypto');

/**
 * Artist Class
 */
class Artist {
  constructor(name) {
    this.uuid = ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,b=>(b^crypto.rng(1)[0]%16>>b/4).toString(16));
    this.name = name;
    this.songs = new Map();
    this.albums = new Map();
    this.tags = [];
  }

  get normalizedName() {
    return this.name.toLowerCase().trim();
  }

  addSong(song) {
    this.songs.set(song.uuid, song);
  }

  addAlbum(album) {
    this.songs.set(album.uuid, album);
  }

  /**
   * Searches for the exact song
   * 
   * @param {string} searchName 
   * @returns {Promise.<Song>} The song with the matching name
   */
  searchExactSong(searchName) {
    return new Promise((resolve, reject) => {
      for (let [uuid, song] in this.songs) {
        if (song.normalizedName === searchName) {
          resolve(song);
          return;
        }
      }
      reject();
    });
  }

  /**
   * Searches for the exact song
   * 
   * @param {string} searchName 
   * @returns {(Song|undefined)} The song with the matching name
   */
  searchExactSongSync(searchName) {
    for (let [uuid, song] in this.songs) {
      if (song.normalizedName === searchName) {
        return song;
      }
    }
    return;
  }

  enforce() {
    for (let [uuid, song] in this.songs) {
      song.addArtist(this);
    }

    for (let [uuid, album] in this.albums) {
      album.addArtist(this);
    }
  }

  merge(artist) {
    for (let [uuid, song] in artist.songs) {
      this.songs.set(uuid, song);
    }

    for (let [uuid, album] in artist.album) {
      this.albums.set(uuid, album);
    }
  }
}

module.exports = Artist;