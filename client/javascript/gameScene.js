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
        this.networkManager = new NetworkManager(this);
        this.imageLoader.loadAnimationImageSets(this);
    }

    // TODO: Refactor ship into its own class.
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

        // Lasers shot by players
        this.animationManager.initializeAnimationGroup(this);

        this.lasers = this.physics.add.group();
        this.lasers.enableBody = true;
        this.lasers.maxSize = 60;
        this.lasers.ammo = 60;
        this.lasers.magazineSize = 12;

        this.meteorShots = this.physics.add.group();
        this.meteorShots.enableBody = true;
        this.meteorShots.maxSize = 10;
        this.meteorShots.ammo = 10;

        // Set background
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

            // Set ammo sprite
            self.meteorShots.ui = self.physics.add.sprite(self.scale.width, self.scale.height, 'ammo_' + self.meteorShots.ammo.toString()).setOrigin(1.5, 1.25).setScale(1, 1);
        });

        // Update new player with all other current player details.
        this.socket.on('newPlayer', function(playerInfo) {
            self.networkManager.addOtherPlayer(self, playerInfo);
            self.children.bringToTop(self.meteorShots.ui);
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

        this.socket.on('bulletFired', function (bulletData) {
            self.networkManager.spawn_bullet(self, bulletData);
        });

        this.socket.on('meteorFired', function (meteorData) {
            self.networkManager.spawn_meteor_shot(self, meteorData);
        });

        // Initialize keyboard input with Phaser - Does not work with letter keys
        this.cursors = this.input.keyboard.addKeys('up, down, left, right, shift');

        // Initialize Meteor Strike function @Letter keys with Phaser
        this.input.keyboard.on('keydown_C', function(event) {
            self.networkManager.fire_meteor_shot(self);
        });

        // Initialize Fire function @Letter keys with Phaser
        this.input.keyboard.on('keydown_X', function(event) {
            self.networkManager.fire_laser(self);
        });

        // Initialize Reload function @Letter keys with Phaser
        this.input.keyboard.on('keydown_R', function(event) {
            self.networkManager.reload(self);
        });

    }
    
    update() {
        // Check the ship has been instantiated
        if (this.ship) {
            this.networkManager.checkForPlayerInteraction(this);
            this.networkManager.publishPlayerMovement(this);

            // TODO: Refactor into own `laser` class - maybe have an abstract `projectile` class as well.
            // This function allows us to 'reload' effectively after the bullets go off the screen.
            
        }
    }
}