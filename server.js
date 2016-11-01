
const express = require('express');
const bodyParser = require('body-parser');
 
const app = express();
 
// Run server to listen on port 3000.
const server = app.listen(3000, () => {
  console.log('listening on *:3000');
});
 
const io = require('socket.io')(server);
 
app.use(bodyParser.urlencoded({ extended: false } ));
app.use(express.static('static'));
 
// Set socket.io listeners.
io.on('connection', (socket) => {
  console.log('a user connected');
 
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});