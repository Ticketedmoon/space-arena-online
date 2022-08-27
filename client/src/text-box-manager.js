export default class TextBoxManager {

    constructor() {
        this.chatInputIsVisible = false;
        this.chatLogLimit = 5;
		this.messageIndex = 0;
		this.messagesInProcessOfRemoval = new Set();
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
            $('.message_' + (this.messageIndex - this.chatLogLimit).toString()).remove();
        }

        let styleMessage = $("<span class=\"message message_" + this.messageIndex + "\">" + "<span style=\"color: " + colour + "\">" + userName + "</span>: " + message + "</span>")
        $(".chat-log").append(styleMessage);
		this.messageIndex++;
		
		setTimeout(() => {
			this.fadeOldestMessage();
		}, 3000);
    }


	fadeOldestMessage() {
		let items = $(".chat-log").children("span");
		let itemClass = items.eq(0).attr("class");
		let messageId = null;
		if (itemClass) {
			messageId = itemClass.split(' ')[1];
		}

		let i = 0;
		while (this.messagesInProcessOfRemoval.has(messageId)) {
			let itemClass = items.eq(i).attr("class");
			if (itemClass) {
				messageId = itemClass.split(' ')[1];
			}
			i++;	
		}
		
		this.messagesInProcessOfRemoval.add(messageId);
		messageId = `.${messageId}`
		$(messageId).fadeOut(1000, () => $(messageId).remove());
	}

    isChatBoxOpen() {
        return this.chatInputIsVisible;
    }
}
