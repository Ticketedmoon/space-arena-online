export default class TextBoxManager {

    constructor() {
        this.chatInputIsVisible = false;
        this.chatLogLimit = 5;
        this.colour = this.getRandomColour();
    }

    registerChatBox(socket) {
        let self = this;
        $('#text-box').keypress(function(event) {
            var keycode = (event.keyCode ? event.keyCode : event.which);
            if(keycode == '13'){
                // Enter key has been pressed inside text-box
                // Check if input contains text, if it does, send it to all nodes.
                // Otherwise, close chat system - IE make it invisible.
                let message = $(this).val();
                if (message.length > 0) {

                    // Clear input of message
                    $(this).val('');

                    // hide chat container
                    $(".text-box-div").css("visibility", "hidden");

                    // Emit message to all other client nodes
                    socket.emit('chatUpdate', message, self.colour, socket.id);

                }
                else {
                    // Hide chat
                    $(".text-box-div").css("visibility", "hidden");

                    // Remove focus from input field
                    $(".text-box-div").blur(); 
                }

                 // Update boolean
                 self.chatInputIsVisible = !self.chatInputIsVisible;
            }
            event.stopPropagation();
        });
    }

    registerChatBoxVisibilityControls() {
        let self = this;
        $(document).keypress(function(event) {
            var keycode = (event.keyCode ? event.keyCode : event.which);
            if(keycode == '13') {
                if (self.chatInputIsVisible) {
                    // Hide
                    $(".text-box-div").css("visibility", "hidden");
                }
                else {
                    // Show
                    $(".text-box-div").css("visibility", "visible");

                    // Focus
                    $("#text-box").focus();
                }
                
                // Update boolean
                self.chatInputIsVisible = !self.chatInputIsVisible;   
            }
            event.stopPropagation();
        });    
    }

    updateChatLog(message, colour, playerId) {
        let totalActiveVisibleMessages = $(".chat-log").children().length;
        if (totalActiveVisibleMessages >= this.chatLogLimit) {
            $(".chat-log > p").first().remove();
        }

        let styleMessage = $("<p class=\"message\">" + "<span style=\"color: " + colour + "\">" + playerId + "</span>: " + message + "</p>")
        $(".chat-log").append(styleMessage);
        this.removeMessageAndFadeOut();
    }

    removeMessageAndFadeOut() {
        let fadeHandle = setTimeout(function() {
            $('.chat-log > p').first().fadeOut(3000);
            clearTimeout(this);
        }, 10000);

        let removeHandle = setTimeout(function() {
            $('.chat-log > p').first().remove();
            clearTimeout(this);
        }, 13000);
    }

    getRandomColour() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
}
