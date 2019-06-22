import Ship from './ship.js';

export default class NetworkManager {

    constructor(scene) {
        this.windowWidth = scene.scale.width;
        this.windowHeight = scene.scale.height;
    }

    // Add 'this' client as playable ship.
    addPlayer(self, playerInfo) {
        this.ship = new Ship(self, playerInfo.x, playerInfo.y, playerInfo.name, playerInfo.colour);
        this.ship.initializeShipAnimation();
        this.ship.initializeAmmunitionUserInterface(self);
    }

    // Create each other connected player sprite.
    // Add name-plate text under each player.
    // Add each player to the otherPlayers group.
    addOtherPlayer(self, playerInfo) {
        // Use physics object to enable arcade physics with our ship.
        // Set origin of the object to be the centre rather than the top left -> This allows us to rotate around the origin with ease.
        // Set scale of object (object size).
        const otherPlayer = new Ship(self, playerInfo.x, playerInfo.y, playerInfo.name, playerInfo.colour)
        otherPlayer.initializeShipAnimation();
        
        otherPlayer.playerId = playerInfo.playerId;
        self.otherPlayers.add(otherPlayer);
    }

    spawn_bullet(self, otherPlayerBulletData) {
        let bullet = self.physics.add.sprite(otherPlayerBulletData.x, otherPlayerBulletData.y, "player_laser_shoot_1");
        bullet.rotation = otherPlayerBulletData.rotation;
        bullet.body.setVelocity(otherPlayerBulletData.velocity.x, otherPlayerBulletData.velocity.y);
        bullet.setActive(true);
        bullet.setVisible(true);
    }

    spawn_meteor_shot(self, otherPlayerBulletData) {
        let bullet = self.physics.add.sprite(otherPlayerBulletData.x, otherPlayerBulletData.y, "player_laser_shoot_1").setScale(3, 3);
        bullet.rotation = otherPlayerBulletData.rotation;
        bullet.body.setVelocity(otherPlayerBulletData.velocity.x, otherPlayerBulletData.velocity.y);
        bullet.setActive(true);
        bullet.setVisible(true);

    }

    publishPlayerMovement(self) {
        // emit player movement
        var x = this.ship.ship.x;
        var y = this.ship.ship.y;
        var r = this.ship.ship.rotation;

        if (this.ship.oldPosition && (x !== this.ship.oldPosition.x || y !== this.ship.oldPosition.y || r !== this.ship.oldPosition.rotation)) {
            self.socket.emit('playerMovement', { x: this.ship.ship.x, y: this.ship.ship.y, rotation: this.ship.ship.rotation, boostActive: this.ship.boostActive });
        }
        
        // save old position data
        this.ship.oldPosition = {
            x: this.ship.ship.x,
            y: this.ship.ship.y,
            rotation: this.ship.ship.rotation,
            boostActive: this.ship.boostActive
        };  
    }

    checkForThrusterInitiation(playerInfo, otherPlayer) {
        if (playerInfo.boostActive && otherPlayer.ship.anims.currentAnim.key == "launch") {
            otherPlayer.ship.anims.stop('launch');
            otherPlayer.ship.anims.play('boost');
        }
        else if (!playerInfo.boostActive && otherPlayer.ship.anims.currentAnim.key == "boost") {
            otherPlayer.ship.anims.stop('boost');
            otherPlayer.ship.anims.play('launch');
        }
    }

    updateNameTagLocation(otherPlayer) {
        otherPlayer.entityText.x = otherPlayer.ship.x - this.ship.nameAlignX;
        otherPlayer.entityText.y = otherPlayer.ship.y + this.ship.nameAlignY;
    }
}