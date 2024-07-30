document.addEventListener("DOMContentLoaded", () => {
    const chatWindow = document.getElementById('chat-window');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const toggleSidebarButton = document.getElementById('toggle-sidebar');
    const showSidebarButton = document.getElementById('show-sidebar');
    const sidebar = document.getElementById('sidebar');
    const newChatButton = document.getElementById('new-chat-button');
    const chatList = document.getElementById('chat-list');
    const voiceButton = document.getElementById('voice-button');
    const audioPlayback = document.getElementById('audio-playback');
    let chatCount = 1;

    toggleSidebarButton.addEventListener('click', () => {
        sidebar.classList.toggle('hidden');
        if (sidebar.classList.contains('hidden')) {
            document.querySelector('.chat-container').style.width = '100%';
        } else {
            document.querySelector('.chat-container').style.width = 'calc(100% - 250px)';
        }
    });

    showSidebarButton.addEventListener('click', () => {
        sidebar.classList.remove('hidden');
        document.querySelector('.chat-container').style.width = 'calc(100% - 250px)';
    });

    // newChatButton.addEventListener('click', () => {
    //     const newChatItem = document.createElement('div');
    //     newChatItem.classList.add('chat-list-item');
    //     newChatItem.textContent = `Chat ${chatCount++}`;
    //     chatList.appendChild(newChatItem);
    // });


    //   OUT OF THE FOLLOWING TWO ONE HAVE TO BE USED ONLY :
    voiceButton.addEventListener('click', () => {
        // Check for browser support
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.start();

                let audioChunks = [];
                mediaRecorder.ondataavailable = event => {
                    audioChunks.push(event.data);
                };

                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                    const formData = new FormData();
                    formData.append('audio', audioBlob, 'audio.wav');

                    fetch('/process_input', {
                        method: 'POST',
                        body: formData
                    })
                    .then(response => response.json())
                    .then(data => {
                        appendMessage(data.translated_text, 'user');
                        appendMessage(data.response, 'ai');
                        appendMessage(data.native_response, 'native');
                        audioPlayback.src = data.audio_url;
                        audioPlayback.play();
                    });
                };

                setTimeout(() => mediaRecorder.stop(), 5000); // Stop recording after 5 seconds
            });
        } else {
            alert('Audio recording is not supported in this browser.');
        }
    });
        

    sendButton.addEventListener('click', () => {
        const userMessage = userInput.value.trim();
        if (userMessage !== "") {
            appendMessage(userMessage, 'user');
            userInput.value = '';

            fetch('/process_input', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: userMessage })
            })
            .then(response => response.json())
            .then(data => {
                appendMessage(data.translated_text, 'user');
                appendMessage(data.response, 'ai');
                appendMessage(data.native_response, 'native');
                audioPlayback.src = data.audio_url;
                audioPlayback.play();
            });
        }
    });

    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendButton.click();
        }
    });

    function appendMessage(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', sender);

        const messageBubble = document.createElement('div');
        messageBubble.classList.add('message-bubble');
        messageBubble.textContent = message;

        messageElement.appendChild(messageBubble);
        chatWindow.appendChild(messageElement);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }
    
    // function getAiResponse(message) {
    //     // For demo purposes, we use a random response
    //     $.ajax({
    //         url: '/search',
    //         type: 'POST',
    //         data: { query: message },
    //         success: function(response) {
    //             const aiResponse = response.message;
    //             appendMessage(aiResponse, 'ai');

    //             // Translate the AI response to the native language
    //             fetch('/translate_to_native', {
    //                 method: 'POST',
    //                 headers: { 'Content-Type': 'application/json' },
    //                 body: JSON.stringify({ text: aiResponse })
    //             })
    //             .then(response => response.json())
    //             .then(data => {
    //                 const audioUrl = data.audio_url;
    //                 audioPlayback.src = audioUrl;
    //                 audioPlayback.play();
    //             });
    //         }
    //     });
    // }

});



//  NEW CODE: 


let chatCount = 1;

        // Handle new chat button click
        const newChatButton = document.getElementById('new-chat-button');
        const chatList = document.getElementById('chat-list');

        newChatButton.addEventListener('click', () => {
            const newChatItem = document.createElement('div');
            newChatItem.classList.add('chat-list-item');
            newChatItem.textContent = `Chat ${chatCount++}`;
            chatList.appendChild(newChatItem);
        });

        // Handle send button click
        $('#send-button').click(function() {
            var query = $('#user-input').val();
            $.ajax({
                url: '/search',
                type: 'POST',
                data: { query: query },
                success: function(response) {
                    const chatWindow = document.getElementById('chat-window');
                    const message = document.createElement('div');
                    message.textContent = response.message;
                    chatWindow.appendChild(message);
                    chatWindow.scrollTop = chatWindow.scrollHeight;
                }
            });
        });