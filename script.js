const TimerState = {
    RUNNING: 'RUNNING',
    STOPPED: 'STOPPED',
    WAITING_FOR_STOP: 'WAITING_FOR_STOP'
};

// Array of available colors
const colors = ['#FFFFCC', '#CCFFFF', '#FFE5CC', '#CCFFE5', '#FFFFE5'];

let colorIndex = 0; // Index of the current color

let timerState = TimerState.STOPPED;
let timeLeft = 0;
let timerInterval;
let audioContext = new AudioContext();
let alertSoundBuffer;
let alertInterval;
let volume = 0.5; // Initial volume level

// Define links to different icons
const faviconStoped = 'tea.png';
const faviconRunning = 'clock_red.png';
const faviconWaitingForStop = 'clock_yellow.png';

// Function to change the favicon
function changeFavicon(icon) {
    document.getElementById('favicon').href = icon;
}

// Example of changing the favicon based on status
function updateFavicon() {
    switch (timerState) {
        case 'RUNNING':
            changeFavicon(faviconRunning);
            break;
        case 'STOPPED':
            changeFavicon(faviconStoped);
            break;
        case 'WAITING_FOR_STOP':
            changeFavicon(faviconWaitingForStop);
        default:
            changeFavicon(faviconStoped);
    }
}

// Call this function to update the favicon at the desired moment
updateFavicon(); // Example: changing favicon to "running" icon

// Function to save volume level to cookie
function saveVolumeToCookie(volume) {
    document.cookie = `volume=${volume};expires=Fri, 31 Dec 9999 23:59:59 GMT;path=/`;
}

// Function to get volume level from cookie
function getVolumeFromCookie() {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith('volume=')) {
            return cookie.substring('volume='.length, cookie.length);
        }
    }
    return null;
}

// Loading the sound file
fetch('ring.wav')
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
    .then(audioBuffer => {
        alertSoundBuffer = audioBuffer;
    })
    .catch(error => console.error('Error loading sound file:', error));

// Function to play the alert sound
function playAlertSound() {
    if (!alertSoundBuffer) return;
    let source = audioContext.createBufferSource();
    source.buffer = alertSoundBuffer;

    // Apply volume level
    let gainNode = audioContext.createGain();
    gainNode.gain.value = volume;
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);

    source.start(0);
}

function startTimer(seconds, timerName) {
    clearInterval(timerInterval); // Stop previous interval, if any
    clearInterval(alertInterval); // Stop previous alert interval

    let endTime = Date.now() + seconds * 1000;
    timeLeft = seconds;

    console.log('Timer started:', seconds, 'seconds');
    timerState = TimerState.RUNNING;
    updState();
    addToLog(seconds, timerName);
    console.log('Timer state:', timerState);

    updateTimer();

    timerInterval = setInterval(updateTimer, 1000);

    function updateTimer() {
        let timeRemaining = endTime - Date.now();
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            playAlertSound(); // Play sound when time is up
            console.log('Time is up');
            if (document.visibilityState === 'visible') {
                pauseTimer(); // Change timer state to STOPPED if page is visible
            } else {
                alertInterval = setInterval(playAlertSound, 30 * 1000); // Set interval for every 30 seconds
                timerState = TimerState.WAITING_FOR_STOP; // Change state to waiting for stop
                console.log('Timer state:', timerState);
            }
            return;
        }

        let minutes = Math.floor((timeRemaining / 1000 / 60) % 60);
        let seconds = Math.floor((timeRemaining / 1000) % 60);

        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;

        let timerDisplay = document.getElementById('timer');
        timerDisplay.textContent = minutes + ":" + seconds;

        console.log('Time left:', minutes, 'minutes', seconds, 'seconds');
    }
}

function updState() {
    const cancelButton = document.getElementById('cancelTimer');
    cancelButton.disabled = (timerState === TimerState.STOPPED);
    updateFavicon()
}

function pauseTimer() {
    clearInterval(timerInterval);
    clearInterval(alertInterval); // Stop sound alert
    timerState = TimerState.STOPPED;
    console.log('Timer paused');
    console.log('Timer state:', timerState);
    let timerDisplay = document.getElementById('timer');
    timerDisplay.textContent = "00:00";
    updState();
}

// Modify the event listeners to pass the timer name to the startTimer function
document.getElementById('pomodoro25').addEventListener('click', function () {
    const timerName = document.getElementById('timerName1').value;
    startTimer(25 * 60, timerName);
});

document.getElementById('pomodoro20').addEventListener('click', function () {
    const timerName = document.getElementById('timerName2').value;
    startTimer(20 * 60, timerName);
});

document.getElementById('pomodoro15').addEventListener('click', function () {
    const timerName = document.getElementById('timerName3').value;
    startTimer(15 * 60, timerName);
});

document.getElementById('pomodoro5').addEventListener('click', function () {
    const timerName = document.getElementById('timerName4').value;
    startTimer(5 * 60, timerName);
});

document.getElementById('pomodoroDebug').addEventListener('click', function () {
    const timerName = document.getElementById('timerName5').value;
    startTimer(10, timerName);
});

// Event listener for visibility change
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible' && timerState === TimerState.WAITING_FOR_STOP) {
        pauseTimer(); // Change timer state to STOPPED when returning to tab
        console.log('Timer state:', timerState);
    }
    console.log('Visibility changed:', document.visibilityState);
});

// Set volume level from cookie on page load, if available
window.addEventListener('load', function() {
    const savedVolume = getVolumeFromCookie();
    if (savedVolume !== null) {
        volumeRange.value = savedVolume;
        volume = parseFloat(savedVolume);
        // Apply volume level
        playAlertSound();
    }
});

// Event listener for volume level change
volumeRange.addEventListener('change', function() {
    volume = parseFloat(this.value);
    // Play sound for volume check
    playAlertSound();
    // Save volume level to cookie
    saveVolumeToCookie(this.value);
    console.log('Volume changed:', volume);
});

document.getElementById('cancelTimer').addEventListener('click', function () {
    pauseTimer();
});

function addToLog(duration, timerName) {
    const log = document.getElementById('log');
    const listItem = document.createElement('div');
    listItem.setAttribute("class", "log-item-container");

    const startDate = new Date();
    const startTimeString = `${startDate.getHours()}:${startDate.getMinutes()}:${startDate.getSeconds()}`;
    const durationMinutes = Math.floor(duration / 60);

    const backgroundColor = colors[colorIndex];
    listItem.style.backgroundColor = backgroundColor;
    listItem.addEventListener('mouseenter', function() {
        this.style.backgroundColor = '#f0f0f0';
    });
    
    listItem.addEventListener('mouseleave', function() {
        this.style.backgroundColor = backgroundColor;
    });
    // Create a delete button (circle)
    const deleteButton = document.createElement('span');
    deleteButton.textContent = '×';
    deleteButton.classList.add('deleteButton');

    // Add event listener to delete the log entry when the delete button is clicked
    deleteButton.addEventListener('click', function() {
        log.removeChild(listItem);
    });

    // Append the delete button and log text to the log entry
    listItem.textContent = `${timerName} started at ${startTimeString} for ${durationMinutes} minutes`;
    listItem.appendChild(deleteButton);

    log.appendChild(listItem);
    log.scrollTop = log.scrollHeight;

    // Increase the color index to choose the next color from the array
    colorIndex = (colorIndex + 1) % colors.length;
}


//TODO: reduce copypaste 
//TODO: delete button is ugly do something with it 
document.getElementById('addSeparator').addEventListener('click', function() {
    const timerName = document.getElementById('separatorName').value;
    const log = document.getElementById('log');
    const listItem = document.createElement('div');

    listItem.style.marginBottom = '5px'; // Add some bottom margin for separation

    // Create a delete button (cross)
    const deleteButton = document.createElement('span');
    deleteButton.textContent = '×';
    deleteButton.classList.add('deleteButton');

    // Add event listener to delete the log entry when the delete button is clicked
    deleteButton.addEventListener('click', function() {
        log.removeChild(listItem);
    });

    // Append the delete button to the empty log entry
    listItem.textContent = `${timerName}`;
    listItem.appendChild(deleteButton);

    log.appendChild(listItem);
    log.scrollTop = log.scrollHeight;
});


// Функция для сохранения текста поля ввода в локальном хранилище
function saveInputTextToLocalStorage(inputId) {
    const inputElement = document.getElementById(inputId);
    if (inputElement) {
        const inputValue = inputElement.value;
        localStorage.setItem(inputId, inputValue);
    }
}

// Функция для загрузки текста поля ввода из локального хранилища
function loadInputTextFromLocalStorage(inputId) {
    const inputValue = localStorage.getItem(inputId);
    if (inputValue !== null) {
        const inputElement = document.getElementById(inputId);
        if (inputElement) {
            inputElement.value = inputValue;
        }
    }
}

// Загружаем текст из локального хранилища при загрузке страницы
window.addEventListener('load', function() {
    loadInputTextFromLocalStorage('timerName1');
    loadInputTextFromLocalStorage('timerName2');
    loadInputTextFromLocalStorage('timerName3');
    loadInputTextFromLocalStorage('timerName4');
    loadInputTextFromLocalStorage('timerName5');
    loadInputTextFromLocalStorage('separatorName');
});

// Добавляем обработчики событий для сохранения текста в локальном хранилище при изменении содержимого полей ввода
document.getElementById('timerName1').addEventListener('input', function () {
    saveInputTextToLocalStorage('timerName1');
});

document.getElementById('timerName2').addEventListener('input', function () {
    saveInputTextToLocalStorage('timerName2');
});

document.getElementById('timerName3').addEventListener('input', function () {
    saveInputTextToLocalStorage('timerName3');
});

document.getElementById('timerName4').addEventListener('input', function () {
    saveInputTextToLocalStorage('timerName4');
});

document.getElementById('timerName5').addEventListener('input', function () {
    saveInputTextToLocalStorage('timerName5');
});

document.getElementById('separatorName').addEventListener('input', function () {
    saveInputTextToLocalStorage('separatorName');
});



updState(); // Set cancel button state on page load
