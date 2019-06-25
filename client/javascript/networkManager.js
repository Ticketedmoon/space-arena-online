import Ship from './ship.js';

export default class NetworkManager {

    // Add 'this' client as playable ship.
    addPlayer(self, socketId, playerInfo) {
        this.ship = new Ship(self, socketId, playerInfo.x, playerInfo.y, playerInfo.rotation, playerInfo.name, playerInfo.colour);
        this.ship.initializeAmmunitionSystem(self);
        this.ship.initializeAmmunitionUserInterface(self);
    }

    // Create each other connected player sprite.
    // Add name-plate text under each player.
    // Add each player to the otherPlayers group.
    addOtherPlayer(self, socketId, playerInfo) {
        const otherPlayer = new Ship(self, socketId, playerInfo.x, playerInfo.y, playerInfo.rotation, playerInfo.name, playerInfo.colour)
        otherPlayer.playerId = playerInfo.playerId;
        self.otherPlayers.add(otherPlayer);
    }

    // Respawn player function
    // Find a new X and Y while keeping the same name and colour from the OG iteration.
    // Emit new position to all other players
    respawnPlayer(scene, name, colour, socketId) {
        let newX = Math.floor(Math.random() * 700) + 50;
        let newY = Math.floor(Math.random() * 500) + 50;
        this.ship = new Ship(scene, socketId, newX, newY, 0, name, colour);
        this.ship.initializeAmmunitionSystem(scene);
        this.ship.initializeAmmunitionUserInterface(scene);
        scene.socket.emit('playerMovement', { x: newX, y: newY, rotation: 0, boostActive: this.ship.boostActive });
    }

    // Ship movement via keyboard input
    // Up, Left, Right, Boost
    checkForShipMovement(scene) {
        if (scene.cursors.left.isDown) {
            // Check left key is down
            this.ship.body.setAngularVelocity(-150);
        } else if (scene.cursors.right.isDown) {
            // Check right key is down
            this.ship.body.setAngularVelocity(150);
        } else {
            // Otherwise, stop rotational velocity
            this.ship.body.setAngularVelocity(0);
        }
        if (scene.cursors.up.isDown) {
            // Check up key is down
            scene.physics.velocityFromRotation(this.ship.rotation + 270, 50, this.ship.body.acceleration);
        } else if (scene.cursors.down.isDown) {
            // Check down key is down
            scene.physics.velocityFromRotation(this.ship.rotation + 270, -50, this.ship.body.acceleration);
        }
        else {
            // Otherwise, stop acceleration in either direction 
            this.ship.body.setAcceleration(0);
        }
        this.updateNameTagLocation(this.ship);
        this.checkForPlayerBoostThrusters(scene);
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

    // TODO: Big Refactor with set timeouts
    checkForCollisions(scene) {
        if (this.ship) {
            let self = this;

            // Collision between ship regular lasers
            scene.physics.collide(this.ship.lasers, scene.otherPlayers, function(laser, otherPlayer){
                otherPlayer.body.velocity.x = 0;
                otherPlayer.body.velocity.y = 0;
                otherPlayer.tint = 0xff0000;
                laser.destroy();

                setTimeout(function() {
                    otherPlayer.clearTint();
                }, 250)
            }, null, this);

            // Collision between ship meteor bombs
            scene.physics.collide(this.ship.meteorShots, scene.otherPlayers, function(meteorShot, otherPlayer){
                otherPlayer.body.velocity.x = 0;
                otherPlayer.body.velocity.y = 0;
                otherPlayer.tint = 0xff0000;
                meteorShot.destroy();

                setTimeout(function() {
                    otherPlayer.clearTint();
                }, 250)
            }, null, this);
            
            // Collision between ship and other player bullets
            scene.physics.collide(this.ship, scene.otherPlayerBullets, function(ship, otherPlayerBullet){
                ship.body.velocity.x = 0;
                ship.body.velocity.y = 0;
                ship.tint = 0xff0000;

                // Store previous player name
                let prevName = this.ship.playerName;
                let prevColour = this.ship.colour;
                let prevSocketId = this.ship.colour;

                // Destroy bullet sprite for memory.
                otherPlayerBullet.destroy();

                setTimeout(function() {
                    // Delete user Interface
                    self.ship.deleteUserInterface();
                    // Destroy this.ship.entityText.
                    self.ship.entityText.destroy(true);
                    // Destroy this.ship.
                    self.ship.destroy(true);
                    // Remove ship reference.
                    self.ship = null;
                    // Respawn player - Perhaps limit lives?
                    self.respawnPlayer(scene, prevName, prevColour, prevSocketId);
                }, 250);
                return;
            }, null, this);
        }
    }

    // Method is used for other player ships when shooting.
    // Shows different player projectiles.
    spawn_projectile(scene, otherPlayerBulletData, scaleX=1, scaleY=1) {
        let bullet = scene.physics.add.sprite(otherPlayerBulletData.x, otherPlayerBulletData.y, "player_laser_shoot_1").setScale(scaleX, scaleY);        
        bullet.checkWorldBounds = true;
        bullet.outOfBoundsKill = true;

        bullet.rotation = otherPlayerBulletData.rotation;
        bullet.body.setVelocity(otherPlayerBulletData.velocity.x, otherPlayerBulletData.velocity.y);
        bullet.setActive(true);
        bullet.setVisible(true);

        scene.otherPlayerBullets.add(bullet);
    }

    // Check for current client boosting
    checkForPlayerBoostThrusters(scene) {
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

    // Check if other players are boosting, if so - update their animations.
    checkForOtherPlayerBoostThrusters(otherPlayer) {
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
    updateNameTagLocation(player) {
        player.entityText.x = player.x - player.nameAlignX;
        player.entityText.y = player.y + player.nameAlignY;
    }
}