((document) => {
  // parts of the game board
  let moves = document.querySelector('.moves')
  // ?
  let board = document.querySelector('#board')
  let colors = document.querySelector('#colors')
  let gameover = document.querySelector('#game-over')
  let triggertext = document.querySelector('#trigger-text')

  // control variables 
  let colorArray = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']
  let allContent = $.getJSON('../../resources/content.json')

  let running = false

  let cell = '-x'
  let skill = 5
  let tally = 0
  let cap = 35
  let color

  const BLURBS = {
    'win': {
      header: 'You Win',
      blurb: 'You are a winner. Remember this moment.\n Carry it with you, forever.',
      type: 'success'
    },
    'lose': {
      header: 'Computer Wins',
      blurb: 'Try again when you\'re done wiping your tears of shame.',
      type: 'error'
    }
  };

  //  game play methods
  // ----------------------------
  let shuffle = (collection) => {
    for (let i = collection.length; i; i--) {
      let j = Math.floor(Math.random() * i);
      [collection[i - 1], collection[j]] = [collection[j], collection[i - 1]]
    }
    return collection
  }

  let setColors = (collection, n) => {
    return n < 10 ? shuffle(collection).slice(0, n) : collection
  }

  let setTrigger = () => {
    let total = allContent.responseJSON["content"].length;
    let number = Math.floor(Math.random() * total);
    triggertext.innerHTML = allContent.responseJSON["content"][number]["text"];
    triggertext.classList.remove("d-none");
    triggertext.style.removeProperty("border");
  }

  let checkWin = (moves) => {
    let n = 0
    let msg = ''
    let winFlag
    if (moves <= cap) {
      if (board.childNodes[99].className.indexOf(cell) > -1) {
        for (var i = 0; i < 100; i++) {
          if (board.childNodes[i].className.indexOf(cell) > -1) {
            n++
          }
        }
      }

      if (n === 100) {
        msg = '<span class="new-game">You Win!</span>'
        running = false
        winFlag = 'win'
      } else if (n < 100 && moves >= cap) {
        msg = '<span class="new-game">Oops! Try Again...</span>'
        running = false
        winFlag = 'lose'
      }
    }
    if(!running) {
      // setTrigger()
      gameover.innerHTML = msg
      setTimeout(function() { showAd(winFlag) }, 1000);
    }
  }

  let checkColor = (color) => {
    let tiles = board.childNodes
    for(var x = 0; x < 100; x++) {
      if(tiles[x].className.indexOf(cell) > -1) {
        tiles[x].className = color + cell
        if (x + 1 < 100 && tiles[x + 1].className === color) {
          tiles[x + 1].className += cell
        }
        if (x + 10 < 100 && tiles[x + 10].className === color) {
          tiles[x + 10].className += cell
        }
        if (x - 1 >= 0 && x % 10 > 0 && tiles[x - 1].className === color) {
          tiles[x - 1].className += cell
        }
        if (x - 10 >= 0 && x % 10 > 0 && tiles[x - 10].className === color) {
          tiles[x - 10].className += cell
        }
      }
    }
  }

  let builder = (container, element, collection, count, randomize) => {
    container.innerHTML = ''
    count = count || collection.length
    randomize = randomize || false
    for (let i = 0; i < count; i++) {
      let child = document.createElement(element)
      child.className = randomize ? collection[Math.floor((Math.random() * collection.length))] : collection[i]
      container.appendChild(child)
    }
  }

  let resetTrigger = () => {
    triggertext.classList.add("d-none");
    triggertext.innerHTML = '';
    triggertext.style.setProperty('border','none');    
  }

  let newGame = () => {
    let options = setColors(colorArray.slice(), skill)
    tally = 0
    moves.innerText = tally
    //?
    gameover.innerHTML = ''
    running = true
    builder(colors, 'chip', options)
    builder(board, 'tile', options, 100, true)
    color = board.childNodes[0].className
    board.className = ''
    board.childNodes[0].className = color + cell
    checkColor(color)
    // resetTrigger()
  }

  let play = (chip) => {
    if (running && color !== chip){
      color = chip
      if(board.className !== 'started') {
        board.className = 'started'
      }
      tally++
      moves.innerText = tally;
      //?
      checkColor(chip)
      checkWin(tally)
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    newGame()
  }, false)

  document.addEventListener('click', (event) => {
    let css = Array.from(event.target.classList)
    if(event.target.tagName === 'CHIP') {
      play(event.target.className)
    }
    else if(css.includes('new-game')) {
      newGame()
    }
  })

  function getContent() {
    let total = allContent.responseJSON["content"].length;
    let number = Math.floor(Math.random() * total);
    return allContent.responseJSON["content"][number]["text"];
  }

  function share() {
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
  }

  function showAd(key) {
    $('.loader').css('display','');
    var adPath = allContent.responseJSON["adPath"];
    var total = allContent.responseJSON["totalAds"];
    var number = 1 + Math.floor(Math.random() * total);
    var urlPath = adPath + '' + number + '.png';
    $('main').addClass('d-none');
    $('body').addClass('ad-img');
    $('<img/>').attr('src', urlPath).on('load', function() {
      $(this).remove();
      $('body').css('background-image', 'url("' + urlPath + '")');
      $(".loader").fadeOut("1000");
    });
    var closeDiv = document.createElement('div');
    closeDiv.className = 'close-div';
    closeDiv.innerHTML = '<i class="fa fa-times fa-2x" aria-hidden="true"></i>';
    closeDiv.addEventListener('click', (e) => { showEndScreen(key); });
    $('body').append(closeDiv);
    setTimeout(function() {
      closeDiv.classList.add('is-shown');
    }, 3000);
  }

  function removeAd() {
    $('body').removeClass('ad-img');
    $('body').css('background-image', '');
    $('.close-div').remove();
    $('main').removeClass('d-none');
  }

  function showEndScreen(key) {
    removeAd();
    Swal.fire({
      allowEscapeKey: false,
      allowOutsideClick: false,
      title: BLURBS[key].header + '!',
      html: '<span>' + BLURBS[key].blurb + '</span>',
      icon: BLURBS[key].type,
      backdrop: 'white',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: '<i class="fa fa-repeat fa-2x" aria-hidden="true"></i>',
      denyButtonText: '<i class="fa fa-random fa-2x" aria-hidden="true"></i>',
      cancelButtonText: '<i class="fa fa-times fa-2x" aria-hidden="true"></i>',
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        newGame();
      } else if (result.isDenied) {
        loadNewGame();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        loadNewGame();
      }
    });
    // var triggerDiv = '<div class="trigger-div">' + getContent() + '</div>';
    // $('.swal2-container').append(triggerDiv);
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
    logoDiv.innerHTML = '<a href='+ allContent.responseJSON['website'] +' target="_blank">' 
    + '<img src=' + allContent.responseJSON['logo'] + '>' + '</a>';
    $('.swal2-container').append(logoDiv);
    localStorage.setItem('lastGame', 4);
  }

  function loadNewGame() {
    window.location.href = window.location.origin + '/' + gameMap[getRandomNumber()];
  }
})(document)

gaSetUserId();
gaSetUserProperties();