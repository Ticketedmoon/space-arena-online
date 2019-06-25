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

        // Show
        $('.login-screen-interface').show();

        // Focus
        $("#login-name").focus();

        // Clicking the button
        $('#login-button').click(function () {
            self.attemptLogin(self);
        });

        // Or pressing the enter key
        $('#login-name').keypress(function(event) {
            var keycode = (event.keyCode ? event.keyCode : event.which);
            if(keycode == '13') {
                self.attemptLogin(self);
            }
        });
    }

    attemptLogin(self) {
        // Check if input name box is not empty
        let nameValue = $('#login-name').val();
        if (nameValue.length > 0) {

            // Remove Login UI
            $('.login-screen-interface').hide();

            // Start game scene
            self.scene.start('game', nameValue);
        }
        else {
            // Display warning text specifying that a name value has not been submitted.
            // TODO: Refactor this - Do not use alert() - perhaps display red text on screen, something better.
            alert("Please enter a username before joining an online session.");
        }
    }

}