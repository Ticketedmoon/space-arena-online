export default class LoginScene extends Phaser.Scene {

    constructor() {
        super('login');
        this.text = null;
    }

    preload() {
        this.load.path = 'assets/login-scene/';
        this.load.image('background-image', 'background.png')
    }

    create() {
        let self = this;
        let background = this.add.sprite(0, 0, 'background-image');
        background.setOrigin(0, 0);

        let centerX = this.game.canvas.width/2 - 105;
        let centerY = this.game.canvas.height/2 - 200;
        this.add.text(centerX, centerY, 'Project NX\n\n',  {
            font: "5em calibri",
            align: "center",
            fill: "lime",
            stroke: "black",
            strokeThickness: 2.5
        });

        // Focus
        $("#login-name").focus();

        $('#login-button').click(function () {
            // Check if input name box is not empty
            let nameValue = $('#login-name').val();
            if (nameValue.length > 0) {
                
                // Remove Login UI
                $('.login-screen-interface').remove();

                // Start game scene
                self.scene.start('game', nameValue);
            }
            else {
                // Display warning text specifying that a name value has not been submitted. 
            }
        });
    }
    
    update() {
    }
}