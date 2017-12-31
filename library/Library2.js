const fs = require('fs');

const promptSync = require('prompt-sync')();

const Song = require('./Song.js'),
      Album = require('./Album.js'),
      Artist = require('./Artist.js');

class Library {
  constructor() {
    this.songs = new Map();
    this.albums = new Map();
    this.artists = new Map();
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
          const actualAlbumName = promptSync(`Please enter album name(${albumName}): `);
          let album = new Album(actualAlbumName !== '' ? actualAlbumName : albumName);
          album = this.addAlbum(album);

          const albumFiles = fs.readdirSync(`${path}/${albumName}`);
          albumFiles.forEach((fileName) => {
            if (fileName.endsWith('.mp3')) {
              const suggestedName = fileName.substr(0, fileName.length-4).split(' - ');
              const actualName = promptSync(`Please enter song name(${suggestedName[1]}): `);
              let song = new Song(`${path}/${albumName}/${fileName}`, actualName !== '' ? actualName : suggestedName[1]);

              const artistName = promptSync(`Please enter artist name(${suggestedName[0]}): `);

              let artist = this.addArtist(new Artist(artistName !== '' ? artistName : suggestedName[0]));

//              album.addArtist(artist);
              song.addArtist(artist);
              song.addAlbum(album);

              this.addSong(song);
            }
          });
        }
      } else {

      }
    });
    console.log(this.artists);
    console.log(this.albums);
    console.log(this.songs);
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
   * Adds an song to the library and returns the song in the library
   * 
   * @param {Song} song The song to add
   * @returns {Song} The song in the library
   */
  addSong(song) {
    const librarySong = this.findExactSongSync(song);
    if (librarySong) {
      librarySong.addMatch(song);
      return librarySong;
    }
    this.songs.set(song.uuid, song);
    song.enforce();
    return song;
  }

  /**
   * Adds an album to the library and returns the album in the library
   * 
   * @param {Album} album The album to add
   * @returns {Album} The album in the library
   */
  addAlbum(album) {
    const libraryAlbum = this.findExactAlbumSync(album);
    if (libraryAlbum) {
      libraryAlbum.merge(album);
      return libraryAlbum;
    }
    this.albums.set(album.uuid, album);
    album.enforce();
    return album;
  }

  /**
   * Adds an artist to the library and returns the artist in the library 
   * 
   * @param {Artist} artist The artist to add
   * @return {Artist} The artist in the library
   */
  addArtist(artist) {
    const libraryArtist = this.findExactArtistSync(artist);
    if (libraryArtist) {
      libraryArtist.merge(artist);
      return libraryArtist;
    }
    this.artists.set(artist.uuid, artist);
    artist.enforce();
    return artist;
  }

  /**
   * Search all Songs for the exact Song
   * 
   * @param {Song} searchSong A song to match
   * @returns {(Song|undefined)} The Song that matches the search
   */
  findExactSongSync(searchSong) {
    // Song must have same artist and name
    for (let [uuid, song] of this.songs) {
      if (uuid === searchSong.uuid) {
        return song;
      }
      if (song.normalizedName === searchSong.normalizedName) {
        for (let [artistUuid, artist] of searchSong.artists) {
          for (let [songArtistUuid, songArtist] of song.artists) {
            if (artistUuid === songArtistUuid) {
              return song;
            }
            if (songArtist.normalizedName === artist.normalizedName) {
              return song;
            }
          }
        }
      }
    }
    return;
  }

  /**
   * Search all Albums for the exact Album
   * 
   * @param {Album} searchAlbum An album to match
   * @returns {(Album|undefined)} The Album that match the search
   */
  findExactAlbumSync(searchAlbum) {
    // Album must have the same artist and name
    for (let [uuid, album] of this.albums) {
      if (uuid === searchAlbum.uuid) {
        return album;
      }
      if (album.normalizedName === searchAlbum.normalizedName) {
        for (let [artistUuid, artist] of searchAlbum.artists) {
          for (let [albumArtistUuid, albumArtist] of song.artists) {
            if (artistUuid === albumArtistUuid) {
              return album;
            }
            if (albumArtist.normalizedName === artist.normalizedName) {
              return album;
            }
          }
        }
      }
    }
    return;
  }

  /**
   * Search all Artists for the exact name
   * 
   * @param {Artist} searchArtist An artist to match
   * @returns {(Artist|undefined)} The Artist that match the search
   */
  findExactArtistSync(searchArtist) {
    // Artist must have the same name
    for (let [uuid, artist] of this.artists) {
      if (uuid === searchArtist.uuid || artist.normalizedName === searchArtist.normalizedName) {
        return artist;
      }
    }
    return;
  }

}

module.exports = Library;