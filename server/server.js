// Import Express and instantiate
var express = require('express');
var app = express();

// Import http-server and associate it with express object
var server = require('http').Server(app);

// Import socket.io and associate it with the server to listen.
var io = require('socket.io').listen(server);

// Current online players
var players = {};

// Colours
var colours = require('./colours');

const { random } = require('./util');

// Asteroids
const TOTAL_ASTEROIDS = 32;

// Map
const MAP_W = 6400;
const MAP_H = 1920;

var asteroids = Array(TOTAL_ASTEROIDS).fill().map((_, index) => { 
    // Find way to get mapW + mapH so not to require changes here each time map size changes.
    return {
        id: index,
        x: random(100, MAP_W - 100),
        y: random(100, MAP_H - 100),
        scale: 0.3 + (Math.random() / 0.5) * 0.5,
        rotation: Math.random() * 35
    }
});

console.log("Loading Client data from: " + process.cwd() + "\\client")
app.use(express.static(process.cwd() + '/client'));
 
// Root
app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/client/index.html');
});

// Return info
app.get('/information', (req, res) => {
    res.sendFile(process.cwd() + '/client/info.html');
});

// Anytime a player has connected, this is called.
io.on('connection', (socket) => {
    // Log that a player has connected
    console.log(`Connected: User with socket ID (${socket.id})`);
    
    players[socket.id] = {
        name: "",
        rotation: 0,
        playerId: socket.id,
        colour: colours[0].random(),
        x: Math.floor(Math.random() * 700) + 50,
        y: Math.floor(Math.random() * 500) + 50,
        boostActive: false
    };

    socket.on('initializeSocketConnection', (userName) => {
        players[socket.id].name = userName;

        // Send all player data to the new player
        socket.emit('currentPlayers', players);

        // Send all asteroid data to the new player
        socket.emit('asteroids', asteroids, null)

        // Update all other players of the new player
        socket.broadcast.emit('newPlayer', socket.id, players[socket.id]);
    });

    socket.on('disconnect', () => {
        // Log that a player has disconnected
        console.log(`Disconnected: User with socket ID (${socket.id}).`);
        // Remove this player from our players object
        delete players[socket.id]
        // Emit a message to all other player sockets to remove this player
        io.emit('disconnect', socket.id);
    });

    // when a player moves, update the player data
    socket.on('playerMovement', (movementData) => {
        players[socket.id].x = movementData.x;
        players[socket.id].y = movementData.y;
        players[socket.id].rotation = movementData.rotation;
        players[socket.id].boostActive = movementData.boostActive
        
        // emit a message to all players about the player that moved
        socket.broadcast.emit('playerMoved', players[socket.id]);
    });

    socket.on('bulletFired', (bulletData) => {
        socket.broadcast.emit('bulletFired', bulletData);
    });

    socket.on('meteorFired', (meteorData) => {
        socket.broadcast.emit('meteorFired', meteorData);
    });

    socket.on('asteroid_group_update', (asteroid_id_to_destroy) => {
        asteroids = asteroids.filter((asteroid) => {
            return asteroid.id !== asteroid_id_to_destroy
        });
        socket.broadcast.emit('asteroids', asteroids, asteroid_id_to_destroy);
    })

    socket.on('chatUpdate', (message, playerId) => {
        // Emit messages
        io.emit('chatUpdate', message, players[playerId].colour, players[playerId].name);
    });
    
});

server.listen(process.env.PORT || 8080, () => {
    console.log(`Game server active and Listening on ${server.address().port}`);
});