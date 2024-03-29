import NetworkManager from './networkManager.js';
import ImageLoader from './imageLoader.js';
import AnimationManager from './animationManager.js';
import TextBoxManager from './text-box-manager.js';

const TILE_SIZE = 64;

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
        const socketRootUrl = window.location.pathname;
        this.socket = io({
            path: `${socketRootUrl}socket.io`,
        });


        // Map
        const map = this.make.tilemap({
            key: "map",
            tileWidth: TILE_SIZE,
            tilwHeight: TILE_SIZE
        })

        // Set up camera
        const mapWidth = map.tileWidth * map.width;
        const mapHeight = map.tileHeight * map.height;
        console.log(`mapW: ${mapWidth}, mapH: ${mapHeight}`);

        // First param: Name of tileset in Tiled, Second param: png load key.
        const tileset = map.addTilesetImage("space-map", "tiles", TILE_SIZE, TILE_SIZE);
        map.createLayer("space_layer", tileset, 0, 0);

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

        // Update current players with new player details.
        this.createSocketEventListeners(self);

        // Initialize default ship cursor key inputs
        this.createKeyboardInputListeners(self);
    }

    createKeyboardInputListeners(self) {
        this.cursors = this.input.keyboard.createCursorKeys();

        // Initialize Meteor Strike function @Letter keys with Phaser
        this.input.keyboard.on('keydown', (event) => {
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

    createSocketEventListeners(self) {

        // Emit to server to start the socket connection to server
        this.socket.emit('initializeSocketConnection', this.userName);

        this.socket.on('currentPlayers', (players) => {
            Object.keys(players).forEach((id) => {
                if (players[id].playerId === self.socket.id) {
                    self.networkManager.addPlayer(self, id, players[id]);
                    self.cameras.main.startFollow(self.networkManager.ship);
                    self.physics.add.collider(self.networkManager.ship, self.asteroidsGroup);
                } else {
                    self.networkManager.addOtherPlayer(self, id, players[id]);
                }
            });
        });

        // BUGFIX: 
        // Move deletion to separate socket listener.
        // Then emit out server asteroid map update.
        this.socket.on('update_asteroids_on_map', (asteroidsJson, last_removed_asteroid_id) => {
            let self = this;
            let asteroids = new Map(JSON.parse(asteroidsJson));
            if (self.asteroidsGroup && last_removed_asteroid_id !== null) {
                let destroyedAsteroid = self.asteroidsGroup
                    .getChildren()
                    .find(asteroid => asteroid.id === last_removed_asteroid_id);
                if (destroyedAsteroid) {
                    // TODO: Destroy laser here too
                    // TODO Centralise this logic with other destoy logic.
                    destroyedAsteroid.tint = 0xff0000;
                    destroyedAsteroid.body.setVelocity(0, 0);
                    setTimeout(() => {
                        asteroids.delete(destroyedAsteroid.id);
                        destroyedAsteroid.destroy();
                        this.addAsteroidsToWorld(asteroids);
                        self.physics.add.collider(self.networkManager.ship, this.asteroidsGroup);
                    }, 250);
                }
            } else {
                this.addAsteroidsToWorld(asteroids);
                self.physics.add.collider(self.networkManager.ship, this.asteroidsGroup);
            }
        });

        // Update new player with all other current player details.
        this.socket.on('newPlayer', (id, playerInfo) => {
            self.networkManager.addOtherPlayer(self, id, playerInfo);
        });

        // Connect user to chat
        this.socket.on('chatUpdate', (message, colour, userName) => {
            self.textBoxManager.updateChatLog(message, colour, userName);
        });

        // Remove player from otherPlayers group if disconnect.
        this.socket.on('disconnect', (playerId) => {
            self.otherPlayers.getChildren().forEach((otherPlayer) => {
                if (playerId === otherPlayer.playerId) {
                    otherPlayer.destroy();
                    otherPlayer.entityText.destroy();
                }
            });
        });

        this.socket.on('playerMoved', (playerInfo) => {
            self.otherPlayers.getChildren().forEach((otherPlayer) => {
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

        this.socket.on('bulletFired', (bulletData) => {
            self.networkManager.spawn_projectile(self, bulletData, 1, 1);
        });

        this.socket.on('meteorFired', (meteorData) => {
            self.networkManager.spawn_projectile(self, meteorData, 3, 3);
        });
    }

    // TODO: Also make Asteroid it's own entity class + move logic there.
    addAsteroidsToWorld(asteroids) {
        this.asteroidsGroup = this.add.group();
        asteroids.forEach((asteroidProperties, _) => {
            let asteroid = this.physics.add.sprite(asteroidProperties.x, asteroidProperties.y, 'asteroid')
                .setScale(asteroidProperties.scale, asteroidProperties.scale)
                .setBounce(0, 0)
                .setCollideWorldBounds(true);
            asteroid.body.setAngularVelocity(asteroidProperties.rotation);
            asteroid.body.setVelocity(asteroidProperties.velocity, asteroidProperties.velocity);
            asteroid.id = asteroidProperties.id;
            this.asteroidsGroup.add(asteroid);
        })
        this.physics.add.collider(this.asteroidsGroup, this.asteroidsGroup);
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
