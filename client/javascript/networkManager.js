export default class NetworkManager {

    constructor(scene) {
        this.boostActive = false;
        this.textAlignX = 20;
        this.textAlignY = 45;

        this.windowWidth = scene.scale.width;
        this.windowHeight = scene.scale.height;
    }

    // Add 'this' client as playable ship.
    addPlayer(self, playerInfo) {
        // Use physics object to enable arcade physics with our ship.   
        // Set origin of the object to be the centre rather than the top left -> This allows us to rotate around the origin with ease.
        // Set scale of object (object size)    
        self.ship = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'player_anim_1').setOrigin(0.5, 0.5).setDisplaySize(80, 60).play('launch');
        self.ship.body.collideWorldBounds = true;
        self.ship.setBounce(1);

        // Add text underneath sprite
        let style = { font: "13px Calibri, Arial", fill: playerInfo.colour, wordWrap: true, align: "center", stroke: '#000000', strokeThickness: 0.5};
        self.ship.entityText = self.add.text(playerInfo.x - this.textAlignX, playerInfo.y + this.textAlignY, playerInfo.name, style);
        
        // We used setDrag, setAngularDrag, and setMaxVelocity to modify how the game object reacts to the arcade physics. 
        self.ship.setDrag(100);
        self.ship.setAngularDrag(100);
        self.ship.setMaxVelocity(500);
    }

    // Create each other connected player sprite.
    // Add name-plate text under each player.
    // Add each player to the otherPlayers group.
    addOtherPlayer(self, playerInfo) {
        // Use physics object to enable arcade physics with our ship.
        // Set origin of the object to be the centre rather than the top left -> This allows us to rotate around the origin with ease.
        // Set scale of object (object size).
        const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'player_anim_1').setOrigin(0.5, 0.5).setDisplaySize(80, 60).play('launch');

        // Add text underneath sprite
        let style = { font: "13px Calibri, Arial", fill: playerInfo.colour, wordWrap: true, align: "center" };
        otherPlayer.entityText = self.add.text(playerInfo.x - this.textAlignX, playerInfo.y + this.textAlignY, playerInfo.name, style);
        
        otherPlayer.playerId = playerInfo.playerId;
        self.otherPlayers.add(otherPlayer);
    }

    /* Player Movement */
    // TODO: REFACTOR THIS
    checkForPlayerInteraction(self) {

        // Check left key is down
        if (self.cursors.left.isDown) {
            self.ship.setAngularVelocity(-150);

        // Check right key is down
        } else if (self.cursors.right.isDown) {
            self.ship.setAngularVelocity(150);

        // Otherwise, stop velocity
        } else {
            self.ship.setAngularVelocity(0);
        }
    
        // Check up key is down
        if (self.cursors.up.isDown) {
            self.physics.velocityFromRotation(self.ship.rotation + 270, 50, self.ship.body.acceleration);
        } else {
            self.ship.setAcceleration(0);
            // Todo: Turn off engine
        }

        // REFACTOR
        self.ship.entityText.x = self.ship.x - this.textAlignX;
        self.ship.entityText.y = self.ship.y + this.textAlignY;

        // Check for space bar push => instantiates engine thrusters 
        if (self.cursors.shift.isDown) {
            // Increase the acceleration of the ship - Thus increasing its velocity when moving.
            self.physics.velocityFromRotation(self.ship.rotation + 270, 300, self.ship.body.acceleration);
            // Update animation
            if (!self.boostActive) {
                self.ship.anims.stop('launch');
                self.ship.anims.play('boost');
                self.boostActive = true;
            }
        }
        else {
            if (self.boostActive) {
                self.ship.anims.stop('boost');
                self.ship.anims.play('launch');
                self.boostActive = false;
            }
        }
    }

    // Different colour
    fire_meteor_shot(self) {
        var meteor_projectile_bullet = self.meteorShots.get(self.ship.x, self.ship.y, "player_laser_shoot_1").setScale(3, 3);
        if (meteor_projectile_bullet) {
            self.meteorShots.ammo--;
            self.meteorShots.ui.setTexture("ammo_" + self.meteorShots.ammo.toString());

            meteor_projectile_bullet.rotation = self.ship.rotation;
            self.physics.velocityFromRotation(self.ship.rotation, 600, meteor_projectile_bullet.body.velocity);
            meteor_projectile_bullet.setActive(true);
            meteor_projectile_bullet.setVisible(true);
        }
    }

    // Check for bullet fire by pressing the 'x' key
    // This function is automatically called after each 'x' key press.
    // TODO: Fire projectile functionality + Collision Detection!
    fire_laser(self) {
        // Get first bullet in group
        // After X bullets depleted -> returns null, no bullets left.
        var bullet = self.lasers.get(self.ship.x, self.ship.y, "player_laser_shoot_1");

        // Check bullet exists
        if (bullet) {
            self.lasers.ammo--;
            bullet.rotation = self.ship.rotation;
            self.physics.velocityFromRotation(self.ship.rotation, 600, bullet.body.velocity);
            bullet.setActive(true);
            bullet.setVisible(true);
        }
    }

    // Removes all members of this Group and optionally removes them from the Scene and / or destroys them.
    reload(self) {
        self.lasers.ammo = 60;
        self.lasers.children.clear();
    }

    publishPlayerMovement(self) {
        // emit player movement
        var x = self.ship.x;
        var y = self.ship.y;
        var r = self.ship.rotation;
        if (self.ship.oldPosition && (x !== self.ship.oldPosition.x || y !== self.ship.oldPosition.y || r !== self.ship.oldPosition.rotation)) {
            self.socket.emit('playerMovement', { x: self.ship.x, y: self.ship.y, rotation: self.ship.rotation, boostActive: self.boostActive });
        }
        
        // save old position data
        self.ship.oldPosition = {
            x: self.ship.x,
            y: self.ship.y,
            rotation: self.ship.rotation,
            boostActive: self.ship.boostActive
        };  
    }

    checkForThrusterInitiation(playerInfo, otherPlayer) {
        if (playerInfo.boostActive && otherPlayer.anims.currentAnim.key == "launch") {
            otherPlayer.anims.stop('launch');
            otherPlayer.anims.play('boost');
        }
        else if (!playerInfo.boostActive && otherPlayer.anims.currentAnim.key == "boost") {
            otherPlayer.anims.stop('boost');
            otherPlayer.anims.play('launch');
        }
    }

    updateNameTagLocation(otherPlayer) {
        otherPlayer.entityText.x = otherPlayer.x  - this.textAlignX;
        otherPlayer.entityText.y = otherPlayer.y + this.textAlignY;
    }
}