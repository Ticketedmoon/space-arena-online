export default class TextBoxManager {

    constructor() {
        this.chatInputIsVisible = false;
        this.chatLogLimit = 5;
    }

    registerChatBox(socket) {
        let self = this;
        $('#text-box').keypress(function(event) {
            var keycode = (event.keyCode ? event.keyCode : event.which);
            if(keycode == '13') {
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
                    socket.emit('chatUpdate', message, socket.id);

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

    updateChatLog(message, colour, userName) {
        let totalActiveVisibleMessages = $(".chat-log").children().length;
        if (totalActiveVisibleMessages >= this.chatLogLimit) {
            $(".chat-log > p").first().remove();
        }

        let styleMessage = $("<p class=\"message\">" + "<span style=\"color: " + colour + "\">" + userName + "</span>: " + message + "</p>")
        $(".chat-log").append(styleMessage);
        this.removeMessageAndFadeOut();
    }

    removeMessageAndFadeOut() {
        setTimeout(function() {
            $('.chat-log > p').first().fadeOut(1000, function() {
                $('.chat-log > p').first().remove();
            });
        }, 10000);
    }
}