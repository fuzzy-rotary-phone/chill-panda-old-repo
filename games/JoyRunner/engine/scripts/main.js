"use strict";
/***** DOM *****/

const game = {
    container: document.querySelector(".game-container"),
    character: document.querySelector("#game-character"),
    barrier: document.querySelector("#game-barrier"),
    score: document.querySelector("#score"),
    root: document.querySelector(":root"),
    clouds: document.querySelector(".cloud-area")
};

const statusText = {
    gameOver: document.querySelector("#game-over-text"),
    bestScore: document.querySelector("#best-score"),
    container: document.querySelector(".status-container"),
    trigger: document.querySelector("#trigger-text")
}

// event
const keyup = (e) => { listenUserKey(e) };
const click = (e) => { listenUserKey("click") };
window.addEventListener("keyup", keyup);
window.addEventListener("touchstart", click);

/***** obj *****/
// jump
let isJumped = false;
let characterJumpTimer = setTimeout(() => {}, 0)
const character = {
    jump: () => {
        clearTimeout(characterJumpTimer);
        game.character.style.bottom = "60px";
        isJumped = true;
        sounds.jump.play();
        game.character.src = "content/gifs/character-jump.gif";
        characterJumpTimer = setTimeout(() => {
            game.character.style.bottom = "0px";
            characterJumpTimer = setTimeout(() => {
                game.character.src = "content/gifs/character-run.gif";
                isJumped = false;
            }, 130)
        }, 400);
    },
}

// score
let score = 0;
let scoreCounterTimer = setInterval(() => {}, 0);
const scoreCounter = {
    start: () => {
        clearInterval(scoreCounterTimer);
        game.score.innerHTML = "0";
        score = 0;
        scoreCounterTimer = setInterval(() => {
            score++;
            game.score.innerHTML = score;
        }, 0.1)
    },
    stop: () => {
        clearInterval(scoreCounterTimer);
    }
}

// lost
let lostListenerTimer = setInterval(() => {}, 0);
let isLosted = false;
const lostListener = {
    start: () => {
        let isLosted = false;
        clearInterval(lostListenerTimer);
        lostListenerTimer = setInterval(() => {
            if (barrierLeftOffset == -4 && game.character.style.bottom == "0px") {
                userLost();
            }

        }, 1);
    },
    stop: () => {
        clearInterval(lostListenerTimer);
    }
}

// barrier anim
let barrierAnimTimer = setInterval(() => {}, 0);
let barrierLeftOffset = 90;
let barrierRounds = 0;
let barrierDurationValue = 15;
const barrierAnim = {
    start: () => {
        barrierLeftOffset = 90;
        barrierRounds = 0;
        clearInterval(barrierAnimTimer);
        barrierAnimTimer = setInterval(() => {
            game.barrier.style.left = `${barrierLeftOffset}%`;
            barrierLeftOffset--;
            if (barrierLeftOffset == -35) {
                barrierLeftOffset = 90;
                barrierRounds++;
                checkBarrierRounds(barrierRounds);
                setBarrierIndexRandom();
                randomBarrierSetter.set(barrierIndex);
            }
        }, barrierDurationValue);
    },
    stop: () => {
        clearInterval(barrierAnimTimer);
    }
}

// random barrier
const randomBarrierSetter = {
    set(index = 1) {
        game.barrier.src = `content/images/barrier-${index}.png`;
    }
}

// game
let gameStarted = false;
const gameStatus = {
    start: () => {
        gameStarted = true;
        scoreCounter.start();
        lostListener.start();
        barrierAnim.start();
        game.character.src = "content/gifs/character-run.gif";
        game.clouds.style.left = "100%";
        game.clouds.style.animationPlayState = "running";
        sounds.playground.currentTime = 0;
        sounds.playground.play();
        statusText.container.classList.add("d-none");
        statusText.trigger.classList.add("d-none");

        gtag("event", "game_start")
    },
    stop: () => {
        gameStarted = false;
        scoreCounter.stop();
        lostListener.stop();
        barrierAnim.stop();
        game.character.src = "content/gifs/character.png";
        game.clouds.style.animationPlayState = "paused";
        sounds.playground.pause();
        statusText.container.classList.remove("d-none");
        // statusText.trigger.classList.remove("d-none");
    }
}

// submit score
let lastScoreValue;
const lastScore = {
    get: () => {
        lastScoreValue = localStorage.getItem("score");
        if (lastScoreValue) {
            lastScoreValue = parseInt(lastScoreValue);
        } else {
            lastScoreValue = 0;
        }
    },
    set: () => {
        localStorage.setItem("score", score);
    },
    setInStatus: () => {
        statusText.bestScore.innerText = lastScoreValue;
    },
}

let exitClick = false;
/***** function*****/
// event listener (key)
function listenUserKey(data) {
    if (exitClick) {
        exitClick = false;
        return;
    }    
    if (gameStarted) {
        if (isJumped == false) {
            if (data == "click") {
                character.jump();
            } else if (data.code == "Space" || data.code == "Enter" || data.code == "ArrowUp" || data.code == "NumpadEnter") {
                character.jump();
            } else if (data.code == "ArrowDown") {
                clearTimeout(characterJumpTimer);
                game.character.style.bottom = "0px";
                characterJumpTimer = setTimeout(() => {
                    game.character.src = "content/gifs/character-run.gif";
                    isJumped = false;
                }, 230)
            }
        }
    } else {
        if (lostStatus) {
            if (data == "click") {
                character.jump();
                gameStatus.start();
                lostStatus = false;
            } else if (data.code == "Space" || data.code == "Enter" || data.code == "ArrowUp" || data.code == "NumpadEnter") {
                character.jump();
                gameStatus.start();
                lostStatus = false;
            }
        }
    }
}


// lost
let lostStatus = true;
let lostTimer = setTimeout(() => {}, 0);

function userLost() {
    isLosted = true;
    gameStatus.stop();
    sounds.lose.play();
    clearTimeout(characterJumpTimer);
    game.character.src = "content/gifs/character-lost.png";
    clearTimeout(lostTimer);
    lostTimer = setTimeout(() => {
        lostStatus = true;
    }, 1000);
    changeBestScore();
    statusText.gameOver.classList.remove("d-none");
    // setTrigger();
    // statusText.trigger.classList.remove("d-none");
    setTimeout(() => { showAd() }, 1000);
}

let barrierIndex;

function setBarrierIndexRandom() {
    barrierIndex = Math.floor(Math.random() * (5 - 1 + 1) + 1);
};


function checkBarrierRounds(rounds) {
    if (rounds == 5) {
        barrierAnim.stop();
        barrierDurationValue = 10;
        barrierAnim.start();
    } else if (rounds == 10) {
        barrierAnim.stop();
        barrierDurationValue = 5;
        barrierAnim.start();
    } else if (rounds == 15) {
        barrierAnim.stop();
        barrierDurationValue = 1;
        barrierAnim.start();
    } else if (rounds == 20) {
        barrierAnim.stop();
        barrierDurationValue = 0.3;
        barrierAnim.start();
    } else if (rounds == 25) {
        barrierAnim.stop();
        barrierDurationValue = 0.01;
        barrierAnim.start();
    }
}

// change best score
function changeBestScore() {
    lastScore.get();
    if (score > lastScoreValue) {
        lastScore.set();
        lastScore.get();
        lastScore.setInStatus();
    } else {
        lastScore.get();
        lastScore.setInStatus();
    }
}

changeBestScore();

function showAd() {
    localStorage.setItem('lastGame', 5)
    sessionStorage.setItem('title', 'Game over!')
    sessionStorage.setItem('html', '<span>Your score is </span><strong>' + score + '</strong><br/>')
    sessionStorage.setItem('share', 'Haha! I scored ' + score + '. Play and beat me if you can')
    window.open(window.location.origin + '/end_screen.html', '_self')    
}

gaSetUserId();
gaSetUserProperties();