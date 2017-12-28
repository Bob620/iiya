const Song = require('./Song.js');
const Album = require('./Album.js');
const Artist = require('./Artist.js');

class Library {
  constructor() {
    this.artists = new Map();
    this.songs = new Map();
    this.albums = new Map();
  }

  /**
   * Adds the directory to the library
   * 
   * @param {string} path 
   */
  addDirectory(path) {

  }

  /**
   * Adds the directories to the library
   * 
   * @param {Array.<string>} paths 
   */
  addDirectories(paths) {
    for (const path in paths) {
      this.addDirectory(path);
    }
  }

  /**
   * Adds the given song to the library
   * 
   * @param {Song} song 
   */
  addSong(song) {
    this.searchExactSong(song.normalizedName)
    .then((matchedSong) => {
      // Found a match
      matchedSong.addMatch(song);
    }).catch(() => {
      // New Song
      this.songs.set(song.uuid, song);
    });
  }

  addAlbum(album) {

  }

  addArtist(artist) {

  }

  /**
   * Get a song via uuid
   * 
   * @param {string} uuid The uuid of the song
   * @returns {Promise.<Song>} The song object requested
   */
  getSong(uuid) {
    return new Promise((resolve, reject) => {
      const song = this.songs.get(uuid);
      if (song === undefined) {
        reject({errorCode: 1, errorText: 'Song not found'});
        return;
      }
      resolve(song);
    });
  }

  /**
   * Get an album via uuid
   * 
   * @param {string} uuid The uuid of the album
   * @returns {Promise.<Album>} The album object requested
   */
  getAlbum(uuid) {
    return new Promise((resolve, reject) => {
      const album = this.albums.get(uuid);
      if (album === undefined) {
        reject({errorCode: 2, errorText: 'Album not found'});
        return;
      }
      resolve(album);
    });
  }

  /**
   * Get an artist via uuid
   * 
   * @param {string} uuid The uuid of the artist
   * @returns {Promise.<Artist>} The artist object requested
   */
  getArtist(uuid) {
    return new Promise((resolve, reject) => {
      const artist = this.artists.get(uuid);
      if (artist === undefined) {
        reject({errorCode: 3, errorText: 'Artist not found'});
        return;
      }
      resolve(artist);
    });
  }

  /**
   * Search everything for the given terms
   * 
   * @param {Array.<string>} terms An array of strings to search for
   * @param {number} maxResults Maximum number of results to return
   * @returns {Array.<Song|Album|Artist>} The items that match the search
   */
  search(terms, maxResults=10) {
    return [];
  }

  /**
   * Serach all songs for the given terms
   * 
   * @param {Array.<string>} terms An array of strings to search for
   * @param {number} maxResults Maximum number of results to return
   * @returns {Array.<Song>} The Songs that match the search
   */
  searchSong(terms, maxResults=10) {
    return [];
  }

  /**
   * Serach all albums for the given terms
   * 
   * @param {Array.<string>} terms An array of strings to search for
   * @param {number} maxResults Maximum number of results to return
   * @returns {Array.<Album>} The Albums that match the search
   */
  searchAlbum(terms, maxResults=10) {
    return [];
  }

  /**
   * Search all Artists for the given terms
   * 
   * @param {Array.<string>} terms An array of strings to search for
   * @param {number} maxResults Maximum number of results to return
   * @returns {Array.<Artist>} The Artists that match the search
   */
  searchArtist(terms, maxResults=10) {
    return [];
  }

  /**
   * Search all Songs for the exact name
   * 
   * @param {Song} searchSong A string to match
   * @returns {Promise.<Song>} The Song that match the search
   */
  searchExactSong(searchSong) {
    return new Promise(() => {
      const searchName = searchSong.normalizedName;
      // Search for the artist
      searchSong.artist.forEach((artist) => {
        this.searchExactArtist(artist.normalizedName)
        .then((artist) => {
          // Artist Exists, could have the song already
          // Search songs by the artist
          artist.searchExactSong(searchName)
          .then((song) => {
            // The song exists, we can then assume they are the same song and layer them
            song.addMatch(searchSong);
            searchSong.master = song;
          }).catch(() => {
            // New song for the artist
          });
        }).catch(() => {
          // New Artist, don't need to worry about the song already existing

        });




      });



      for (let [uuid, song] of this.songs) {
        if (song.normalizedName === searchName) {
          resolve(song);
          return;
        }
      }
      reject();
    });
  }

  /**
   * Search all Albums for the exact name
   * 
   * @param {string} searchName A string to match
   * @returns {Promise.<Album>} The Album that match the search
   */
  searchExactAlbum(searchName) {
    return new Promise(() => {
      for (let [uuid, album] of this.albums) {
        if (album.normalizedName === searchName) {
          resolve(song);
          return;
        }
      }
      reject();
    });
  }

  /**
   * Search all Artists for the exact name
   * 
   * @param {string} searchName A string to match
   * @returns {Promise.<Artist>} The Artist that match the search
   */
  searchExactArtist(searchName) {
    return new Promise(() => {
      for (let [uuid, artist] of this.artists) {
        if (artist.normalizedName === searchName) {
          resolve(song);
          return;
        }
      }
      reject();
    });
  }
}

module.exports = Library;