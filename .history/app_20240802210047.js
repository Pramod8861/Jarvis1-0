

async function casualConversation() {
    await speak("Hello! How can I assist you today?");
    recognition.start();
    recognition.onresult = async (event) => {
        if (isSpeaking) return; // Ignore input while JARVIS is speaking
        const currentIndex = event.resultIndex;
        const transcript = event.results[currentIndex][0].transcript.toLowerCase();
        await saveInteraction('User', transcript);
        addToHistory('User', transcript);
        try {
            if (transcript.includes('how are you')) {
                await speak("I'm just a computer program, but I'm here and ready to help!");
            } else if (transcript.includes('what can you do')) {
                await speak("I can do a variety of things, including searching the web, playing music, and answering questions. How can I help you today?");
            } else if (transcript.includes('tell me a joke')) {
                await speak("Why don't scientists trust atoms? Because they make up everything!");
            } else if (transcript.includes('exit') || transcript.includes('bye') || transcript.includes('thank you')) {
                await speak("Goodbye! If you need assistance, feel free to ask.");
                recognition.stop();
                setTimeout(() => {
                    window.open('about:blank', '_self').close();
                    const smileWindow = window.open('', 'smileWindow', 'width=300,height=200');
                    smileWindow.document.write('<html><body><h1>😊</h1></body></html>');
                }, 6000);
            } else {
                await speak("I'm not sure how to respond to that, but I'm here to help!");
            }
        } catch (error) {
            await speak("Sorry, I can't do that right now.");
            console.error("Error in casual conversation:", error);
        }
        recognition.start();
    };
}
