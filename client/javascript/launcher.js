import Game from './game.js';

class Launcher {
    initialize() {
        let game = new Game();
    }
}

// Instantiate Launcher
$(document).ready(function() {
    let launcher = new Launcher();
    launcher.initialize();
});
