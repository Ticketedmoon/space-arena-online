import NetworkManager from './networkManager.js';

export default class StartScene extends Phaser.Scene {

    constructor() {
        super();
        this.networkManager = new NetworkManager();
    }

    preload() {
        // this.load.image('ship', 'assets/player.png');
        // this.load.image('sky', 'assets/sky.png');
        this.load.image('otherPlayer', 'assets/player.png');
        
        this.load.path = 'assets/background/';

        // background animation sprites
        this.load.image('background_anim_1', 'background_0.png');
        this.load.image('background_anim_2', 'background_1.png');
        this.load.image('background_anim_3', 'background_2.png');
        this.load.image('background_anim_4', 'background_3.png');
        this.load.image('background_anim_5', 'background_4.png');
        this.load.image('background_anim_6', 'background_5.png');
        this.load.image('background_anim_7', 'background_6.png');
        this.load.image('background_anim_8', 'background_7.png');

        this.load.path = 'assets/player/';

        // Player animation sprites
        this.load.image('player_anim_1', 'player_0.png');
        this.load.image('player_anim_2', 'player_1.png');
        this.load.image('player_anim_3', 'player_2.png');
        this.load.image('player_anim_4', 'player_3.png');
        this.load.image('player_anim_5', 'player_4.png');
        this.load.image('player_anim_6', 'player_5.png');
        this.load.image('player_anim_7', 'player_6.png');
        this.load.image('player_anim_8', 'player_7.png');
    }

    create() {
        // Default settings
        var self = this;
        
        // Setup socket for each client
        this.socket = io();

        // Phaser group - Great for performing multiple operations at the same time.
        this.otherPlayers = this.physics.add.group();

        // Background Image
        self.anims.create({
            key: 'load',
            frames: [
                { key: 'background_anim_1' },
                { key: 'background_anim_2' },
                { key: 'background_anim_3' },
                { key: 'background_anim_4' },
                { key: 'background_anim_5' },
                { key: 'background_anim_6' },
                { key: 'background_anim_7' },
                { key: 'background_anim_8', duration: 10 }
            ],
            frameRate: 8,
            repeat: -1
        });
    
        self.sky = self.physics.add.sprite(0, 0, 'background_anim_1').setOrigin(0, 0).setScale(2, 2).play('load');

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