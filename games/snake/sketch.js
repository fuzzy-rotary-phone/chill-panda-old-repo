// instance variables to be loaded from index.js
loadInstanceVariables('../../' + CONTENT_PATH, '../../' + CONFIG_PATH)

// global vars (sorry, very messy)
// const Swal = require('sweetalert2');
const TOTAL_IMAGES_FOR_HOSPITAL = 12
const TOTAL_IMAGES_DEFAULT = 30
const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
const w = 12; // snake pixel size
var h = w * 4;
const pixel_size = vw / w;
console.log("setting pixel size to " + pixel_size);
var setting_height = true;
while (setting_height) {
    if (h * pixel_size > vh) {
        h--;
    } else {
        setting_height = false;
    }
}
console.log("setting canvas height (in pixels) to " + h);

var snake, food;
var boundaries = { xmin: 0, xmax: w, ymin: 0, ymax: h };
var eat_tune = new Audio("resources/audio/eat-tune.mp3");

var button = {
    template: new Clickable(),
    easy: undefined,
    normal: undefined,
    hard: undefined,
    insane: undefined,
    again: undefined,
    back: undefined,
    score: undefined
};

var saved = {
    stroke: undefined,
    difficulty: undefined
};

var game = {
    started: false,
    ended: false,
    guide: true
};

const difficulties = {
    easy: 'easy', // 5
    normal: 'normal', // 9
    hard: 'hard', // 13
    insane: 'insane' // 17
}

var total_images = setTotalImages()

function setTotalImages() {
    var retailLocation = localStorage['retailLocation']
    if (retailLocation == TAG_FOR_PARTHA_DENTAL) {
        return TOTAL_IMAGES_FOR_HOSPITAL
    }
    return TOTAL_IMAGES_DEFAULT
}

function new_food(body) {
    var number = 1 + floor(random(total_images));
    var placing_food = true;
    var food_on_body = false;
    while (placing_food) {
        food = new Food(w, h, snake.rainbow.colors[snake.body.length], number);
        for (var b of body) {
            if (food.x === b.x && food.y === b.y) {
                food_on_body = true;
                break;
            } else {
                food_on_body = false;
            }
        }
        if (!food_on_body) {
            placing_food = false;
        }
    }
}

function new_game(difficulty) {
    var fps;
    if (difficulty == 'easy') {
        // fps = 5;
        fps = 3;
    }
    if (difficulty == 'normal') {
        // fps = 9;
        fps = 5;
    }
    if (difficulty == 'hard') {
        // fps = 13;
        fps = 7;
    }
    if (difficulty == 'insane') {
        // fps = 17;
        fps = 15;
    }
    game.started = true;
    frameRate(fps);
    snake = new Snake(floor(w / 2), floor(h / 2) - 1, boundaries);
    new_food(snake.body);

    gtag("event", "game_start")
}

function addCanvas() {
    var canvas = createCanvas(w * pixel_size * 0.985, h * pixel_size);
    canvas.parent("canvas-container");
    colorMode(HSB);
    textAlign(CENTER, CENTER);    
}

function setup() {
    addCanvas();

    // button template
    button.template.resize(vw * 0.55, vh * 0.12);
    button.template.x = vw * 0.5 - button.template.width * 0.5;
    button.template.strokeWeight = vw * 0.015;
    button.template.cornerRadius = 30;
    button.template.color = "#000";
    button.template.textColor = "#FFF";
    button.template.textFont = "Helvetica Neue";
    button.template.textSize = vw * 0.07;
    var btnspacing = vh * 0.03;
    button.template.onPress = function () {
        this.color = this.stroke;
        this.textColor = "#fff";
    };
    button.template.onRelease = function () {
        if (!game.started) {
            saved.difficulty = this.difficulty;
            saved.stroke = this.stroke;
            game.guide = true;
            new_game(saved.difficulty);
        }
    };

    centerbtns = function (nbtns) {
        var top = (vh - (button.template.height * nbtns + btnspacing * (nbtns - 1))) / 2;
        top = top + vh - h * pixel_size;
        return top;
    };

    // easy button
    button.easy = { ...button.template };
    button.easy.y = centerbtns(4);
    button.easy.text = "easy";
    button.easy.stroke = "#ee9191";
    button.easy.difficulty = difficulties.easy;

    // normal button
    button.normal = { ...button.template };
    button.normal.y = button.easy.y + button.template.height + btnspacing;
    button.normal.text = "normal";
    button.normal.stroke = "#e75f5f";
    button.normal.difficulty = difficulties.normal;

    // hard button
    button.hard = { ...button.template };
    button.hard.y = button.normal.y + button.template.height + btnspacing;
    button.hard.text = "hard";
    button.hard.stroke = "#D70F0E";
    button.hard.difficulty = difficulties.hard;

    // insane button
    button.insane = { ...button.template };
    button.insane.y = button.hard.y + button.template.height + btnspacing;
    button.insane.text = "insane";
    button.insane.stroke = "#6a040f";
    button.insane.difficulty = difficulties.insane;

    // again button
    button.again = { ...button.template };
    button.again.y = button.insane.y + button.insane.height + btnspacing;
    button.again.text = "again";
    button.again.onRelease = function () {
        if (game.ended) {
            game.ended = false;
            game.started = true;
            new_game(saved.difficulty);
        }
    };

    // back button
    button.back = { ...button.template };
    button.back.y = button.again.y + button.template.height + btnspacing;
    button.back.text = "back";
    button.back.stroke = "#f6f";
    button.back.onRelease = function () {
        if (game.ended) {
            game.started = game.ended = false;
        }
    };

    // score button (not interactive)
    button.score = { ...button.template };
    button.score.resize(button.template.width * 1.3, button.template.height * 1.3);
    button.score.y = button.insane.y - button.score.height - btnspacing;
    button.score.x = vw * 0.5 - button.score.width * 0.5;
    button.score.stroke = "#00f";
    button.score.onPress = function () { };
    button.score.onRelease = function () { };
}

// game loop
function draw() {
    noStroke();
    drawbg = function () {
        background(color(0, 0, 1));
    }
    drawdimbg = function () {
        background(color(0, 0, 50));
    }

    // menu
    if (!game.started) {
        drawbg();
        fill('#FFFFFF');
        textSize(vh * 0.15);
        textFont('Lucida Grande');
        text('snake', vw * 0.5, vh * 0.12);
        // fill('#FFFFFF');
        textSize(vh * 0.015);
        textFont('Lucida Grande');
        text('swipe to change the direction of snake and don\'t hit the edges', vw * 0.5, vh * 0.2);
        button.easy.draw();
        button.normal.draw();
        button.hard.draw();
        button.insane.draw();
    }

    // reset buttons manually since btn.onOutside does not work on mobile
    else {
        button.easy.color = button.template.color;
        button.easy.textColor = button.template.textColor;
        button.normal.color = button.template.color;
        button.normal.textColor = button.template.textColor;
        button.hard.color = button.template.color;
        button.hard.textColor = button.template.textColor;
        button.insane.color = button.template.color;
        button.insane.textColor = button.template.textColor;
    }

    // die screen
    if (game.ended) {
        noLoop();
        $('.p5Canvas').addClass('d-none');
        setTimeout(function() { showAd() }, 1000);
    }

    // see line 165
    else {
        button.again.color = button.template.color;
        button.again.textColor = button.template.textColor;
        button.back.color = button.template.color;
        button.back.textColor = button.template.textColor;
    }
    scale(pixel_size); // resets after draw loop begins again

    // gameplay
    if (game.started && !game.ended) {
        // draw over menu buttons
        drawbg();
        snake.input();
        snake.update();

        //instructions
        if (game.guide && !game.ended) {
            textSize(w * 0.07);
            strokeWeight(0);
            fill('#dee2e6');

            var guidetxt = {
                x: w * 0.5,
                y: h * 0.5
            }

            if (snake.dir.x == 0 && snake.dir.y == 0) {
                text('swipe to move!', guidetxt.x, guidetxt.y)
            }
            else if (snake.body.length == 1) {
                text('eat to grow!', guidetxt.x, guidetxt.y)
            }
            else if (snake.body.length == 2) {
                text('go as far\nas you can!', guidetxt.x, guidetxt.y)
            }
        }

        if (snake.body.length >= 5) {
            game.guide = false;
        }

        // display score
        textSize(w * 0.1);
        strokeWeight(0);
        fill('#dee2e6');
        text(snake.body.length - 1, w * 0.93, h * 0.05);


        if (snake.did_eat(food)) {
            snake.body.push(snake.body[snake.body.length - 1]);
            new_food(snake.body);
            eat_tune.cloneNode(true).play();
        }

        food.show();
        snake.show();
    }    
}

function sleep(miliseconds) {
   var currentTime = new Date().getTime();

   while (currentTime + miliseconds >= new Date().getTime()) {
      
   }
}

function share(score) {
    if (navigator.share) {
        navigator.share({
            title: 'Chill Panda',
            text: 'Haha! I scored ' + score + '. Play and beat me if you can',
            url: window.location.href
        }).then(() => {
            console.log('Thanks for sharing!');
        }).catch(err => {
            console.log('Error while using Web share API:');
            console.log(err);
        });
    } else {
        Swal.fire("Browser doesn't support this API !");
    }
}

function showAd(key) {
    $('.loader').css('display','');
    var number = 1 + Math.floor(Math.random() * TOTAL_ADS);
    var urlPath = AD_ASSETS_PATH + '' + number + '.png';
    $('canvas').addClass('d-none');
    $('body').addClass('ad-img');
    var closeDiv = document.createElement('div');
    closeDiv.className = 'close-div';
    closeDiv.innerHTML = '<i class="fa fa-times fa-2x" aria-hidden="true"></i>';
    closeDiv.addEventListener('click', (e) => { showEndScreen(); });
    $('<img/>').attr('src', urlPath).on('load', function() {
        $(this).remove();
        $('body').css('background-image', 'url("' + urlPath + '")');
        $(".loader").fadeOut("1000");
        $('body').append(closeDiv);
        setTimeout(function() {
            closeDiv.classList.add('is-shown');
        }, 3000);
    });
}

function removeAd() {
    $('body').removeClass('ad-img');
    $('body').css('background-image', '');
    $('.close-div').remove();
    $('canvas').removeClass('d-none');
}

function showEndScreen() {
    removeAd();
    Swal.fire({
        allowEscapeKey: false,
        allowOutsideClick: false,
        title: 'Game over!',
        html: '<span>Your snake length is </span><strong>' + snake.score_final + 
        '</strong><br/>',
        icon: 'error',
        backdrop: 'white',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: '<i class="fa fa-repeat fa-2x" aria-hidden="true"></i>',
        denyButtonText: '<i class="fa fa-random fa-2x" aria-hidden="true"></i>',
        cancelButtonText: '<i class="fa fa-times fa-2x" aria-hidden="true"></i>',
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            window.location = window.location.pathname;
        } else if (result.isDenied) {
            loadNewGame();
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            openNPS();
        }
    });
    var shareDiv = document.createElement('div');
    shareDiv.className = 'share-div';
    shareDiv.innerHTML = '<i class="fa fa-share fa-2x" aria-hidden="true"></i>';
    shareDiv.addEventListener('click', function() {
        share(snake.score_final)
    });
    $('.swal2-container').append(shareDiv);
    var buttonTextDiv = document.createElement('div');
    buttonTextDiv.className = 'button-div';
    buttonTextDiv.innerHTML = '<span>Repeat</span><span>Shuffle</span><span>Exit</span>';
    $('.swal2-container').append(buttonTextDiv);
    var logoDiv = document.createElement('div');
    logoDiv.className = 'logo-div';
    logoDiv.innerHTML = '<a href='+ WEBSITE_LINK +' target="_blank">' 
    + '<img src=' + LOGO_PATH + '>' + '</a>';
    $('.swal2-container').append(logoDiv);
    localStorage.setItem('lastGame', 6);
}

function loadNewGame() {
    window.location.href = window.location.origin + '/' + GAME_MAP[getRandomNumber()];
}

function openNPS() {
    window.location.href = window.location.origin + '/rating.html';
}

gaSetUserId();
gaSetUserProperties();