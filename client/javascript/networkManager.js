export default class NetworkManager {    
    
    // External Functions
    addPlayer(self, playerInfo) {

        // Use physics object to enable arcade physics with our ship.
        // Set origin of the object to be the centre rather than the top left -> This allows us to rotate around the origin with ease.
        // Set scale of object (object size)
        self.ship = self.physics.add.image(playerInfo.x, playerInfo.y, 'ship').setOrigin(0.5, 0.5).setDisplaySize(100, 80);
        self.ship.body.collideWorldBounds = true;
        self.ship.setBounce(5);

        // Add the text to the sprite as a child, just like a group spriteText.x = spriteText.width * -0.5; 
        // Center the text sprite text.y = -10 
        // Position the text 10 pixels above the origin of the sprite
        if (playerInfo.team === 'blue') {
            // Set ship colour (Tint)
            self.ship.setTint(0x0000AA);
        } else {
            self.ship.setTint(0xAA0000);
        }

        // We used setDrag, setAngularDrag, and setMaxVelocity to modify how the game object reacts to the arcade physics. 
        self.ship.setDrag(100);
        self.ship.setAngularDrag(100);
        self.ship.setMaxVelocity(200);
    }

    addOtherPlayer(self, playerInfo) {
        const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'otherPlayer').setOrigin(0.5, 0.5).setDisplaySize(100, 80);
        if (playerInfo.team === 'blue') {
            otherPlayer.setTint(0x0000AA);
        } else {
            otherPlayer.setTint(0xAA0000);
        }
        otherPlayer.playerId = playerInfo.playerId;
        self.otherPlayers.add(otherPlayer);
    }

    /* Player Movement */
    /* Player Shooting */
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
            self.physics.velocityFromRotation(self.ship.rotation + 1.5, 100, self.ship.body.acceleration);
        } else {
            self.ship.setAcceleration(0);
        }

        //if (self.cursors.)
    }

    publishPlayerMovement(self) {
        // emit player movement
        var x = self.ship.x;
        var y = self.ship.y;
        var r = self.ship.rotation;
        if (self.ship.oldPosition && (x !== self.ship.oldPosition.x || y !== self.ship.oldPosition.y || r !== self.ship.oldPosition.rotation)) {
            self.socket.emit('playerMovement', { x: self.ship.x, y: self.ship.y, rotation: self.ship.rotation });
        }
        
        // save old position data
        self.ship.oldPosition = {
            x: self.ship.x,
            y: self.ship.y,
            rotation: self.ship.rotation
        };  
    }
}