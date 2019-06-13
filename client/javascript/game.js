import StartScene from './startScene.js';

export default class Game {

    constructor() {
        this.config = {
            type: Phaser.AUTO,
            parent: 'NodeJS Phaser online game',
            width: 835,
            height: 600,
            scale: {
                autoCenter: Phaser.Scale.CENTER_HORIZONTALLY
            },
    
            // Physics
            physics: {
                default: 'arcade',
                arcade: {
                    debug: false,
                    gravity: { x: 0, y: 0 }
                }
            },
    
            // Scenes
            scene: [
                StartScene
            ]
        };
        
        this.game = new Phaser.Game(this.config);
    }
}