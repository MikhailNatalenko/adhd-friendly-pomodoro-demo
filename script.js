let timeLeft = 0;
let timerInterval;

function startTimer(duration) {
    let timerDisplay = document.getElementById('timer');
    let endTime = Date.parse(new Date()) + duration * 60 * 1000;

    updateTimer();

    timerInterval = setInterval(updateTimer, 1000);

    function updateTimer() {
        let timeRemaining = endTime - Date.parse(new Date());
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            timerDisplay.textContent = "00:00";
            alert("Время вышло!");
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
    startTimer(25);
});

document.getElementById('pomodoro20').addEventListener('click', function () {
    startTimer(20);
});

document.getElementById('pomodoro15').addEventListener('click', function () {
    startTimer(15);
});

document.getElementById('pomodoro5').addEventListener('click', function () {
    startTimer(5);
});

document.getElementById('startStop').addEventListener('click', function () {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        this.textContent = "Старт";
    } else {
        let activeButton = document.querySelector('.options button.active');
        if (activeButton) {
            let duration = parseInt(activeButton.getAttribute('data-duration'));
            startTimer(duration);
        }
        this.textContent = "Стоп";
    }
});

document.querySelectorAll('.options button').forEach(function (button) {
    button.addEventListener('click', function () {
        document.querySelectorAll('.options button').forEach(function (button) {
            button.classList.remove('active');
        });
        this.classList.add('active');
    });
});
