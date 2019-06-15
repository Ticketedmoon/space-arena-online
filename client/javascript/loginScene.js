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
                alert("Please enter a username before joining an online session.");
            }
        });
    }
    
    update() {
    }
}