var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    physics: {
      default: 'arcade',
      arcade: {
        debug: false,
        gravity: { y: 0 }
      }
    },
    scene: {
      preload: preload,
      create: create,
      update: update
    } 
};
   
var game = new Phaser.Game(config);
   
function preload() {
    this.load.image('ship', 'assets/player.png');
    this.load.image('otherPlayer', 'assets/player.png');
}
   
function create() {
    // Default settings
    var self = this;
    this.socket = io();

    // Phaser group - Great for performing multiple operations at the same time.
    this.otherPlayers = this.physics.add.group();

    // Update current players with new player details.
    this.socket.on('currentPlayers', function(players) {
        Object.keys(players).forEach(function (id) {
            if (players[id].playerId === self.socket.id) {
                addPlayer(self, players[id]);
            }
            else {
              addOtherPlayer(self, players[id])
            }
        });
    });

    // Update new player with all other current player details.
    this.socket.on('newPlayer', function(playerInfo) {
        addOtherPlayer(self, playerInfo)
    });


    // Remove player from otherPlayers group if disconnect.
    this.socket.on('disconnect', function(playerId) {
        self.otherPlayers.getChildren().forEach(function (otherPlayer) {
            if (playerId === otherPlayer.playerId) {
                otherPlayer.destroy();
            }
        });
    });
}
   
function update() {}

// External Functions
function addPlayer(self, playerInfo) {

    // Use physics object to enable arcade physics with our ship.
    // Set origin of the object to be the centre rather than the top left -> This allows us to rotate around the origin with ease.
    // Set scale of object (object size)
    self.ship = self.physics.add.image(playerInfo.x, playerInfo.y, 'ship').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
    
    if (playerInfo.team === 'blue') {
        // Set ship colour (Tint)
        self.ship.setTint(0x0000ff);
    } else {
        self.ship.setTint(0xff0000);
    }

    // We used setDrag, setAngularDrag, and setMaxVelocity to modify how the game object reacts to the arcade physics. 
    self.ship.setDrag(100);
    self.ship.setAngularDrag(100);
    self.ship.setMaxVelocity(200);
}

function addOtherPlayer(self, playerInfo) {
    const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'otherPlayer').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
    if (playerInfo.team === 'blue') {
        otherPlayer.setTint(0x0000ff);
    } else {
        otherPlayer.setTint(0xff0000);
    }
    otherPlayer.playerId = playerInfo.playerId;
    self.otherPlayers.add(otherPlayer);
}