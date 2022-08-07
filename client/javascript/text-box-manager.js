export default class TextBoxManager {

    constructor() {
        this.chatInputIsVisible = false;
        this.chatLogLimit = 5;
        this.messageNo = 1;
    }

    // TODO: Can we combine the two methods below?

    registerChatBox(socket) {
        let self = this;
        const textBox = document.getElementById("text-box");
        const textBoxWrapper = document.getElementsByClassName("text-box-div")[0];
        textBox.addEventListener("keydown", (event) => {
            if (event.key == 'Enter') {
                const message = textBox.value;
                if (message.length > 0) {
                    // Clear input of message
                    textBox.value = null;
                    // hide chat container
                    textBoxWrapper.style.visibility = "hidden";
                    // Emit message to all other client nodes
                    socket.emit('chatUpdate', message, socket.id);

                } else {
                    // Hide chat
                    textBoxWrapper.style.visibility = "hidden";
                    // Remove focus from input field
                    textBoxWrapper.blur();
                }
            }
            event.stopPropagation();
        });
    }

    registerChatBoxVisibilityControls() {
        let self = this;
        const textBox = document.getElementById("text-box");
        const textBoxWrapper = document.getElementsByClassName("text-box-div")[0];

        document.addEventListener("keypress", (event) => {
            if (event.key == 'Enter') {
                if (self.chatInputIsVisible) {
                    // Hide
                    textBoxWrapper.style.visibility = "hidden";
                } else {
                    // Show
                    textBoxWrapper.style.visibility = "visible";
                    // Focus
                    textBox.focus();
                }
                
                // Update boolean
                self.chatInputIsVisible = !self.chatInputIsVisible;   
            }
        });    
    }

    updateChatLog(message, colour, userName) {
        let totalActiveVisibleMessages = $(".chat-log").children().length;
        if (totalActiveVisibleMessages >= this.chatLogLimit) {
            $('.message_' + (this.messageNo-this.chatLogLimit).toString()).remove();
        }

        let styleMessage = $("<span class=\"message message_" + this.messageNo + "\">" + "<span style=\"color: " + colour + "\">" + userName + "</span>: " + message + "</span>")
        $(".chat-log").append(styleMessage);
        this.removeMessageAndFadeOut(this);
    }

    removeMessageAndFadeOut(self) {
        let message = '.message_' + (self.messageNo).toString();
        setTimeout(function() {
            $(message).fadeOut(1000, function() {
                $(message).remove();
                self.messageNo--;
            });
        }, 10000);
        self.messageNo++;
    }

    isChatBoxOpen() {
        return this.chatInputIsVisible;
    }
}