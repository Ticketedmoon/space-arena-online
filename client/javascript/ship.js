export default class Ship extends Phaser.GameObjects.Sprite {

    constructor(scene, x, y, playerName, colour) {
        super(scene, x, y);

        // Default ship properties
        this.boostActive = false;
        this.playerName = playerName;
        this.colour = colour;
        this.nameAlignX = 20;
        this.nameAlignY = 45;

        // Default ship weaponry
        this.lasers = scene.physics.add.group();
        this.lasers.enableBody = true;
        this.lasers.maxSize = 12;
        this.lasers.ammo = 60;
        this.lasers.magazineSize = 12;
        this.lasers.magazineLimit = Math.ceil(this.lasers.ammo / this.lasers.magazineSize) - 1;
        this.lasers.currentMagazineAmmo = this.lasers.magazineSize;

        this.meteorShots = scene.physics.add.group();
        this.meteorShots.enableBody = true;
        this.meteorShots.maxSize = 10;
        this.meteorShots.ammo = 10;

        this.drawPlayer(scene, x, y);
    }

    // TODO: Refactor this so ship is renamed to shipSprite everywhere.
    drawPlayer(scene, shipX, shipY) {
        // Use physics object to enable arcade physics with our ship.   
        // Set origin of the object to be the centre rather than the top left -> This allows us to rotate around the origin with ease.
        // Set scale of object (object size)
        this.ship = scene.physics.add.sprite(shipX, shipY, 'player_anim_1').setOrigin(0.5, 0.5).setDisplaySize(80, 60).play('launch');
        this.ship.body.collideWorldBounds = true;
        this.ship.setBounce(1);

        // Add text underneath sprite
        let style = { font: "13px Calibri, Arial", fill: this.colour, wordWrap: true, align: "center", stroke: '#000000', strokeThickness: 0.5 };
        this.entityText = scene.add.text(shipX - this.nameAlignX, shipY + this.nameAlignY, this.playerName, style);
        
        // We used setDrag, setAngularDrag, and setMaxVelocity to modify how the game object reacts to the arcade physics. 
        this.ship.setDrag(100);
        this.ship.setAngularDrag(100);
        this.ship.setMaxVelocity(500);
    }

    initializeAmmunitionUserInterface(scene) {
        // Set normal ammo sprite
        this.lasers.ui = scene.add.text(scene.scale.width, scene.scale.height, this.lasers.currentMagazineAmmo.toString() + "|" + 
        this.lasers.magazineLimit.toString()).setOrigin(5, 2.5).setScale(1, 1);

        // Set meteor shot ammo sprite
        this.meteorShots.ui = scene.physics.add.sprite(scene.scale.width, scene.scale.height, 'ammo_' + this.meteorShots.ammo.toString()).setOrigin(1.5, 1.25).setScale(1, 1);
    }

    initializeShipAnimation() {
        this.setOrigin(0.5, 0.5);
        this.setDisplaySize(80, 60);
        this.play('launch');
    }

    // TODO : REFACTOR:
    checkForShipMovement(scene) {
        // Check left key is down
        if (scene.cursors.left.isDown) {
            this.ship.setAngularVelocity(-150);

        // Check right key is down
        } else if (scene.cursors.right.isDown) {
            this.ship.setAngularVelocity(150);

        // Otherwise, stop velocity
        } else {
            this.ship.setAngularVelocity(0);
        }
    
        // Check up key is down
        if (scene.cursors.up.isDown) {
            scene.physics.velocityFromRotation(this.ship.rotation + 270, 50, this.ship.body.acceleration);
        } else {
            this.ship.setAcceleration(0);
            // Todo: Turn off engine
        }

        // REFACTOR
        this.entityText.x = this.ship.x - this.nameAlignX;
        this.entityText.y = this.ship.y + this.nameAlignY;

        // Check for space bar push => instantiates engine thrusters 
        if (scene.cursors.shift.isDown) {
            // Increase the acceleration of the ship - Thus increasing its velocity when moving.
            scene.physics.velocityFromRotation(this.ship.rotation + 270, 300, this.ship.body.acceleration);
            // Update animation
            if (!this.boostActive) {
                this.ship.anims.stop('launch');
                this.ship.anims.play('boost');
                this.boostActive = true;
            }
        }
        else {
            if (this.boostActive) {
                this.ship.anims.stop('boost');
                this.ship.anims.play('launch');
                this.boostActive = false;
            }
        }
    }

    // Check for bullet fire by pressing the 'x' key
    // This function is automatically called after each 'x' key press.
    // TODO: Fire projectile functionality + Collision Detection!
    fire_laser(scene) {
        // Get first bullet in group
        // After X bullets depleted -> returns null, no bullets left.
        if (this.lasers.ammo > 0) {
            var bullet = this.lasers.get(this.ship.x, this.ship.y, "player_laser_shoot_1");

            // Check bullet exists
            if (bullet) {
                // reduce ammo count
                this.lasers.currentMagazineAmmo--;
                this.lasers.ammo--;

                // //TODO: REfactor
                this.updateBulletAmmoUi();
                
                // Set bullet properties
                bullet.rotation = this.ship.rotation;
                scene.physics.velocityFromRotation(this.ship.rotation, 600, bullet.body.velocity);
                bullet.setActive(true);
                bullet.setVisible(true);

                // Emit to all other players
                scene.socket.emit('bulletFired', {x: bullet.x, y: bullet.y, rotation: bullet.rotation, velocity: bullet.body.velocity});
            }
        }
    }

    // Different colour
    fire_meteor_shot(scene) {
        var meteor_projectile_bullet = this.meteorShots.get(this.ship.x, this.ship.y, "player_laser_shoot_1")
        if (meteor_projectile_bullet) {
            this.meteorShots.ammo--;
            meteor_projectile_bullet.setScale(3, 3);
            this.meteorShots.ui.setTexture("ammo_" + this.meteorShots.ammo.toString());

            meteor_projectile_bullet.rotation = this.ship.rotation;
            scene.physics.velocityFromRotation(this.ship.rotation, 600, meteor_projectile_bullet.body.velocity);
            meteor_projectile_bullet.setActive(true);
            meteor_projectile_bullet.setVisible(true);

            // Emit to all other players
            scene.socket.emit('meteorFired', {x: meteor_projectile_bullet.x, y: meteor_projectile_bullet.y, rotation: meteor_projectile_bullet.rotation, velocity: meteor_projectile_bullet.body.velocity});
        }
    }

    // Removes all members of this Group and optionally removes them from the Scene and / or destroys them.
    reload() {
        if (this.lasers.ammo >= this.lasers.magazineSize) {
            this.lasers.magazineLimit = Math.ceil((this.lasers.ammo-12) / this.lasers.magazineSize);
            this.lasers.currentMagazineAmmo = this.lasers.magazineSize;
            
            // TODO: REFACTOR
            this.updateBulletAmmoUi();
            this.lasers.children.clear(true, false);
        }
        else {
            this.lasers.maxSize = this.lasers.ammo;
        }
    }
    
    // TODO: Refactor into own `laser` class - maybe have an abstract `projectile` class as well.
    // This function allows us to 'reload' effectively after the bullets go off the screen.
    updateBulletAmmoUi() {
        this.lasers.ui.setText(this.lasers.currentMagazineAmmo.toString() + "|" + this.lasers.magazineLimit.toString());
    }
}