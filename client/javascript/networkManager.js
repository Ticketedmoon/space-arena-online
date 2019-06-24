import Ship from './ship.js';

export default class NetworkManager {

    // Add 'this' client as playable ship.
    addPlayer(self, playerInfo) {
        this.ship = new Ship(self, playerInfo.x, playerInfo.y, playerInfo.name, playerInfo.colour);
        this.ship.initializeAmmunitionSystem(self);
        this.ship.initializeAmmunitionUserInterface(self);
    }

    // Create each other connected player sprite.
    // Add name-plate text under each player.
    // Add each player to the otherPlayers group.
    addOtherPlayer(self, playerInfo) {
        const otherPlayer = new Ship(self, playerInfo.x, playerInfo.y, playerInfo.name, playerInfo.colour)
        otherPlayer.playerId = playerInfo.playerId;
        self.otherPlayers.add(otherPlayer);
    }

     // TODO : REFACTOR:
     checkForShipMovement(scene) {
        // Check left key is down
        if (scene.cursors.left.isDown) {
            this.ship.body.setAngularVelocity(-150);

        // Check right key is down
        } else if (scene.cursors.right.isDown) {
            this.ship.body.setAngularVelocity(150);

        // Otherwise, stop velocity
        } else {
            this.ship.body.setAngularVelocity(0);
        }
    
        // Check up key is down
        if (scene.cursors.up.isDown) {
            scene.physics.velocityFromRotation(this.ship.rotation + 270, 50, this.ship.body.acceleration);
        } else {
            this.ship.body.setAcceleration(0);
        }

        // REFACTOR
        this.ship.entityText.x = this.ship.x - this.ship.nameAlignX;
        this.ship.entityText.y = this.ship.y + this.ship.nameAlignY;

        // Check for space bar push => instantiates engine thrusters 
        if (scene.cursors.shift.isDown) {
            // Increase the acceleration of the ship - Thus increasing its velocity when moving.
            scene.physics.velocityFromRotation(this.ship.rotation + 270, 300, this.ship.body.acceleration);
            // Update animation
            if (!this.ship.boostActive) {
                this.ship.anims.stop('launch');
                this.ship.anims.play('boost');
                this.ship.boostActive = true;
            }
        }
        else {
            if (this.ship.boostActive) {
                this.ship.anims.stop('boost');
                this.ship.anims.play('launch');
                this.ship.boostActive = false;
            }
        }
    }

    // Publishes `this` client's positional information, rotational information and boost information.
    publishPlayerMovement(self) {
        // emit player movement
        var x = this.ship.x;
        var y = this.ship.y;
        var r = this.ship.rotation;

        if (this.ship.oldPosition && (x !== this.ship.oldPosition.x || y !== this.ship.oldPosition.y || r !== this.ship.oldPosition.rotation)) {
            self.socket.emit('playerMovement', { x: this.ship.x, y: this.ship.y, rotation: this.ship.rotation, boostActive: this.ship.boostActive });
        }
        
        // save old position data
        this.ship.oldPosition = {
            x: this.ship.x,
            y: this.ship.y,
            rotation: this.ship.rotation,
            boostActive: this.ship.boostActive
        };  
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

    // Check if other players are boosting, if so - update their animations.
    checkForThrusterInitiation(otherPlayer) {
        if (otherPlayer.boostActive && otherPlayer.anims.currentAnim.key == "launch") {
            otherPlayer.anims.stop('launch');
            otherPlayer.anims.play('boost');
        }
        else if (!otherPlayer.boostActive && otherPlayer.anims.currentAnim.key == "boost") {
            otherPlayer.anims.stop('boost');
            otherPlayer.anims.play('launch');
        }
    }

    // Update name tag location of each other client.
    updateNameTagLocation(otherPlayer) {
        otherPlayer.entityText.x = otherPlayer.x - otherPlayer.nameAlignX;
        otherPlayer.entityText.y = otherPlayer.y + otherPlayer.nameAlignY;
    }
}