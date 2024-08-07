const btn = document.querySelector('.talk');
const content = document.querySelector('.content');
const historyBtn = document.querySelector('.history-btn');
const commandsBtn = document.querySelector('.commands-btn');
const historyModal = document.getElementById('history-modal');
const commandsModal = document.getElementById('commands-modal');
const closeModal = document.querySelector('.close');
const closeCommandsModal = document.querySelector('.close-commands');
const historyList = document.getElementById('history-list');
const interactionPrompt = document.getElementById('interaction-prompt');
const startJarvisBtn = document.getElementById('start-jarvis');


let userInteracted = false;
let isSpeaking = false;
let initialGreetingCompleted = false;
let audio = null;

async function checkMicrophonePermission() {
    try {
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
        if (permissionStatus.state === 'granted') {
            console.log('Microphone access is granted.');
        } else if (permissionStatus.state === 'prompt') {
            console.log('Microphone access is not granted yet. Prompting for access.');
        } else {
            console.log('Microphone access is denied.');
        }
    } catch (error) {
        console.error('Error checking microphone permission:', error);
    }
}

function showPopupBlockedMessage() {
    alert('It looks like your browser is blocking pop-ups. Please allow pop-ups for this site to ensure all features work correctly.');
}

function handlePopup(url, name) {
    try {
        const popup = window.open(url, name);
        if (!popup || popup.closed || typeof popup.closed === 'undefined') {
            showPopupBlockedMessage();
        }
    } catch (e) {
        showPopupBlockedMessage();
    }
}

async function saveInteraction(speaker, message) {
    try {
        const response = await fetch('https://tell-some-crazy-y22t.onrender.com/interactions', {
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
        console.log(`Speaking: ${text}`);
        isSpeaking = true;
        const text_speak = new SpeechSynthesisUtterance(text);
        text_speak.rate = 1;
        text_speak.volume = 1;
        text_speak.pitch = 1;
        text_speak.onend = () => {
            isSpeaking = false;
            console.log('Finished speaking');
            resolve();
        };
        text_speak.onerror = (event) => {
            console.error('SpeechSynthesisUtterance error:', event);
            isSpeaking = false;
            resolve();
        };
        window.speechSynthesis.speak(text_speak);
        addToHistory('JARVIS', text);
    });
}

async function wishMe() {
    let hour = new Date().getHours();
    if (hour >= 0 && hour < 12) {
        return speak("Good Morning!");
    } else if (hour >= 12 && hour < 18) {
        return speak("Good Afternoon!");
    } else {
        return speak("Good Evening!");
    }
}

async function initJARVIS() {
    console.log('Initializing JARVIS...');
    await speak("Activating JARVIS...");
    await wishMe();
    await speak("Listening, sir.");
    await checkMicrophonePermission();
    initialGreetingCompleted = true; // Set the flag to true after initial greeting
    console.log('JARVIS initialized.');
}

startJarvisBtn.addEventListener('click', () => {
    userInteracted = true;
    interactionPrompt.style.display = 'none';
    initJARVIS();
});

window.onload = () => {
    console.log('Window loaded');
    if (!userInteracted) {
        interactionPrompt.style.display = 'block';
    }
};

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.onstart = function () {
    console.log('Voice recognition activated.');
    content.textContent = 'Voice recognition activated. Try speaking into the microphone.';
};

recognition.onresult = async (event) => {
    if (isSpeaking) return; // Ignore input while JARVIS is speaking
    const currentIndex = event.resultIndex;
    const transcript = event.results[currentIndex][0].transcript.toLowerCase();
    console.log(`User said: ${transcript}`);
    content.textContent = transcript;
    await saveInteraction('User', transcript);
    addToHistory('User', transcript);
    try {
        await takeCommand(transcript);
    } catch (error) {
        await speak("Sorry, I can't do that right now.");
    }
};

btn.addEventListener('click', () => {
    if (initialGreetingCompleted && !isSpeaking) {
        content.textContent = "Listening....";
        recognition.start();
    }
});

historyBtn.addEventListener('click', async () => {
    try {
        historyModal.style.display = 'block';
        const response = await fetch('https://tell-some-crazy-y22t.onrender.com/interactions');
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        console.log('API Response:', data); 

        const interactions =  data; 
        
        historyList.innerHTML = ''; // Clear the list before appending new items
        
        if (Array.isArray(interactions)) {
            if (interactions.length === 0) {
                historyList.innerHTML = '<li>No interactions found.</li>';
            } else {
                interactions.forEach(interaction => {
                    const li = document.createElement('li');
                    li.textContent = `${interaction.speaker}: ${interaction.message}`;
                    historyList.appendChild(li);
                });
            }
        } else {
            historyList.innerHTML = '<li>Invalid data format received from server.</li>';
        }
    } catch (error) {
        console.error('Error fetching interaction history:', error);
    }
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

function addToHistory(speaker, message) {
    const historyItem = document.createElement('li');
    historyItem.textContent = `${speaker}: ${message}`;
    historyList.appendChild(historyItem);
}

async function takeCommand(message) {
    try {
        if (message.includes('open google')) {
            handlePopup("https://www.google.com", "_blank");
            await speak("Opening Google Sir.");
        } else if (message.includes('play music')) {
            audio = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
            audio.play();
            await speak("Playing music.");
        } else if (message.includes('stop music')) {
            if (audio) {
                audio.pause();
                await speak("Stopping the music.");
            }
        } else if (message.includes('do not leave me buddy') || message.includes('do not leave me')) {
            await speak("Sorry sir!");
        } else if (message.includes('question')) {
            await speak("Sure! What's your question?");
        } else if (message.includes('kuch naya dalen')) {
            await speak("Choice is yours Sir!");
        } else if (message.includes('open chatgpt')) {
            await speak("Opening ChatGPT website.");
            handlePopup("https://chat.openai.com/", "_blank");
        } else if (message.includes('start conversation')) {
            casualConversation();
        } else if (message.includes('thank you')) {
            await speak("You're welcome! Don't hesitate to reach out if you need further assistance.");
        } else if (message.includes('love you jarvis')) {
            await speak("I love you, mi amour! I appreciate that.");
        } else if (message.includes('tell me a joke')) {
            await speak("Why don't scientists trust atoms? Because they make up everything!");
        } else if (message.includes('exit') || message.includes('bye') || message.includes('stop')) {
            await speak("Goodbye! If you need assistance, feel free to ask.");
            setTimeout(() => {
                window.open('about:blank', '_self').close();
                const smileWindow = window.open('', 'smileWindow', 'width=300,height=200');
                smileWindow.document.write('<html><body><h1>😊</h1></body></html>');
            }, 6000);
        } else if (message.includes('how are you')) {
            await speak("I'm just a computer program, but I'm here and ready to help!");
        } else if (message.includes('what can you do')) {
            await speak("I can do a variety of things, including searching the web, playing music, and answering questions. How can I help you today?");
        } else if (message.includes('find on youtube')) {
            const songName = message.replace('find on youtube', '').trim();
            const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(songName)}`;
            handlePopup(youtubeUrl, "_blank");
            await speak(`Searching for ${songName} on YouTube`);
        } else {
            handlePopup(`https://www.google.com/search?q=${message.replace(" ", "+")}`, "_blank");
            await speak("I found some information for " + message + " on Google");
        }
    } catch (error) {
        await speak("Sorry, I can't do that right now.");
        console.error("Error taking command:", error);
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
