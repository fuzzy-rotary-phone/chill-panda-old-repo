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
  //customize Maze based on industry
  this.customizeMaze()
};

Mazing.prototype.customizeMaze = function() {
  // icons = localStorage[LOCAL_STORAGE_KEY_FOR_MAZE_GAME_ASSETS].split(',')
  // industry = localStorage[LOCAL_STORAGE_KEY_FOR_RETAIL_LOCATION_INDUSTRY]
  // customStyle = document.createElement("style");
  // customStyle.type = 'text/css'
  // var newStyles = 
  // "#maze div div.nubbin" + "." + industry + "::after { " +
  //   "content: \\" + icons[0] + ";}\n" +
  // "#maze div.nubbin:nth-of-type(3n)" + "." + industry + "::after { " +
  //   "content: \\" + icons[1] + ";}\n" +
  // "#maze div.nubbin:nth-of-type(5n)" + "." + industry + "::after { " +
  //   "content: \\" + icons[2] + ";}\n" +
  // "#maze div.nubbin:nth-of-type(7n)" + "." + industry + "::after { " +
  //   "content: \\" + icons[3] + ";}\n" +
  // "#maze div.nubbin:nth-of-type(13n)" + "." + industry + "::after { " +
  //   "content: \\" + icons[4] + ";}\n"
  // customStyle.innerHTML = newStyles
  // document.head.appendChild(customStyle);
  // $('.nubbin').not(".wall").toggleClass(industry)

  // TODO: still using old way of editing CSS. Need to fix this by using config.json declared icons
  if (this.retailLocation == TAG_FOR_PARTHA_DENTAL) {
    $('.nubbin').not(".wall").toggleClass('hospital')
  }
  if (this.retailLocation == TAG_FOR_NOSTRO_CAFE || this.retailLocation == TAG_FOR_COFFEECRUSH || this.retailLocation == TAG_FOR_BLR_BIRYANI_BHAWAN) {
    $('.nubbin').not(".wall").toggleClass('cafe')
  }
  if (this.retailLocation == TAG_FOR_TONI_AND_GUY) {
    $('.nubbin').not(".wall").toggleClass('salon')
  }
  if (this.retailLocation == TAG_FOR_BLUSMART) {
    $('.nubbin').not(".wall").toggleClass('travel')
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

Mazing.prototype.showAd = function() {
  localStorage.setItem('lastGame', 10)
  sessionStorage.setItem('title', this.winFlag ? 'Congratulations!' : 'Game over!')
  sessionStorage.setItem('html', '<span>' + this.mazeMessage.innerHTML + '</span>')
  sessionStorage.setItem('share', 'Haha! Play and beat me if you can')
  window.open(window.location.origin + '/end_screen.html' + (URL_SEARCH_PARAM_FOR_RETAIL_LOCATION ? URL_SEARCH_PARAM_FOR_RETAIL_LOCATION : ''), '_self')    
}

gaSetUserId();
gaSetUserProperties();