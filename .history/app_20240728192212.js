const btn = document.querySelector('.talk');
const content = document.querySelector('.content');
const historyBtn = document.querySelector('.history-btn');
const commandsBtn = document.querySelector('.commands-btn');
const historyModal = document.getElementById('history-modal');
const commandsModal = document.getElementById('commands-modal');
const closeModal = document.querySelector('.close');
const closeCommandsModal = document.querySelector('.close-commands');
const historyList = document.getElementById('history-list');
let userInteracted = false;

async function saveInteraction(speaker, message) {
    try {
        const response = await fetch('http://localhost:5000/interactions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ speaker, message })
        });
        return await response.json();
    } catch (error) {
        console.error('Error saving interaction:', error);
    }
}

function speak(text) {
    const text_speak = new SpeechSynthesisUtterance(text);
    text_speak.rate = 1;
    text_speak.volume = 1;
    text_speak.pitch = 1;
    window.speechSynthesis.speak(text_speak);
    addToHistory('JARVIS', text);
}

function wishMe() {
    let hour = new Date().getHours();
    if (hour >= 0 && hour < 12) {
        speak("Good Morning!");
    } else if (hour >= 12 && hour < 18) {
        speak("Good Afternoon!");
    } else {
        speak("Good Evening!");
    }
    speak("I am Jarvis Sir. listening...");
}

function initJARVIS() {
    speak("Activating JARVIS..");
    wishMe();
}

window.addEventListener('load', () => {
    // Wait for user interaction before initializing JARVIS
    document.body.addEventListener('click', () => {
        if (!userInteracted) {
            initJARVIS();
            userInteracted = true;
        }
    });
});

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.onresult = async (event) => {
    const currentIndex = event.resultIndex;
    const transcript = event.results[currentIndex][0].transcript;
    content.textContent = transcript;
    await saveInteraction('User', transcript);
    addToHistory('User', transcript);
    takeCommand(transcript.toLowerCase());
};

btn.addEventListener('click', () => {
    content.textContent = "Listening....";
    recognition.start();
});

historyBtn.addEventListener('click', async () => {
    historyModal.style.display = 'block';
    const interactions = await fetch('http://localhost:5000/interactions').then(res => res.json());
    historyList.innerHTML = '';
    interactions.forEach(interaction => {
        const li = document.createElement('li');
        li.textContent = `${interaction.speaker}: ${interaction.message}`;
        historyList.appendChild(li);
    });
});

commandsBtn.addEventListener('click', () => {
    commandsModal.style.display = 'block';
});

closeModal.addEventListener('click', () => {
    historyModal.style.display = 'none';
});

closeCommandsModal.addEventListener('click', () => {
    commandsModal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === historyModal) {
        historyModal.style.display = 'none';
    }
    if (event.target === commandsModal) {
        commandsModal.style.display = 'none';
    }
});

function addToHistory(speaker, message) {
    const li = document.createElement('li');
    li.textContent = `${speaker}: ${message}`;
    historyList.appendChild(li);
    saveInteraction(speaker, message);
}

function takeCommand(message) {
    if (message.includes('hey') || message.includes('hello')) {
        speak("Hello Sir, How May I Help You?");
    } else if (message.includes("open google")) {
        window.open("https://google.com", "_blank");
        speak("Opening Google...");
    } else if (message.includes("open youtube")) {
        window.open("https://youtube.com", "_blank");
        speak("Opening YouTube...");
    } else if (message.includes("open facebook")) {
        window.open("https://facebook.com", "_blank");
        speak("Opening Facebook...");
    } else if (message.includes('what is') || message.includes('who is') || message.includes('what are')) {
        window.open(`https://www.google.com/search?q=${message.replace(" ", "+")}`, "_blank");
        speak("This is what I found on the internet regarding " + message);
    } else if (message.includes('wikipedia')) {
        window.open(`https://en.wikipedia.org/wiki/${message.replace("wikipedia", "")}`, "_blank"); 
        speak("This is what I found on Wikipedia regarding " + message);
    } else if (message.includes('time')) {
        const time = new Date().toLocaleTimeString();
        speak("The time is " + time);
    } else if (message.includes('date')) {
        const date = new Date().toLocaleDateString();
        speak("The date is " + date);
    } else if (message.includes('play music')) {
        speak("Sure! Sir");
        const musicUrl = 'https://audio.jukehost.co.uk/zOf6cHTSuVbmMxSfsGP003tTKsrfe6QN'; // Replace with your music file URL
        const audio = new Audio(musicUrl);
        audio.play();
    } else if (message.includes('play another music')) {
        speak("Sure! Sir");
        const musicUrl = 'https://audio.jukehost.co.uk/0Gjb18OPzbnGTCrg0QxoYWZdjVtLUiEY'; // Replace with your another music file URL
        const audio = new Audio(musicUrl);
        audio.play();
    } else if (message.includes('do not leave me buddy') || message.includes('do not leave me')) {
        speak("Sorry sir!");
    } else if (message.includes('question')) {
        speak("Sure! What's your question?");
        // Implement your question-answering functionality here
    } else if (message.includes('kuch naya dalen')) {
        speak("Choice is yours Sir!");
    } else if (message.includes('open chatgpt')) {
        speak("Opening ChatGPT website.");
        window.open("https://chat.openai.com/");
    } else if (message.includes('start conversation')) {
        casualConversation();
    } else if (message.includes('stop')) {
        speak("Stop. Terminating Jarvis. Goodbye!");
        recognition.stop();
    } else if (message.includes('love you Jarvis')) {
        speak("I love you, mi amour! I appreciate that.");
    } else if (message.includes('tell me a joke')) {
        speak("Why don't scientists trust atoms? Because they make up everything!");
    } else if (message.includes('exit') || message.includes('bye') || message.includes('thank you')) {
        speak("Goodbye! If you need assistance, feel free to ask.");
        setTimeout(() => {
            window.open('about:blank', '_self').close();
            const smileWindow = window.open('', 'smileWindow', 'width=300,height=200');
            smileWindow.document.write('<html><body><h1>😊</h1></body></html>');
        }, 6000); // Wait for the speech to finish
    } else if (message.includes('how are you')) {
        speak("I'm just a computer program, but I'm here and ready to help!");
    } else if (message.includes('what can you do')) {
        speak("I can do a variety of things, including searching the web, playing music, and answering questions. How can I help you today?");
    } else if (message.includes('find on youtube')) {
        const songName = message.replace('find on youtube', '').trim();
        const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(songName)}`;
        window.open(youtubeUrl, "_blank");
        speak(`Searching for ${songName} on YouTube`);
    } else {
        window.open(`https://www.google.com/search?q=${message.replace(" ", "+")}`, "_blank");
        speak("I found some information for " + message + " on Google");
    }
}

function casualConversation() {
    speak("Hello! How can I assist you today?");
    recognition.start();
    recognition.onresult = async (event) => {
        const currentIndex = event.resultIndex;
        const transcript = event.results[currentIndex][0].transcript.toLowerCase();
        await saveInteraction('User', transcript);
        addToHistory('User', transcript);
        if (transcript.includes('how are you')) {
            speak("I'm just a computer program, but I'm here and ready to help!");
        } else if (transcript.includes('what can you do')) {
            speak("I can do a variety of things, including searching the web, playing music, and answering questions. How can I help you today?");
        } else if (transcript.includes('tell me a joke')) {
            speak("Why don't scientists trust atoms? Because they make up everything!");
        } else if (transcript.includes('exit') || transcript.includes('bye') || transcript.includes('thank you')) {
            speak("Goodbye! If you need assistance, feel free to ask.");
            recognition.stop();
            setTimeout(() => {
                window.open('about:blank', '_self').close();
                const smileWindow = window.open('', 'smileWindow', 'width=300,height=200');
                smileWindow.document.write('<html><body><h1>😊</h1></body></html>');
            }, 6000); // Wait for the speech to finish
        } else {
            speak("I'm not sure how to respond to that, but I'm here to help!");
        }
        recognition.start();
    };
}
