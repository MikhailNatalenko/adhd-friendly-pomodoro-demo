let timeLeft = 0;
let timerInterval;
let audioContext = new AudioContext();
let alertSoundBuffer;
let alertInterval; // Объявляем переменную для интервала звукового сигнала

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
    let timerDisplay = document.getElementById('timer');
    let endTime = Date.now() + seconds * 1000;

    updateTimer();

    timerInterval = setInterval(updateTimer, 1000);

    function updateTimer() {
        let timeRemaining = endTime - Date.now();
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            clearInterval(alertInterval); // Останавливаем интервал звукового сигнала
            playAlertSound(); // Проигрываем звук по истечении времени
            return;
        }

        let minutes = Math.floor((timeRemaining / 1000 / 60) % 60);
        let seconds = Math.floor((timeRemaining / 1000) % 60);

        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;

        timerDisplay.textContent = minutes + ":" + seconds;
    }
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

document.getElementById('cancelTimer').addEventListener('click', function () {
    clearInterval(timerInterval);
    clearInterval(alertInterval);
    let timerDisplay = document.getElementById('timer');
    timerDisplay.textContent = "00:00";
});

// Обработчик события изменения видимости страницы
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') {
        clearInterval(alertInterval); // Остановка интервала звукового сигнала
    }
});

// Обработчик изменения уровня громкости
volumeRange.addEventListener('change', function() {
    volume = parseFloat(this.value);
    
    // Проигрываем звук для проверки громкости
    playAlertSound();
});
