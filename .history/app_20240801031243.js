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
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                speaker: speaker,
                message: message,
                timestamp: new Date().toISOString(),
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to save interaction');
        }

        const interaction = await response.json();
        displayInteraction(interaction);
    } catch (error) {
        console.error(error);
    }
}

function displayInteraction(interaction) {
    const li = document.createElement('li');
    li.textContent = `${interaction.speaker}: ${interaction.message}`;
    historyList.appendChild(li);
}

function addPopupMessage(message) {
    const popup = document.createElement('div');
    popup.textContent = message;
    popup.className = 'popup-message';
    document.body.appendChild(popup);

    setTimeout(() => {
        popup.classList.add('visible');
    }, 10);

    setTimeout(() => {
        popup.classList.remove('visible');
        setTimeout(() => {
            document.body.removeChild(popup);
        }, 300);
    }, 3000);
}

function askForMicrophonePermissions() {
    if (userInteracted) return;

    addPopupMessage('Please enable microphone permissions.');

    setTimeout(() => {
        const mediaDevices = navigator.mediaDevices;
        if (mediaDevices && mediaDevices.getUserMedia) {
            mediaDevices.getUserMedia({ audio: true }).catch(error => {
                addPopupMessage('Microphone permissions denied.');
            });
        }
    }, 2000);
}

window.onload = () => {
    askForMicrophonePermissions();
};

btn.addEventListener('click', () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.onstart = function () {
        content.textContent = 'Voice recognition activated. Try speaking into the microphone.';
        isSpeaking = true;
    };

    recognition.onspeechend = function () {
        content.textContent = 'You were quiet for a while so voice recognition turned itself off.';
        isSpeaking = false;
    };

    recognition.onresult = async function (event) {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        content.textContent = transcript;
        await saveInteraction('User', transcript);
        isSpeaking = false;

        if (transcript.toLowerCase().includes('open')) {
            const url = transcript.toLowerCase().replace('open', '').trim();
            openWebsite(url);
        }

        if (transcript.toLowerCase().includes('hello jarvis')) {
            const greetingResponse = 'Hello! How can I assist you today?';
            speak(greetingResponse);
        }

        // Other commands handling can go here
        else if (message.includes("open google")) {
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
    };

    recognition.start();
});

function openWebsite(url) {
    let targetUrl = '';

    if (url.includes('google')) {
        targetUrl = 'https://www.google.com';
    } else if (url.includes('youtube')) {
        targetUrl = 'https://www.youtube.com';
    } else if (url.includes('facebook')) {
        targetUrl = 'https://www.facebook.com';
    } else {
        targetUrl = `https://${url}`;
    }

    window.open(targetUrl, '_blank');
}

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
    } else if (event.target === commandsModal) {
        commandsModal.style.display = 'none';
    }
});

function speak(message) {
    const speech = new SpeechSynthesisUtterance(message);
    speech.volume = 1;
    speech.rate = 1;
    speech.pitch = 1;
    window.speechSynthesis.speak(speech);
    saveInteraction('JARVIS', message);
}

function loadHistory() {
    fetch('http://localhost:5000/interactions')
        .then(response => response.json())
        .then(data => {
            historyList.innerHTML = '';
            data.forEach(interaction => displayInteraction(interaction));
        })
        .catch(error => console.error('Error loading history:', error));
}

loadHistory();

document.body.onload = () => {
    userInteracted = true;
};
