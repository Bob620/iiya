/**
 * Album Class
 */
class Album {
  constructor() {
    this.uuid = '';
    this.name = '';
    this.songs = new Map();
    this.artists = new Map();
    this.tags = [];
  }

  get normalizedName() {
    return this.name.toLowerCase().trim();
  }
}

module.exports = Album;