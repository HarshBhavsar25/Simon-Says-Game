let gameSeq = [];
let userSeq = [];
let started = false;
let level = 0;
let highScore = 0;

const btns = ['yellow', 'red', 'purple', 'green'];
const h2 = document.querySelector('h2');
const h1 = document.querySelector('h1');
const container = document.querySelector('.container');
const currentScoreSpan = document.getElementById('current-score');
const highScoreSpan = document.getElementById('high-score');
const restartBtn = document.getElementById('restart-btn');
const resumeBtn = document.getElementById('resume-btn');

function loadSavedGame() {
    const saved = localStorage.getItem('simonHorror');
    if (!saved) return false;

    try {
        const data = JSON.parse(saved);
        if (data.gameSeq && Array.isArray(data.gameSeq) && data.gameSeq.length > 0) {
            gameSeq = data.gameSeq;
            level = data.level || 0;
            if (data.highScore > highScore) {
                highScore = data.highScore;
                updateHighScore();
            }
            started = true;
            userSeq = [];
            resumeBtn.style.display = 'inline-block';
            h2.innerText = `⏸️ Saved at level ${level} — press resume or restart`;
            return true;
        }
    } catch (e) {
        console.warn('corrupted save');
    }
    return false;
}

function saveGame() {
    if (!started || level === 0) return;

    const gameState = {
        gameSeq: gameSeq,
        level: level,
        highScore: highScore,
        timestamp: Date.now()
    };
    localStorage.setItem('simonHorror', JSON.stringify(gameState));
}

function clearSavedGame() {
    localStorage.removeItem('simonHorror');
    resumeBtn.style.display = 'none';
}

function loadHighScoreOnly() {
    const saved = localStorage.getItem('simonHorror');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            if (data.highScore && data.highScore > highScore) {
                highScore = data.highScore;
            }
        } catch { }
    }
    const legacyHigh = localStorage.getItem('simonHighScore');
    if (legacyHigh && !isNaN(parseInt(legacyHigh))) {
        const leg = parseInt(legacyHigh);
        if (leg > highScore) highScore = leg;
    }
    updateHighScore();
}

function updateHighScore() {
    highScoreSpan.innerText = highScore;
    localStorage.setItem('simonHighScore', highScore);
}

function updateCurrentScore() {
    currentScoreSpan.innerText = level;
}

function gameFlash(btn) {
    btn.classList.add('flash');
    setTimeout(() => btn.classList.remove('flash'), 250);
}

function userFlash(btn) {
    btn.classList.add('userflash');
    setTimeout(() => btn.classList.remove('userflash'), 150);
}

function levelUp() {
    userSeq = [];
    level++;
    h2.innerText = `Level ${level}`;
    updateCurrentScore();

    if (level > highScore) {
        highScore = level;
        updateHighScore();
    }

    const randIdx = Math.floor(Math.random() * 4);
    const randColor = btns[randIdx];
    const randBtn = document.querySelector(`.${randColor}`);

    gameSeq.push(randColor);
    gameFlash(randBtn);
    saveGame();
}

function checkAns(idx) {
    if (userSeq[idx] === gameSeq[idx]) {
        if (userSeq.length === gameSeq.length) {
            setTimeout(levelUp, 800);
        }
    } else {
        h2.innerHTML = `💀 GAME OVER 💀 <br> Your score: <b>${level}</b> <br> Press any key / restart`;
        displayHorror();

        if (level > highScore) {
            highScore = level;
            updateHighScore();
        }

        resetGame();
        clearSavedGame();
    }
}

function displayHorror() {
    document.body.classList.add('game-lose');
    h1.classList.add('horror-msg');
    h1.innerText = 'TRY AGAIN';

    setTimeout(() => {
        document.body.classList.remove('game-lose');
        h1.classList.remove('horror-msg');
        h1.innerText = 'Simon Says Game';
    }, 2000);
}

function btnPress() {
    if (!started) return;
    if (userSeq.length === gameSeq.length) return;

    const btn = this;
    const userColor = btn.getAttribute('id');

    userSeq.push(userColor);
    userFlash(btn);
    checkAns(userSeq.length - 1);
}

function resetGame() {
    started = false;
    gameSeq = [];
    userSeq = [];
    level = 0;
    updateCurrentScore();
    h2.innerHTML = `Press any key or Restart to begin`;
    clearSavedGame();
}

function freshStart() {
    started = true;
    level = 0;
    gameSeq = [];
    userSeq = [];
    clearSavedGame();
    setTimeout(() => {
        levelUp();
    }, 10);
    h2.innerText = 'Game started!';
}

function resumeSavedGame() {
    const saved = localStorage.getItem('simonHorror');
    if (!saved) {
        resumeBtn.style.display = 'none';
        return;
    }
    try {
        const data = JSON.parse(saved);
        if (data.gameSeq && data.level) {
            gameSeq = data.gameSeq;
            level = data.level;
            started = true;
            userSeq = [];
            h2.innerText = `Resumed at level ${level} — repeat the pattern`;
            playPatternSlowly();
            resumeBtn.style.display = 'none';
        } else {
            resumeBtn.style.display = 'none';
        }
    } catch (e) {
        resumeBtn.style.display = 'none';
    }
}

function playPatternSlowly() {
    let i = 0;
    const interval = setInterval(() => {
        if (!started || i >= gameSeq.length) {
            clearInterval(interval);
            return;
        }
        const color = gameSeq[i];
        const btn = document.querySelector(`.${color}`);
        gameFlash(btn);
        i++;
    }, 600);
}

document.addEventListener('keypress', function (e) {
    if (!started) {
        freshStart();
    }
});

const allBtns = document.querySelectorAll('.box');
for (let btn of allBtns) {
    btn.addEventListener('click', btnPress);
}

restartBtn.addEventListener('click', function () {
    freshStart();
});

resumeBtn.addEventListener('click', function () {
    resumeSavedGame();
});

window.addEventListener('load', function () {
    loadHighScoreOnly();
    const hasSave = loadSavedGame();
    if (!hasSave) {
        h2.innerText = 'Press any key to start the game';
    }
    updateCurrentScore();
});

window.addEventListener('beforeunload', function () {
    if (started && level > 0) {
        saveGame();
    }
});