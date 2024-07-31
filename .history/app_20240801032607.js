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
let isSpeaking = false;

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
    return new Promise((resolve) => {
        isSpeaking = true;
        const text_speak = new SpeechSynthesisUtterance(text);
        text_speak.rate = 1;
        text_speak.volume = 1;
        text_speak.pitch = 1;
        text_speak.onend = () => {
            isSpeaking = false;
            resolve();
        };
        window.speechSynthesis.speak(text_speak);
        addToHistory('JARVIS', text);
    });
}

function wishMe() {
    let hour = new Date().getHours();
    if (hour >= 0 && hour < 12) {
        return speak("Good Morning !  listening sir !..) ;
    } else if (hour >= 12 && hour < 18) {
        return speak("Good Afternoon!");
    } else {
        return speak("Good Evening!");
    }
}

async function initJARVIS() {
    await speak("Activating JARVIS..");
   
    await wishMe();
}

window.addEventListener('load', () => {
    document.body.addEventListener('click', () => {
        if (!userInteracted) {
            initJARVIS();
            userInteracted = true;
        }
    });
});

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.onstart = function () {
    content.textContent = 'Voice recognition activated. Try speaking into the microphone.';
};

recognition.onspeechend = function () {
    content.textContent = 'You were quiet for a while so voice recognition turned itself off.';
    recognition.stop();
};

recognition.onresult = async (event) => {
    if (isSpeaking) return; // Ignore input while JARVIS is speaking
    const currentIndex = event.resultIndex;
    const transcript = event.results[currentIndex][0].transcript.toLowerCase();
    content.textContent = transcript;
    await saveInteraction('User', transcript);
    addToHistory('User', transcript);
    takeCommand(transcript);
};

btn.addEventListener('click', () => {
    if (!isSpeaking) {
        content.textContent = "Listening....";
        recognition.start();
    }
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

async function takeCommand(message) {
    if (message.includes('hey') || message.includes('hello')) {
        await speak("Hello Sir, How May I Help You?");
    } else if (message.includes("open google")) {
        window.open("https://google.com", "_blank");
        await speak("Opening Google...");
    } else if (message.includes("open youtube")) {
        window.open("https://youtube.com", "_blank");
        await speak("Opening YouTube...");
    } else if (message.includes("open facebook")) {
        window.open("https://facebook.com", "_blank");
        await speak("Opening Facebook...");
    } else if (message.includes('what is') || message.includes('who is') || message.includes('what are')) {
        window.open(`https://www.google.com/search?q=${message.replace(" ", "+")}`, "_blank");
        await speak("This is what I found on the internet regarding " + message);
    } else if (message.includes('wikipedia')) {
        window.open(`https://en.wikipedia.org/wiki/${message.replace("wikipedia", "")}`, "_blank"); 
        await speak("This is what I found on Wikipedia regarding " + message);
    } else if (message.includes('time')) {
        const time = new Date().toLocaleTimeString();
        await speak("The time is " + time);
    } else if (message.includes('date')) {
        const date = new Date().toLocaleDateString();
        await speak("The date is " + date);
    } else if (message.includes('play music')) {
        await speak("Sure! Sir");
        const musicUrl = 'https://audio.jukehost.co.uk/zOf6cHTSuVbmMxSfsGP003tTKsrfe6QN'; 
        const audio = new Audio(musicUrl);
        audio.play();
    } else if (message.includes('play another music')) {
        await speak("Sure! Sir");
        const musicUrl = 'https://audio.jukehost.co.uk/0Gjb18OPzbnGTCrg0QxoYWZdjVtLUiEY'; 
        const audio = new Audio(musicUrl);
        audio.play();
    } else if (message.includes('do not leave me buddy') || message.includes('do not leave me')) {
        await speak("Sorry sir!");
    } else if (message.includes('question')) {
        await speak("Sure! What's your question?");
    } else if (message.includes('kuch naya dalen')) {
        await speak("Choice is yours Sir!");
    } else if (message.includes('open chatgpt')) {
        await speak("Opening ChatGPT website.");
        window.open("https://chat.openai.com/");
    } else if (message.includes('start conversation')) {
        casualConversation();
    } else if (message.includes('stop')) {
        await speak("Stop. Terminating Jarvis. Goodbye!");
        recognition.stop();
    } else if (message.includes('love you Jarvis')) {
        await speak("I love you, mi amour! I appreciate that.");
    } else if (message.includes('tell me a joke')) {
        await speak("Why don't scientists trust atoms? Because they make up everything!");
    } else if (message.includes('exit') || message.includes('bye') || message.includes('thank you')) {
        await speak("Goodbye! If you need assistance, feel free to ask.");
        setTimeout(() => {
            window.open('about:blank', '_self').close();
            const smileWindow = window.open('', 'smileWindow', 'width=300,height=200');
            smileWindow.document.write('<html><body><h1>😊</h1></body></html>');
        }, 6000); // Wait for the speech to finish
    } else if (message.includes('how are you')) {
        await speak("I'm just a computer program, but I'm here and ready to help!");
    } else if (message.includes('what can you do')) {
        await speak("I can do a variety of things, including searching the web, playing music, and answering questions. How can I help you today?");
    } else if (message.includes('find on youtube')) {
        const songName = message.replace('find on youtube', '').trim();
        const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(songName)}`;
        window.open(youtubeUrl, "_blank");
        await speak(`Searching for ${songName} on YouTube`);
    } else {
        window.open(`https://www.google.com/search?q=${message.replace(" ", "+")}`, "_blank");
        await speak("I found some information for " + message + " on Google");
    }
}

async function casualConversation() {
    await speak("Hello! How can I assist you today?");
    recognition.start();
    recognition.onresult = async (event) => {
        if (isSpeaking) return; // Ignore input while JARVIS is speaking
        const currentIndex = event.resultIndex;
        const transcript = event.results[currentIndex][0].transcript.toLowerCase();
        await saveInteraction('User', transcript);
        addToHistory('User', transcript);
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
        recognition.start();
    };
}
