/**
 * Artist Class
 */
class Artist {
  constructor() {
    this.uuid = '';
    this.name = '';
    this.songs = new Map();
    this.albums = new Map();
    this.tags = [];
  }

  get normalizedName() {
    return this.name.toLowerCase().trim();
  }

  /**
   * Searches for the exact song
   * 
   * @param {string} searchName 
   * @returns {Song} The song with the matching name
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
}

module.exports = Artist;