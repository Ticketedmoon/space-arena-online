var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

app.use(express.static(process.cwd() + '/public'));
 
app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/public/index.html');
});
 
io.on('connection', function (socket) {
    console.log(`Connected: User with socket ID (${socket.id})`);
    socket.on('disconnect', function () {
        console.log(`Disconnected: User with socket ID (${socket.id}).`);
    });
});

server.listen(8080, function () {
  console.log(`Listening on ${server.address().port}`);
});