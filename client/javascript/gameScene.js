import NetworkManager from './networkManager.js';
import ImageLoader from './imageLoader.js';
import AnimationManager from './animationManager.js';
import TextBoxManager from './text-box-manager.js';

export default class GameScene extends Phaser.Scene {

    constructor() {
        super('game');
    }

    init(name) {
        this.userName = name;
    }

    preload() {
        this.imageLoader = new ImageLoader();
        this.animationManager = new AnimationManager();
        this.textBoxManager = new TextBoxManager();
        this.networkManager = new NetworkManager();
        this.imageLoader.loadAnimationImageSets(this);
    }

    create() {
        // Store this keyword for later callbacks.
        var self = this;
        
        // Setup socket for each client
        this.socket = io();

        // Register text box
        this.textBoxManager.registerChatBox(this.socket);
        this.textBoxManager.registerChatBoxVisibilityControls();

        // Phaser group - Great for performing multiple operations at the same time.
        this.otherPlayers = this.physics.add.group();
        this.otherPlayers.enableBody = true;

        this.otherPlayerBullets = this.add.group();

        // Lasers shot by players
        this.animationManager.initializeAnimationGroup(this);

        // Set background
        this.background = this.physics.add.sprite(0, 0, 'background_anim_1').setOrigin(0, 0).setScale(2, 2).play('load');

        // Emit to server to start the socket connection to server
        this.socket.emit('initializeSocketConnection', this.userName);

        // Update current players with new player details.
        this.socket.on('currentPlayers', function(players) {
            Object.keys(players).forEach(function (id) {
                if (players[id].playerId === self.socket.id) {
                    self.networkManager.addPlayer(self, id, players[id]);
                }
                else {
                    self.networkManager.addOtherPlayer(self, id, players[id]);
                }
            });
        });

        // Update new player with all other current player details.
        this.socket.on('newPlayer', function(id, playerInfo) {
            self.networkManager.addOtherPlayer(self, id, playerInfo);
        });

        // Connect user to chat
        this.socket.on('chatUpdate', function(message, colour, userName) {
            self.textBoxManager.updateChatLog(message, colour, userName);
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
                    otherPlayer.rotation = playerInfo.rotation;
                    otherPlayer.x = playerInfo.x;
                    otherPlayer.y = playerInfo.y;
                    otherPlayer.boostActive = playerInfo.boostActive;
                    self.networkManager.updateNameTagLocation(otherPlayer);
                    self.networkManager.checkForOtherPlayerBoostThrusters(otherPlayer);
                }
            });
        });

        this.socket.on('bulletFired', function (bulletData) {
            self.networkManager.spawn_projectile(self, bulletData, 1, 1);
        });

        this.socket.on('meteorFired', function (meteorData) {
            self.networkManager.spawn_projectile(self, meteorData, 3, 3);
        });

        // Initialize default ship cursor key inputs
        this.cursors = this.input.keyboard.addKeys('up, down, left, right, shift');

        // Initialize Meteor Strike function @Letter keys with Phaser
        this.input.keyboard.on('keydown_C', function(event) {
            self.networkManager.ship.fire_meteor_shot(self);
        });

        // Initialize Fire function @Letter keys with Phaser
        this.input.keyboard.on('keydown_X', function(event) {
            self.networkManager.ship.fire_laser(self);
        });

        // Initialize Reload function @Letter keys with Phaser
        this.input.keyboard.on('keydown_R', function(event) {
            self.networkManager.ship.reload();
        });

    }

    update() {
        // Check the ship has been instantiated
        if (this.networkManager.ship) {
            this.networkManager.checkForShipMovement(this);
            this.networkManager.publishPlayerMovement(this);

            // TODO: Refactor - does this NEED to be in update loop?
            this.networkManager.checkForCollisions(this);
        }
    }
}