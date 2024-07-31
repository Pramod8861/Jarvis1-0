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
