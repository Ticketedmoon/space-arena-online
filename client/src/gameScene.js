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
        this.load.path = 'assets/maps/'

        // this.load.image('game-background-image', 'large-space-background.png')
		// Load the PNG
		this.load.image('tiles', 'space-map.png');
		// load the JSON file
		this.load.tilemapTiledJSON('map', 'space-map.json')

        this.imageLoader = new ImageLoader();
        this.animationManager = new AnimationManager();
        this.textBoxManager = new TextBoxManager();
        this.networkManager = new NetworkManager();
        this.imageLoader.loadAnimationImageSets(this);

        this.load.path = 'assets/resources/fonts/';
        this.load.bitmapFont('arcadeFont', 'arcade.png', 'arcade.xml');
    }

    create() {
        // Store this keyword for later callbacks.
        var self = this;
        
        // Setup socket for each client
        this.socket = io();


		// Map
		const map = this.make.tilemap({
			key: "map",
			tileWidth: 64,
			tilwHeight: 64
		})

		// First param: Name of tileset in Tiled, Second param: png load key.
		const tileset = map.addTilesetImage("space-map", "tiles", 64, 64);
		const layer = map.createLayer("space_layer", tileset, 0, 0);

        // Set up camera
		const mapWidth = map.tileWidth * map.width;
		const mapHeight = map.tileHeight * map.height;

        self.cameras.main.setBounds(0, 0, mapWidth, mapHeight);

		// World bounds
        this.physics.world.setBounds(0, 0, mapWidth, mapHeight);

        // Register text box
        this.textBoxManager.registerChatBox(this.socket);
        this.textBoxManager.registerChatBoxVisibilityControls();

        // Phaser group - Great for performing multiple operations at the same time.
        this.otherPlayers = this.physics.add.group();
        this.otherPlayers.enableBody = true;

        this.otherPlayerBullets = this.add.group();

        // Lasers shot by players
        this.animationManager.initializeAnimationGroup(this);


        // Emit to server to start the socket connection to server
        this.socket.emit('initializeSocketConnection', this.userName);

        // Update current players with new player details.
        this.socket.on('currentPlayers', function(players) {
            Object.keys(players).forEach(function (id) {
                if (players[id].playerId === self.socket.id) {
                    self.networkManager.addPlayer(self, id, players[id]);
                    self.cameras.main.startFollow(self.networkManager.ship);
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
        this.cursors = this.input.keyboard.createCursorKeys();

        // Initialize Meteor Strike function @Letter keys with Phaser
        this.input.keyboard.on('keydown', function (event) {
            if (self.textBoxManager.isChatBoxOpen()) {
                return;
            } else {
		let key = event.key.toLowerCase();
                if (key == 'c') {
                    self.networkManager.ship.fire_meteor_shot(self);
                } else if (key == 'x') {
                    self.networkManager.ship.fire_laser(self);
                } else if (key == 'r') {
                    self.networkManager.ship.reload();
                }
            }
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
