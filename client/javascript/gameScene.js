import NetworkManager from './networkManager.js';
import ImageLoader from './imageLoader.js';
import AnimationManager from './animationManager.js';
import TextBoxManager from './text-box-manager.js';

export default class GameScene extends Phaser.Scene {

    constructor() {
        super('game');
        this.userName = null;
    }

    init(name) {
        this.userName = name;
    }

    preload() {
        this.imageLoader = new ImageLoader();
        this.animationManager = new AnimationManager();
        this.textBoxManager = new TextBoxManager();
        this.networkManager = new NetworkManager(Phaser.GameObjects.Sprite);
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

        // Set background
        this.animationManager.initializeAnimationGroup(this);
        this.background = this.physics.add.sprite(0, 0, 'background_anim_1').setOrigin(0, 0).setScale(2, 2).play('load');

        // Emit to server to start the socket connection to server
        this.socket.emit('initializeSocketConnection', this.userName);

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
                    otherPlayer.setRotation(playerInfo.rotation);
                    otherPlayer.setPosition(playerInfo.x, playerInfo.y);
                    self.networkManager.updateNameTagLocation(otherPlayer);
                    self.networkManager.checkForThrusterInitiation(playerInfo, otherPlayer);
                }
            });
        });

        // Initialize keyboard input with Phaser
        this.cursors = this.input.keyboard.addKeys('up, down, left, right, shift');
    }
    
    update() {
        // Check the ship has been instantiated
        if (this.ship) {
            this.networkManager.checkForPlayerInteraction(this);
            this.networkManager.publishPlayerMovement(this);
        }
    }
}