// External Modules
const express = require('express');

// Internal Modules
const Library = require('./library/Library2.js');

// Initialization
const apiServer = express(),
      library = new Library();

let settings = require('./settings.json');

library.addDirectories(settings.directories);

apiServer.use('/assets', express.static(`${__dirname}/public`));

apiServer.get('/', (req, res) => {
  res.sendFile(`${__dirname}/pages/index.html`);
});

apiServer.post('/login', (req, res) => {
  res.sendStatus(403).end();
});

apiServer.get('/entry/artists', (req, res) => {
  const artists = [];
  for (let [uuid, artist] of library.artists) {
    artists.push(artist.exportable);
  }
  res.send(artists).end();
});

apiServer.get('/entry/albums', (req, res) => {
  const albums = [];
  for (let [uuid, album] of library.albums) {
    albums.push(album.exportable);
  }
  res.send(albums).end();
});

apiServer.get('/entry/songs', (req, res) => {
  const songs = [];
  for (let [uuid, song] of library.songs) {
    songs.push(song.exportable);
  }
  res.send(songs).end();
});

apiServer.get('/artists/:uuid', (req, res) => {
  const artist = library.artists.get(req.params.uuid);
  if (artist) {
    res.send(artist.exportable).end();
  } else {
    res.sendStatus(204).end();
  }
});

apiServer.get('/albums/:uuid', (req, res) => {
  const album = library.albums.get(req.params.uuid);
  if (album) {
    res.send(album.exportable).end();
  } else {
    res.sendStatus(204).end();
  }
});

apiServer.get('/songs/:uuid', (req, res) => {
  const song = library.songs.get(req.params.uuid);
  if (song) {
    res.send(song.exportable).end();
  } else {
    res.sendStatus(204).end();
  }
});

apiServer.get('/stream/:uuid', (req, res) => {
  const song = library.songs.get(req.params.uuid);
  if (song) {
    res.sendFile(`${__dirname}/${song.file.substr(2, song.file.length)}`);
  } else {
    res.sendStatus(204).end();
  }
});

apiServer.listen('5009');

console.log('API Server listening on port 5009');