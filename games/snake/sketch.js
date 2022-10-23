// global vars (sorry, very messy)
// const Swal = require('sweetalert2');
const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
const w = 15; // snake pixel size
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
//trigger support added below
const trigger_freq = 5;
var all_content;
var curr_content;
var config;
$.getJSON('../../resources/content.json', function (data) {
    all_content = data;
});
$.getJSON('../../resources/config.json', function (data) {
    config = data;
});

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
    guide: true,
    trigger: false
};

const difficulties = {
    easy: 'easy', // 5
    normal: 'normal', // 9
    hard: 'hard', // 13
    insane: 'insane' // 17
}

var total_images = 30;

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
        fps = 5;
    }
    if (difficulty == 'normal') {
        fps = 9;
    }
    if (difficulty == 'hard') {
        fps = 13;
    }
    if (difficulty == 'insane') {
        fps = 17;
    }
    game.started = true;
    frameRate(fps);
    snake = new Snake(floor(w / 2), floor(h / 2) - 1, boundaries);
    new_food(snake.body);
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
    button.template.color = "#fff";
    button.template.textColor = "#333";
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
    button.easy.stroke = "#0f0";
    button.easy.difficulty = difficulties.easy;

    // normal button
    button.normal = { ...button.template };
    button.normal.y = button.easy.y + button.template.height + btnspacing;
    button.normal.text = "normal";
    button.normal.stroke = "#ff0";
    button.normal.difficulty = difficulties.normal;

    // hard button
    button.hard = { ...button.template };
    button.hard.y = button.normal.y + button.template.height + btnspacing;
    button.hard.text = "hard";
    button.hard.stroke = "#f00";
    button.hard.difficulty = difficulties.hard;

    // insane button
    button.insane = { ...button.template };
    button.insane.y = button.hard.y + button.template.height + btnspacing;
    button.insane.text = "insane";
    button.insane.stroke = "#333";
    button.insane.difficulty = difficulties.insane;

    // trigger button (not interactive)
    button.trigger = { ...button.template };
    button.trigger.resize(vw * 0.8, max(vw, vh) * 0.2);
    button.trigger.y = centerbtns(3);
    button.trigger.x = vw * 0.5 - button.trigger.width * 0.5;
    button.trigger.stroke = "#f00";
    button.trigger.onPress = function () { };
    button.trigger.onRelease = function () { };
    button.trigger.text = get_content();
    button.trigger.textSize = button.template.textSize * 0.6;

    // again button
    button.again = { ...button.template };
    button.again.y = button.trigger.y + button.trigger.height + btnspacing;
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

    // trigger ok button
    button.triggerok = { ...button.template };
    button.triggerok.y = button.again.y + button.template.height + btnspacing;
    button.triggerok.text = "OK";
    button.triggerok.onRelease = function () {
        if (game.trigger) {
            game.trigger = false;
        }
    };

    // score button (not interactive)
    button.score = { ...button.template };
    button.score.resize(button.template.width * 1.3, button.template.height * 1.3);
    button.score.y = button.trigger.y - button.score.height - btnspacing;
    button.score.x = vw * 0.5 - button.score.width * 0.5;
    button.score.stroke = "#00f";
    button.score.onPress = function () { };
    button.score.onRelease = function () { };
}

// game loop
function draw() {
    noStroke();
    drawbg = function () {
        background(color(0, 0, 92));
    }
    drawdimbg = function () {
        background(color(0, 0, 50));
    }

    // menu
    if (!game.started) {
        drawbg();
        textSize(vh * 0.15);
        textFont('Lucida Grande');
        text('snake', vw * 0.5, vh * 0.12);
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
        // button.score.text = "Score: " + snake.score_final;
        // button.again.stroke = saved.stroke;

        // button.score.draw();
        // button.again.draw();
        // button.back.draw();
        // button.trigger.draw();
        noLoop();
        $('.p5Canvas').addClass('d-none');
        addEndScreen();
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
    if (game.started && !game.trigger && !game.ended) {
        // draw over menu buttons
        drawbg();
        snake.input();
        snake.update();

        //instructions
        if (game.guide && !game.ended) {
            textSize(w * 0.07);
            strokeWeight(0);
            fill(80);

            var guidetxt = {
                x: w * 0.5,
                y: h * 0.3
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
        textSize(w * 0.4);
        strokeWeight(0);
        fill(80);
        text(snake.body.length - 1, w * 0.5, h * 0.5);


        if (snake.did_eat(food)) {
            if(if_show_content(snake.body)) {
                curr_content = get_content();
                // game.trigger = true;
            }
            snake.body.push(snake.body[snake.body.length - 1]);
            new_food(snake.body);
            eat_tune.cloneNode(true).play();
        }

        food.show();
        snake.show();
    }

    // trigger
    if (game.trigger && !game.ended) {
        drawdimbg();
        textSize(w * 0.05);
        strokeWeight(0);
        fill(80);
        text(curr_content, w * 0.1, h * 0.1, w*0.8, h*0.8);
        setTimeout(function() {sleep(2000);}, 100);
        snake.hammer.on("swipe tap press", function () {
            game.trigger = false;
            game.pause = true;
        });
    }
}

//if to show trigger content
function if_show_content(body) {
    if(body.length > 1 && ((body.length - 1) % trigger_freq == 0)) {
        return true;
    }
    return false;
}

//get trigger content
function get_content() {
    var total = all_content["content"].length;
    var number = Math.floor(Math.random() * total);
    return all_content["content"][number]["text"];
}

function sleep(miliseconds) {
   var currentTime = new Date().getTime();

   while (currentTime + miliseconds >= new Date().getTime()) {
      
   }
}

function share() {
    if (navigator.share) {
        navigator.share({
            title: 'Chill Panda',
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

function addEndScreen() {
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
            // $('.p5Canvas').removeClass('d-none');
            // button.back.onRelease();
            // loop();
            window.location = window.location.pathname;
        } else if (result.isDenied) {
            window.location.href = config['prod_url'];
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            window.location.href = config['prod_url'];
        }
    });
    var triggerDiv = '<div class="trigger-div">' + button.trigger.text + '</div>';
    $('.swal2-container').append(triggerDiv);
    var shareDiv = document.createElement('div');
    shareDiv.className = 'share-div';
    shareDiv.innerHTML = '<i class="fa fa-share fa-2x" aria-hidden="true"></i>';
    shareDiv.addEventListener('click', share);
    $('.swal2-container').append(shareDiv);
    var buttonTextDiv = document.createElement('div');
    buttonTextDiv.className = 'button-div';
    buttonTextDiv.innerHTML = '<span>Repeat</span><span>Shuffle</span><span>Exit</span>';
    $('.swal2-container').append(buttonTextDiv);
    var logoDiv = document.createElement('div');
    logoDiv.className = 'logo-div';
    logoDiv.innerHTML = '<a href='+ all_content['website'] +' target="_blank">' 
    + '<img src=' + all_content['logo'] + '>' + '</a>';
    $('.swal2-container').append(logoDiv);
}