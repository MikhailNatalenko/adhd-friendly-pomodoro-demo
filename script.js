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

function startTimer(seconds) {
    clearInterval(timerInterval); // Stop previous interval, if any
    clearInterval(alertInterval); // Stop previous alert interval

    let endTime = Date.now() + seconds * 1000;
    timeLeft = seconds;

    console.log('Timer started:', seconds, 'seconds');
    timerState = TimerState.RUNNING;
    updateCancelButtonState()
    addToLog(seconds)
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


function updateCancelButtonState() {
    const cancelButton = document.getElementById('cancelTimer');
    cancelButton.disabled = (timerState === TimerState.STOPPED);
}


function pauseTimer() {
    clearInterval(timerInterval);
    clearInterval(alertInterval); // Stop sound alert
    timerState = TimerState.STOPPED;
    console.log('Timer paused');
    console.log('Timer state:', timerState);
    let timerDisplay = document.getElementById('timer');
    timerDisplay.textContent = "00:00";
    updateCancelButtonState(); // Обновляем состояние кнопки "Отмена"
}

document.getElementById('pomodoro25').addEventListener('click', function () {
    startTimer(25 * 60);
});

document.getElementById('pomodoro20').addEventListener('click', function () {
    startTimer(20 * 60);
});

document.getElementById('pomodoro15').addEventListener('click', function () {
    startTimer(15 * 60);
});

document.getElementById('pomodoro5').addEventListener('click', function () {
    startTimer(5 * 60);
});

document.getElementById('pomodoroDebug').addEventListener('click', function () {
    startTimer(10);
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

function addToLog(duration) {
    const log = document.getElementById('log');
    const listItem = document.createElement('div');

    const startDate = new Date();
    const startTimeString = `${startDate.getHours()}:${startDate.getMinutes()}:${startDate.getSeconds()}`;
    const durationMinutes = Math.floor(duration / 60);

    listItem.style.backgroundColor = colors[colorIndex]; // Set background color from the array


    listItem.textContent = `Timer started at ${startTimeString} for ${durationMinutes} minutes`;
    log.appendChild(listItem);
    log.scrollTop = log.scrollHeight;

    // Increase the color index to choose the next color from the array
    colorIndex = (colorIndex + 1) % colors.length;

}


updateCancelButtonState(); // Устанавливаем состояние кнопки "Отмена" при загрузке страницы
