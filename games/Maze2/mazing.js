// instance variables to be loaded from index.js
loadInstanceVariables('../../' + CONTENT_PATH, '../../' + CONFIG_PATH)

function Position(x, y) {
  this.x = x;
  this.y = y;
}

Position.prototype.toString = function() {
  return this.x + ":" + this.y;
};

function Mazing(id) {

  // bind to HTML element
  this.mazeContainer = document.getElementById(id);

  this.mazeScore = document.createElement("div");
  this.mazeScore.id = "maze_score";

  this.mazeMessage = document.createElement("div");
  this.mazeMessage.id = "maze_message";

  this.heroScore = this.mazeContainer.getAttribute("data-steps") - 2;

  this.maze = [];
  this.heroPos = {};
  this.heroHasKey = false;
  this.childMode = false;

  this.utter = null;

  for(i=0; i < this.mazeContainer.children.length; i++) {
    for(j=0; j < this.mazeContainer.children[i].children.length; j++) {
      var el =  this.mazeContainer.children[i].children[j];
      this.maze[new Position(i, j)] = el;
      if(el.classList.contains("entrance")) {
        // place hero at entrance
        this.heroPos = new Position(i, j);
        this.maze[this.heroPos].classList.add("hero");
      }
    }
  }

  this.initialHeroPos = this.heroPos
  this.initialHeroScore = this.heroScore

  var mazeOutputDiv = document.createElement("div");
  mazeOutputDiv.id = "maze_output";

  mazeOutputDiv.appendChild(this.mazeScore);
  mazeOutputDiv.appendChild(this.mazeMessage);

  mazeOutputDiv.style.width = this.mazeContainer.scrollWidth + "px";
  this.setMessage("first find the key");

  this.mazeContainer.insertAdjacentElement("afterend", mazeOutputDiv);

  // activate control keys
  this.keyPressHandler = this.mazeKeyPressHandler.bind(this);
  document.addEventListener("keydown", this.keyPressHandler, false);

  //active touch controls
  this.hammer = new Hammer(this.mazeContainer); // create hammer object to handle swipes
  this.hammer.get("swipe").set({ direction: Hammer.DIRECTION_ALL }); // enable vertical swipes
  this.swipeHandler();

  this.winFlag = false;

  this.retailLocation = localStorage['retailLocation']
  this.customizeMaze()
};

Mazing.prototype.customizeMaze = function() {
  if (this.retailLocation == TAG_FOR_PARTHA_DENTAL) {
    $('.nubbin').not(".wall").toggleClass('hospital')
  }
  if (this.retailLocation == TAG_FOR_NOSTRO_CAFE || this.retailLocation == TAG_FOR_COFFEECRUSH || this.retailLocation == TAG_FOR_BLR_BIRYANI_BHAWAN) {
    $('.nubbin').not(".wall").toggleClass('cafe')
  }
}

Mazing.prototype.enableSpeech = function() {
  this.utter = new SpeechSynthesisUtterance()
  this.setMessage(this.mazeMessage.innerText);
};

Mazing.prototype.setMessage = function(text) {
  this.mazeMessage.innerHTML = text;
  this.mazeScore.innerHTML = this.heroScore;
  if(this.utter) {
    this.utter.text = text;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(this.utter);
  }
};

Mazing.prototype.heroTakeTreasure = function() {
  this.maze[this.heroPos].classList.remove("nubbin");
  this.heroScore += 10;
  this.setMessage("yay, keep going!");
};

Mazing.prototype.heroTakeKey = function() {
  this.maze[this.heroPos].classList.remove("key");
  this.heroHasKey = true;
  this.heroScore += 20;
  this.mazeScore.classList.add("has-key");
  this.setMessage("you have the key!");
};

Mazing.prototype.gameOver = function(text) {
  // de-activate control keys
  document.removeEventListener("keydown", this.keyPressHandler, false);
  this.setMessage(text);
  this.mazeContainer.classList.add("finished");
  // this.setTrigger();
  this.showAd();
};

Mazing.prototype.heroWins = function() {
  this.mazeScore.classList.remove("has-key");
  this.maze[this.heroPos].classList.remove("door");
  this.heroScore += 50;
  this.winFlag = true;
  this.gameOver("You escaped the Maze!");
};

Mazing.prototype.tryMoveHero = function(pos) {

  if(this.initialHeroPos == this.heroPos && this.initialHeroScore == this.heroScore) {
    gtag("event", "game_start")
  }

  if("object" !== typeof this.maze[pos]) {
    return;
  }

  var nextStep = this.maze[pos].className;

  // before moving
  if(nextStep.match(/sentinel/)) {
    this.heroScore = Math.max(this.heroScore - 5, 0);
    if(!this.childMode && this.heroScore <= 0) {
      this.winFlag = false;
      this.gameOver("Sorry, you didn't make it");
    } else {
      this.setMessage("ow, that hurt!");
    }
    return;
  }
  if(nextStep.match(/wall/)) {
    return;
  }
  if(nextStep.match(/exit/)) {
    if(this.heroHasKey) {
      this.heroWins();
    } else {
      this.setMessage("you need a key to unlock the door");
      return;
    }
  }

  // move hero one step
  this.maze[this.heroPos].classList.remove("hero");
  this.maze[pos].classList.add("hero");
  this.heroPos = pos;

  // after moving
  if(nextStep.match(/nubbin/)) {
    this.heroTakeTreasure();
    return;
  }
  if(nextStep.match(/key/)) {
    this.heroTakeKey();
    return;
  }
  if(nextStep.match(/exit/)) {
    return;
  }
  if(this.heroScore >= 1) {
    if(!this.childMode) {
      this.heroScore--;
    }
    if(!this.childMode && (this.heroScore <= 0)) {
      this.winFlag = false;
      this.gameOver("Sorry, you didn't make it");
    } else {
      this.setMessage("...");
    }
  }
};

Mazing.prototype.mazeKeyPressHandler = function(e) {
  var tryPos = new Position(this.heroPos.x, this.heroPos.y);
  switch(e.keyCode)
  {
    case 37: // left
      this.mazeContainer.classList.remove("face-right");
      tryPos.y--;
      break;

    case 38: // up
      tryPos.x--;
      break;

    case 39: // right
      this.mazeContainer.classList.add("face-right");
      tryPos.y++;
      break;

    case 40: // down
      tryPos.x++;
      break;

    default:
      return;

  }
  this.tryMoveHero(tryPos);
  e.preventDefault();
};

Mazing.prototype.moveHeroHelper = function (dir) {
  var tryPos = new Position(this.heroPos.x, this.heroPos.y);
  switch(dir) {
    case "up":
      tryPos.x--;
      break;
    case "down":
      tryPos.x++;
      break;
    case "left":
      this.mazeContainer.classList.remove("face-right");
      tryPos.y--;
      break;
    case "right":
      this.mazeContainer.classList.add("face-right");
      tryPos.y++;
      break;
  }
  this.tryMoveHero(tryPos);
};

Mazing.prototype.swipeHandler = function() {
  this.hammer.on("swipeup", function () {
    MazeGame.moveHeroHelper("up");
  });
  this.hammer.on("swipedown", function () {
    MazeGame.moveHeroHelper("down");
  });
  this.hammer.on("swipeleft", function () {
    MazeGame.moveHeroHelper("left");
  });
  this.hammer.on("swiperight", function () {
    MazeGame.moveHeroHelper("right");
  });
};

Mazing.prototype.setChildMode = function() {
  this.childMode = true;
  this.heroScore = 0;
  this.setMessage("collect all the items");
};

Mazing.prototype.share = function () {
  if (navigator.share) {
    navigator.share({
      title: 'Chill Panda',
      text: 'Haha! Play and beat me if you can',
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
};

Mazing.prototype.resetGame = function () {
  window.location = window.location.pathname;
};

Mazing.prototype.showAd = function () {
  var number = 1 + Math.floor(Math.random() * TOTAL_ADS);
  var urlPath = AD_ASSETS_PATH + '' + number + AD_FORMAT;
  $('#maze_container').addClass('d-none');
  $('#instructions').addClass('d-none');
  $('body').addClass('ad-img');
  var closeDiv = document.createElement('div');
  closeDiv.className = 'close-div';
  closeDiv.innerHTML = '<i class="fa fa-times fa-2x" aria-hidden="true"></i>';
  closeDiv.addEventListener('click', (e) => { this.showEndScreen(); });
  $('<img/>').attr('src', urlPath).on('load', function() {
    $(this).remove();
    $('body').css('background-image', 'url("' + urlPath + '")');
    $(".loader").fadeOut("1000");
    $('body').append(closeDiv);
    setTimeout(function() {
      closeDiv.classList.add('is-shown');
    }, 3000);
  });
};

Mazing.prototype.removeAd = function () {
  $('body').removeClass('ad-img');
  $('body').css('background-image', '');
  $('.close-div').remove();
  $('#instructions').removeClass('d-none');
  $('#maze_container').removeClass('d-none');
};

Mazing.prototype.showEndScreen = function () {
  this.removeAd();
  Swal.fire({
    allowEscapeKey: false,
    allowOutsideClick: false,
    title: this.winFlag ? 'Congratulations!' : 'Game over!',
    html: '<span>' + this.mazeMessage.innerHTML + '</span>',
    icon: this.winFlag ? 'success' : 'error',
    backdrop: 'white',
    showDenyButton: true,
    showCancelButton: true,
    confirmButtonText: '<i class="fa fa-repeat fa-2x" aria-hidden="true"></i>',
    denyButtonText: '<i class="fa fa-random fa-2x" aria-hidden="true"></i>',
    cancelButtonText: '<i class="fa fa-times fa-2x" aria-hidden="true"></i>',
  }).then((result) => {
    /* Read more about isConfirmed, isDenied below */
    if (result.isConfirmed) {
        this.resetGame();
    } else if (result.isDenied) {
        this.loadNewGame();
    } else if (result.dismiss === Swal.DismissReason.cancel) {
        this.openNPS();
    }
  });
  var shareDiv = document.createElement('div');
  shareDiv.className = 'share-div';
  shareDiv.innerHTML = '<i class="fa fa-share fa-2x" aria-hidden="true"></i>';
  shareDiv.addEventListener('click', this.share);
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
  localStorage.setItem('lastGame', 10);
};

Mazing.prototype.loadNewGame = function() {
  window.location.href = window.location.origin + '/' + GAME_MAP[getRandomNumber()];
};

Mazing.prototype.openNPS = function() {
  window.location.href = window.location.origin + '/rating.html';
}

gaSetUserId();
gaSetUserProperties();