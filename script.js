const TimerState = {
    RUNNING: 'RUNNING',
    STOPPED: 'STOPPED',
    WAITING_FOR_STOP: 'WAITING_FOR_STOP'
};

let timerState = TimerState.STOPPED;
let timeLeft = 0;
let timerInterval;
let audioContext = new AudioContext();
let alertSoundBuffer;
let alertInterval;

// Получаем элемент управления громкостью
let volumeRange = document.getElementById('volumeRange');
let volume = parseFloat(volumeRange.value); // Изначальное значение громкости

// Загрузка звукового файла
fetch('ring.wav')
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
    .then(audioBuffer => {
        alertSoundBuffer = audioBuffer;
    })
    .catch(error => console.error('Ошибка загрузки звукового файла:', error));

function playAlertSound() {
    if (!alertSoundBuffer) return;
    let source = audioContext.createBufferSource();
    source.buffer = alertSoundBuffer;

    // Применяем уровень громкости
    let gainNode = audioContext.createGain();
    gainNode.gain.value = volume;
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);

    source.start(0);
}

function startTimer(seconds) {
    clearInterval(timerInterval); // Остановка предыдущего интервала, если он есть
    clearInterval(alertInterval); // Остановка предыдущего интервала звукового сигнала

    let endTime = Date.now() + seconds * 1000;
    timeLeft = seconds;

    updateTimer();

    timerInterval = setInterval(updateTimer, 1000);

    timerState = TimerState.RUNNING;

    function updateTimer() {
        let timeRemaining = endTime - Date.now();
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            playAlertSound(); // Проигрываем звук по истечении времени
            if (document.visibilityState === 'visible') {
                pauseTimer(); // Переводим таймер в состояние STOPPED, если страница видима
            } else {
                alertInterval = setInterval(playAlertSound, 30 * 1000); // Ставим интервал на 30 секунд
                timerState = TimerState.WAITING_FOR_STOP; // Переходим в состояние ожидания остановки
            }
            return;
        }

        let minutes = Math.floor((timeRemaining / 1000 / 60) % 60);
        let seconds = Math.floor((timeRemaining / 1000) % 60);

        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;

        let timerDisplay = document.getElementById('timer');
        timerDisplay.textContent = minutes + ":" + seconds;
    }
}

function pauseTimer() {
    clearInterval(timerInterval);
    timerState = TimerState.STOPPED;
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

// Обработчик события изменения видимости страницы
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible' && timerState === TimerState.WAITING_FOR_STOP) {
        pauseTimer(); // При возвращении на вкладку переводим таймер в состояние STOPPED
    }
});

// Обработчик изменения уровня громкости
volumeRange.addEventListener('change', function() {
    volume = parseFloat(this.value);
    
    // Проигрываем звук для проверки громкости
    playAlertSound();
});
