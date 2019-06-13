// Import Express and instantiate
var express = require('express');
var app = express();

// Import http-server and associate it with express object
var server = require('http').Server(app);

// Import socket.io and associate it with the server to listen.
var io = require('socket.io').listen(server);

// Current online players
var players = {};

app.use(express.static(process.cwd() + '/client'));
 
app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/client/index.html');
});

// Anytime a player has connected, this is called.
io.on('connection', function (socket) {
    // Log that a player has connected
    console.log(`Connected: User with socket ID (${socket.id})`);
    
    players[socket.id] = {
        rotation: 0,
        x: Math.floor(Math.random() * 700) + 50,
        y: Math.floor(Math.random() * 500) + 50,
        playerId: socket.id,
        team: (Math.random() > 0.5) ? 'red' : 'blue',
        thrustersActive: false
    };

    // Send the all player data to the new player
    socket.emit('currentPlayers', players);

    // Update all other players of the new player
    socket.broadcast.emit('newPlayer', players[socket.id]);

    socket.on('disconnect', function () {
        // Log that a player has disconnected
        console.log(`Disconnected: User with socket ID (${socket.id}).`);
        // Remove this player from our players object
        delete players[socket.id]
        // Emit a message to all other player sockets to remove this player
        io.emit('disconnect', socket.id);
    });

    // when a player moves, update the player data
    socket.on('playerMovement', function (movementData) {
        players[socket.id].x = movementData.x;
        players[socket.id].y = movementData.y;
        players[socket.id].rotation = movementData.rotation;
        players[socket.id].boostActive = movementData.boostActive
        
        // emit a message to all players about the player that moved
        socket.broadcast.emit('playerMoved', players[socket.id]);
    });
});

server.listen(process.env.PORT || 8080, function () {
    console.log(`Game server active and Listening on ${server.address().port}`);
});