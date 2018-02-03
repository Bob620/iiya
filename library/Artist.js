const crypto = require('crypto');

/**
 * Artist Class
 */
class Artist {
  constructor(name) {
    this.uuid = ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,b=>(b^crypto.rng(1)[0]%16>>b/4).toString(16));
    this.name = name;
    this.tags = [];
    this.songs = new Map();
    this.albums = new Map();
  }

  get normalizedName() {
    return this.name.toLowerCase().trim();
  }

  get exportable() {
    let lean = {
      uuid: this.uuid,
      name: this.name,
      tags: this.tags,
      songs: [],
      albums: []
    }
    for (let [songUuid, song] of this.songs) {
      lean.songs.push(song.lean);
    }
    for (let [albumUuid, album] of this.albums) {
      lean.albums.push(album.lean);
    }
    return lean;
  }

  get lean() {
    let lean = {
      uuid: this.uuid,
      name: this.name,
      tags: this.tags,
      songs: [],
      albums: []
    }
    for (let [songUuid, song] of this.songs) {
      lean.songs.push(songUuid);
    }
    for (let [albumUuid, album] of this.albums) {
      lean.albums.push(albumUuid);
    }
    return lean;
  }

  addSong(song) {
    this.songs.set(song.uuid, song);
    if (!song.artists.has(this.uuid)) {
      song.addArtist(this);
    }
  }

  addAlbum(album) {
    this.albums.set(album.uuid, album);
    if (!album.artists.has(this.uuid)) {
      album.addArtist(this);
    }
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
    for (let [uuid, song] of this.songs) {
      if (song.normalizedName === searchName) {
        return song;
      }
    }
    return;
  }

  enforce() {
    for (let [uuid, song] of this.songs) {
      if (!song.artists.has(this.uuid))
      song.addArtist(this);
    }

    for (let [uuid, album] of this.albums) {
      if (!album.artists.has(this.uuid)) {
        album.addArtist(this);
      }
    }
  }

  merge(artist) {
    for (let [uuid, song] of artist.songs) {
      this.songs.set(uuid, song);
    }

    for (let [uuid, album] of artist.albums) {
      this.albums.set(uuid, album);
    }

    this.enforce();
  }
}

module.exports = Artist;