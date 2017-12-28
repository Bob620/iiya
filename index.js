// External Modules
const express = require('express');

// Internal Modules
const Library = require('./library/Library.js');

// Initialization
const apiServer = express(),
      library = new Library();

let settings = require('./settings.json');

library.addDirectories(settings.directories);

apiServer.get('/', (req, res) => {
  res.sendStatus(403).end();
});

apiServer.post('/login', (req, res) => {

});

apiServer.listen('5009');

console.log('API Server listening on port 5009');