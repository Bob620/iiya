/**
 * Song Class
 */
class Song {
  constructor() {
    this.uuid = '';
    this.name = '';
    this.albums = new Map();
    this.artists = new Map();
    this.tags = [];
    this.matched = new Map();
    this.master = this;
    this.file = '';
  }

  get normalizedName() {
    return this.name.toLowerCase().trim();
  }

  addMatch(song) {
    this.matched.set(song.uuid, song);
  }
}

module.exports = Song;