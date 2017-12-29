const fs = require('fs');

const promptSync = require('prompt-sync')();

const Song = require('./Song.js');
      Album = require('./Album.js');
      Artist = require('./Artist.js');

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
    const files = fs.readdirSync(path);
    files.forEach((fileName) => {
      if (!fileName.endsWith('.mp3')) {
        const stats = fs.statSync(`${path}/${fileName}`);
        if (stats.isDirectory()) {
          const albumName = fileName;
          const albumFiles = fs.readdirSync(`${path}/${albumName}`);
          albumFiles.forEach((fileName) => {
            if (fileName.endsWith('.mp3')) {
              const suggestedName = fileName.substr(0, fileName.length-4).split(' - ');
              const actualName = promptSync(`Please enter song name(${suggestedName[1]}): `);
              let song = new Song(`${path}/${albumName}/${fileName}`, actualName !== '' ? actualName : suggestedName[1]);

              const artistName = promptSync(`Please enter artist name(${suggestedName[0]}): `);
              
              const actualAlbumName = promptSync(`Please enter album name(${albumName}): `);
              let album = new Album(actualAlbumName !== '' ? actualAlbumName : albumName);

              let artist = this.addArtist(new Artist(artistName !== '' ? artistName : suggestedName[0]));

              album.addArtist(artist);
              album = this.addAlbum(album);

              song.addArtist(artist);
              song.addAlbum(album);

              this.addSong(song);
            }
          });
        }
      } else {

      }
    });
    console.log(this.albums);
  }

  /**
   * Adds the directories to the library
   * 
   * @param {Array.<string>} paths 
   */
  addDirectories(paths) {
    paths.forEach((path) => {
      this.addDirectory(path);
    });
  }

  /**
   * Adds the given song to the library
   * 
   * @param {Song} song 
   * @returns {Song} The song in the library
   */
  addSong(song) {
    const existingSong = this.searchExactSongSync(song);
    if (existingSong) {
      const masterSong = existingSong.penultimateMaster;
      // The song exists, we can then assume they are the same song and layer them
      masterSong.addMatch(searchSong);
      searchSong.master = masterSong;
      return masterSong;
    }
    // New song for the artists
    this.songs.set(song.uuid, song);
    song.enforce();
    return song;
  }

  /**
   * Adds the given album to the library
   * 
   * @param {Album} album 
   * @returns {Album} The album in the library
   */
  addAlbum(album) {
    const existingAlbum = this.searchExactAlbumSync(album);
    if (existingAlbum) {
      // Album exists, merge
      existingAlbum.merge(album);
      existingAlbum.enforce();
      return existingAlbum;
    }
    // New album
    this.albums.set(album.uuid, album);
    album.enforce();
    return album;
  }

  /**
   * Adds the given artist to the library
   * 
   * @param {Artist} artist 
   * @returns {Artist} The artist in the library
   */
  addArtist(artist) {
    const existingArtist = this.searchExactArtistSync(artist.normalizedName);
    if (existingArtist) {
      // Artist exists, merge
      existingArtist.merge(artist);
      existingArtist.enforce();
      return existingArtist;
    }
    // New artist
    this.artists.set(artist.uuid, artist);
    artist.enforce();
    return artist;
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
   * @returns {Promise.<Song>} The Song that matches the search
   */
  searchExactSong(searchSong) {
    return new Promise((resolve, reject) => {
      const searchName = searchSong.normalizedName;
      // Search for the artist
      searchSong.artist.forEach((artist) => {
        artist.searchExactSong(searchName)
        .then((song) => {
          // We found a song that matches, but we need the master of the chain
          resolve(song.penultimateMaster);
          return;
        }).catch(() => {
          // New song for the artist
          reject();
          return;
        });
      });
    });
  }

  /**
   * Search all Albums for the exact name
   * 
   * @param {Album} searchAlbum A string to match
   * @returns {Promise.<Album>} The Album that match the search
   */
  searchExactAlbum(searchAlbum) {
    return new Promise((resolve, reject) => {
      searchAlbum.artists.forEach((artist) => {
        for (let [uuid, album] of artist.albums) {
          if (album.normalizedName === searchName) {
            // Found the album
            resolve(album);
            return;
          }
        }
      });
      // Album doesn't exist
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
    return new Promise((resolve, reject) => {
      for (let [uuid, artist] of this.artists) {
        console.log(`${artist.normalizedName} || ${searchName}`);
        if (artist.normalizedName === searchName) {
          // Found the artist
          resolve(artist);
          return;
        }
      }
      // Artist doesn't exist
      reject();
    });
  }

    /**
   * Search all Songs for the exact name
   * 
   * @param {Song} searchSong A string to match
   * @returns {(Song|undefined)} The Song that matches the search
   */
  searchExactSongSync(searchSong) {
    const searchName = searchSong.normalizedName;
    // Search for the artist
    for (let [uuid, artist] of searchSong.artists) {
      const song = artist.searchExactSongSync(searchName);
      if (song) {
        // We found a song that matches, but we need the master of the chain
        return song.penultimateMaster;
      }
      // New song for the artist
      return;
    }
  }

  /**
   * Search all Albums for the exact name
   * 
   * @param {Album} searchAlbum A string to match
   * @returns {(Album|undefined)} The Album that match the search
   */
  searchExactAlbumSync(searchAlbum) {
    const searchName = searchAlbum.normalizedName;
    console.log(searchAlbum.artists);
    for (let [artistUuid, artist] of searchAlbum.artists) {
      for (let [uuid, album] of artist.albums) {
        console.log(`${album.normalizedName} || ${searchName}`);
        if (album.normalizedName === searchName) {
          // Found the album
          return album;
        }
      }
    }
    // Album doesn't exist
    return;
  }

  /**
   * Search all Artists for the exact name
   * 
   * @param {string} searchName A string to match
   * @returns {(Artist|undefined)} The Artist that match the search
   */
  searchExactArtistSync(searchName) {
    for (let [uuid, artist] of this.artists) {
      if (artist.normalizedName === searchName) {
        // Found the artist
        return artist;
      }
    }
    // Artist doesn't exist
    return;
  }
}

module.exports = Library;