import LoginScene from './loginScene.js';
import GameScene from './gameScene.js';

export default class Game {

    constructor() {
        this.config = {
            type: Phaser.AUTO,
            parent: 'phaser-canvas',
            width: 835,
            height: 600,
            url: "https://www.skybreak.app/sao/",
            version: "0.0.3",
            fps: 30,
            scale: {
                autoCenter: Phaser.Scale.CENTER_HORIZONTALLY
            },
    
            // Physics
            physics: {
                default: 'arcade',
                matter: {
                    debug: false,
                    enableSleeping: true,
                    gravity: {
                        x: 0,
                        y: 0
                    }
                },
                arcade: {
                    debug: false,
                    gravity: { x: 0, y: 0 }
                }
            },

            scene: [
                LoginScene, 
                GameScene
            ],
        };
        
        this.game = new Phaser.Game(this.config);
    }
}

// Launch
new Game();
