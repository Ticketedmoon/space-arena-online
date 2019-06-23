import Ship from './ship.js';

export default class NetworkManager {

    // Add 'this' client as playable ship.
    addPlayer(self, playerInfo) {
        this.ship = new Ship(self, playerInfo.x, playerInfo.y, playerInfo.name, playerInfo.colour);
        this.ship.initializeShipAnimation();
        this.ship.initializeAmmunitionUserInterface(self);
    }

    // Create each other connected player sprite.
    // Add name-plate text under each player.
    // Add each player to the otherPlayers group.

    // TODO: USE KNOWLEDGE BELOW TO ADD PHYSICS TO SPRITE
    // create the player sprite    
    // player = this.physics.add.sprite(200, 200, 'player'); 
    // player.setBounce(0.2); // our player will bounce from items
    // player.setCollideWorldBounds(true); // don't go out of the map
    addOtherPlayer(self, playerInfo) {
        const otherPlayer = new Ship(self, playerInfo.x, playerInfo.y, playerInfo.name, playerInfo.colour)
        otherPlayer.initializeShipAnimation();
        otherPlayer.playerId = playerInfo.playerId;
        self.otherPlayers.add(otherPlayer);
    }

    // Method is used for other player ships when shooting.
    // Shows different player projectiles.
    spawn_projectile(self, otherPlayerBulletData, scaleX=1, scaleY=1) {
        let bullet = self.physics.add.sprite(otherPlayerBulletData.x, otherPlayerBulletData.y, "player_laser_shoot_1").setScale(scaleX, scaleY);
        bullet.rotation = otherPlayerBulletData.rotation;
        bullet.body.setVelocity(otherPlayerBulletData.velocity.x, otherPlayerBulletData.velocity.y);
        bullet.setActive(true);
        bullet.setVisible(true);
    }

    // Publishes `this` client's positional information, rotational information and boost information.
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

    // Check if other players are boosting, if so - update their animations.
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

    // Update name tag location of each other client.
    updateNameTagLocation(otherPlayer) {
        otherPlayer.entityText.x = otherPlayer.ship.x - this.ship.nameAlignX;
        otherPlayer.entityText.y = otherPlayer.ship.y + this.ship.nameAlignY;
    }
}