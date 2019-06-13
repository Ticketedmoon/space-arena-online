import NetworkManager from './networkManager.js';
import ImageLoader from './imageLoader.js';
import AnimationManager from './animationManager.js';

export default class StartScene extends Phaser.Scene {

    constructor() {
        super();
        this.networkManager = new NetworkManager(Phaser.GameObjects.Sprite);
    }

    preload() {
        this.imageLoader = new ImageLoader();
        this.animationManager = new AnimationManager();
        this.imageLoader.loadAnimationImageSets(this);
    }

    create() {
        // Store this keyword for later callbacks.
        var self = this;
        
        // Setup socket for each client
        this.socket = io();

        // Phaser group - Great for performing multiple operations at the same time.
        this.otherPlayers = this.physics.add.group();
    
        // Load Animations from Animation Manager
        this.animationManager.initializeAnimationGroup(this);

        // Set background
        self.background = self.physics.add.sprite(0, 0, 'background_anim_1').setOrigin(0, 0).setScale(2, 2).play('load');

        // Update current players with new player details.
        this.socket.on('currentPlayers', function(players) {
            Object.keys(players).forEach(function (id) {
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
                    otherPlayer.entityText.destroy();
                }
            });
        });

        this.socket.on('playerMoved', function (playerInfo) {
            self.otherPlayers.getChildren().forEach(function (otherPlayer) {
                if (playerInfo.playerId === otherPlayer.playerId) {
                    otherPlayer.setRotation(playerInfo.rotation);
                    otherPlayer.setPosition(playerInfo.x, playerInfo.y);
                    self.networkManager.updateNameTagLocation(otherPlayer);
                    self.networkManager.checkForThrusterInitiation(playerInfo, otherPlayer);
                }
            });
        });

        // Initialize keyboard input with Phaser
        this.cursors = this.input.keyboard.createCursorKeys();
    }
    
    update() {
        // Check the ship has been instantiated
        if (this.ship) {
            this.networkManager.checkForPlayerInteraction(this);
            this.networkManager.publishPlayerMovement(this);
        }
    }
}