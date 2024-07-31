document.addEventListener('DOMContentLoaded', (event) => {
    // Initialize variables
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

    // Speech synthesis function
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

    // Function to save interaction to the backend
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

    // Function to add interaction to the history list
    function addToHistory(speaker, message) {
        const li = document.createElement('li');
        li.textContent = `${speaker}: ${message}`;
        historyList.appendChild(li);
        saveInteraction(speaker, message);
    }

    // Function to initialize JARVIS
    async function initJARVIS() {
        await speak("Activating JARVIS..");
        await speak("Good " + (new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 18 ? "Afternoon" : "Evening") + "!");
    }

    // Event listener to start JARVIS on body click
    window.addEventListener('load', () => {
        document.body.addEventListener('click', async () => {
            if (!userInteracted) {
                await initJARVIS();
                userInteracted = true;
                showTour();
            }
        });
    });

    // Function to start speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.onresult = async (event) => {
        if (isSpeaking) return; // Ignore input while JARVIS is speaking
        const currentIndex = event.resultIndex;
        const transcript = event.results[currentIndex][0].transcript;
        content.textContent = transcript;
        await saveInteraction('User', transcript);
        addToHistory('User', transcript);
        takeCommand(transcript.toLowerCase());
    };

    // Event listener for microphone button
    btn.addEventListener('click', () => {
        if (!isSpeaking) {
            content.textContent = "Listening....";
            recognition.start();
        }
    });

    // Event listeners for history and commands buttons
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

    // Function to take command from user
    async function takeCommand(message) {
        if (message.includes('hey') || message.includes('hello')) {
            await speak("Hello Sir, How May I Help You?");
        } else if (message.includes("open google")) {
            openNewTab("https://google.com");
            await speak("Opening Google...");
        } else if (message.includes("open youtube")) {
            openNewTab("https://youtube.com");
            await speak("Opening YouTube...");
        } else if (message.includes("open facebook")) {
            openNewTab("https://facebook.com");
            await speak("Opening Facebook...");
        } else if (message.includes('what is') || message.includes('who is') || message.includes('what are')) {
            openNewTab(`https://www.google.com/search?q=${message.replace(" ", "+")}`);
            await speak("This is what I found on the internet regarding " + message);
        } else if (message.includes('wikipedia')) {
            openNewTab(`https://en.wikipedia.org/wiki/${message.replace("wikipedia", "")}`);
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
            openNewTab("https://chat.openai.com/");
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
            }, 6000);
        } else if (message.includes('how are you')) {
            await speak("I'm just a computer program, but I'm here and ready to help!");
        } else if (message.includes('what can you do')) {
            await speak("I can do a variety of things, including searching the web, playing music, and answering questions. How can I help you today?");
        } else if (message.includes('find on youtube')) {
            const songName = message.replace('find on youtube', '').trim();
            const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(songName)}`;
            openNewTab(youtubeUrl);
            await speak(`Searching for ${songName} on YouTube`);
        } else {
            openNewTab(`https://www.google.com/search?q=${message.replace(" ", "+")}`);
            await speak("I found some information for " + message + " on Google");
        }
    }

    // Function for casual conversation
    async function casualConversation() {
        await speak("Hello! How can I assist you today?");
        recognition.start();
        recognition.onresult = async (event) => {
            if (isSpeaking) return; // Ignore input while JARVIS is speaking
            const transcript = event.results[event.resultIndex][0].transcript;
            await saveInteraction('User', transcript);
            await speak(transcript);
        };
    }

    // Function to open new tab with popup handling
    function openNewTab(url) {
        const newTab = window.open(url, '_blank');
        if (!newTab) {
            alert('Pop-up blocked! Please allow pop-ups for this website to proceed.');
        } else {
            newTab.focus();
        }
    }

    // Function to show tour of buttons and website
    async function showTour() {
        await speak("Welcome to the JARVIS website. Let's take a quick tour.");
        await speak("This is the microphone button. Click here to start speaking to me.");
        await speak("This is the history button. Click here to view your interaction history.");
        await speak("This is the commands button. Click here to view the available commands.");
        await speak("You can interact with me by saying commands like 'open google', 'what is the time', or 'play music'.");
        await speak("Feel free to explore and let me know if you need any assistance.");
        alert("Microphone is allowed. You can now interact with JARVIS.");
    }
});
