export default class TextBoxManager {

    FIFTEEN_SECONDS_MS = 20000;
    CHAT_LOG_LIMIT = 7;

    constructor() {
        this.chatInputIsVisible = false;
		this.newMessageIndex = 0;
		this.messageToRemoveIndex = 0;
    }

    // TODO: Can we combine the two methods below?
    registerChatBox(socket) {
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
        let styleMessage = $("<span class=\"message message_" + this.newMessageIndex + "\">" + "<span style=\"color: " + colour + "\">" + userName + "</span>: " + message + "</span>")
        let chatLog = $(".chat-log");
        
        this.addMessageToChatLog(chatLog, styleMessage);
        this.removeOldestMessageWhenLimitReached(chatLog);
        setTimeout(() => this.fadeOldestMessage(), this.FIFTEEN_SECONDS_MS);
    }


    removeOldestMessageWhenLimitReached(chatLog) {
        let chatLogLength = chatLog.children().length;
        if (chatLogLength > this.CHAT_LOG_LIMIT) {
            let messageId = chatLog.children("span").eq(0).attr("class").split(' ')[1];
            $(`.${messageId}`).remove();
        }
    }

    addMessageToChatLog(chatLog, styleMessage) {
        chatLog.append(styleMessage);
        this.newMessageIndex++;
    }

	fadeOldestMessage() {
        const messageClass = `.message_${this.messageToRemoveIndex}`;
        this.messageToRemoveIndex++;
		$(messageClass).fadeOut(1000, () => $(messageClass).remove());
    }

    isChatBoxOpen() {
        return this.chatInputIsVisible;
    }
}
