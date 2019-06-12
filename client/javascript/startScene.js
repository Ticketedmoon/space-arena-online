import NetworkManager from './networkManager.js';

export default class StartScene extends Phaser.Scene {

    constructor() {
        super();
        this.networkManager = new NetworkManager();
    }

    preload() {
        this.load.image('ship', 'assets/player.png');
        this.load.image('otherPlayer', 'assets/player.png');
        this.load.image('sky', 'assets/sky.png');
        
        // Finish tomorrow
        this.load.image('link', 'assets/blue-link.png');
    }

    create() {
        // Default settings
        var self = this;
        
        // Setup socket for each client
        this.socket = io();

        // Phaser group - Great for performing multiple operations at the same time.
        this.otherPlayers = this.physics.add.group();

        // Sky
        this.add.image(0, 0, 'sky').setOrigin(0, 0);

        // Update current players with new player details.
        this.socket.on('currentPlayers', function(players) {
            Object.keys(players).forEach(function (id) {
                console.log(self);
                if (players[id].playerId === self.socket.id) {
                    self.networkManager.addPlayer(self, players[id]);
                }
                else {
                    self.networkManager.addOtherPlayer(self, players[id]);
                }
            });
        });

        // Update new player with all other current player details.
        this.socket.on('newPlayer', function(playerInfo) {
            self.networkManager.addOtherPlayer(self, playerInfo);
        });


        // Remove player from otherPlayers group if disconnect.
        this.socket.on('disconnect', function(playerId) {
            self.otherPlayers.getChildren().forEach(function (otherPlayer) {
                if (playerId === otherPlayer.playerId) {
                    otherPlayer.destroy();
                }
            });
        });

        this.socket.on('playerMoved', function (playerInfo) {
            self.otherPlayers.getChildren().forEach(function (otherPlayer) {
                if (playerInfo.playerId === otherPlayer.playerId) {
                    otherPlayer.setRotation(playerInfo.rotation);
                    otherPlayer.setPosition(playerInfo.x, playerInfo.y);
                }
            });
        });

        // Initialize keyboard input with Phaser
        this.cursors = this.input.keyboard.createCursorKeys();
        this.scene = this;
    }
    
    update() {
        // Check the ship has been instantiated
        if (this.ship) {
            this.networkManager.checkForPlayerInteraction(this);
            this.networkManager.publishPlayerMovement(this);
        }
    }
}