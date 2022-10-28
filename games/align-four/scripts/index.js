// constants
const WEB_WORKER_URL = 'scripts/worker.js';
const CONTENT_URL = '../../resources/content.json';
const BLURBS = {
  'start': {
    header: 'Get Ready',
    blurb: 'Select your difficulty and start the game.'
  },
  'p1-turn': {
    header: 'Your Turn',
    blurb: 'Click on the board to drop your chip.'
  },
  'p2-turn': {
    header: 'Computer\'s Turn',
    blurb: 'The computer is trying to find the best way to make you lose.'
  },
  'p1-win': {
    header: 'You Win',
    blurb: 'You are a winner. Remember this moment. Carry it with you, forever.',
    type: 'success'
  },
  'p2-win': {
    header: 'Computer Wins',
    blurb: 'Try again when you\'re done wiping your tears of shame.',
    type: 'error'
  },
  'tie': {
    header: 'Tie',
    blurb: 'Everyone\'s a winner! Or loser. Depends on how you look at it.'
  }
};
const OUTLOOKS = {
  'win-imminent': 'Uh oh, computer is feeling saucy!',
  'loss-imminent': 'Computer is unsure. Now\'s your chance!'
};
const allContent = $.getJSON(CONTENT_URL);

// global variables
var worker;
var currentGameState;

// document ready
$(function() {
  $('.start button').on('click', startGame);
  setBlurb('start');
  setOutlook();
  
  // create worker
  worker = new Worker(WEB_WORKER_URL);
  worker.addEventListener('message', function(e) {
    switch(e.data.messageType) {
      case 'reset-done':
        startHumanTurn();
        break;
      case 'human-move-done':
        endHumanTurn(e.data.coords, e.data.isWin, e.data.winningChips, e.data.isBoardFull);
        break;
      case 'progress':
        updateComputerTurn(e.data.col);
        break;
      case 'computer-move-done':
        endComputerTurn(e.data.coords, e.data.isWin, e.data.winningChips, e.data.isBoardFull,
          e.data.isWinImminent, e.data.isLossImminent);
        break;
    }
  }, false);
});

function setBlurb(key) {
  $('.info h2').text(BLURBS[key].header);
  $('.info .blurb').text(BLURBS[key].blurb);
}

function setOutlook(key) {
  var $outlook = $('.info .outlook');
  if(key) {
    $outlook
      .text(OUTLOOKS[key])
      .show();
  } else {
    $outlook.hide();
  }
}

function resetTrigger() {
  $('#trigger-text').empty();
  $('#trigger-div').addClass("d-none");
}

function startGame() {
  $('.dif').addClass('freeze');
  $('.dif input').prop('disabled', true);
  $('.lit-cells, .chips').empty();
  resetTrigger();

  worker.postMessage({
    messageType: 'reset',
  });
}

function resetGame() {
  $('.lit-cells, .chips').empty();
  setBlurb('start');
  setOutlook();
}

function startHumanTurn() {
  setBlurb('p1-turn');
  $('.click-columns div').addClass('hover');
  
  // if mouse is already over a column, show cursor chip there
  var col = $('.click-columns div:hover').index();
  if(col !== -1) {
    createCursorChip(1, col);
  }
  
  $('.click-columns')
    .on('mouseenter', function() {
      var col = $('.click-columns div:hover').index();
      createCursorChip(1, col);
    })
    .on('mouseleave', function() {
      destroyCursorChip();
    });
  
  $('.click-columns div')
    .on('mouseenter', function() {
      var col = $(this).index();
      moveCursorChip(col);
    })
    .on('click', function() {
      $('.click-columns, .click-columns div').off();
      
      var col = $(this).index();
      worker.postMessage({
        messageType: 'human-move',
        col: col
      });
    });  
}

function endHumanTurn(coords, isWin, winningChips, isBoardFull) {
  $('.click-columns div').removeClass('hover');
  if(!coords) {
    // column was full, human goes again
    startHumanTurn();    
  } else {
    dropCursorChip(coords.row, function() {
      if(isWin) {
        endGame('p1-win', winningChips);
      } else if(isBoardFull) {
        endGame('tie');
      } else {
        // pass turn to computer
        startComputerTurn();
      }
    });
  }
}

function startComputerTurn() {
  setBlurb('p2-turn');
  
  // computer's cursor chip starts far left and moves right as it thinks
  createCursorChip(2, 0);
  
  var maxDepth = parseInt($('input[name=dif-options]:checked').val(), 10) + 1;
  worker.postMessage({
    messageType: 'computer-move',
    maxDepth: maxDepth
  });
}

function updateComputerTurn(col) {
  moveCursorChip(col);
}

function endComputerTurn(coords, isWin, winningChips, isBoardFull, isWinImminent, isLossImminent) {
  moveCursorChip(coords.col, function() {
    dropCursorChip(coords.row, function() {
      if (isWin) {
        endGame('p2-win', winningChips);
      } else if (isBoardFull) {
        endGame('tie');
      } else {
        if(isWinImminent) {
          setOutlook('win-imminent');
        } else if (isLossImminent) {
          setOutlook('loss-imminent');
        } else {
          setOutlook();
        }
        
        // pass turn to human
        startHumanTurn();
      }
    });
  });
}

function setTrigger() {
  var total = allContent.responseJSON["content"].length;
  var number = Math.floor(Math.random() * total);
  $('#trigger-text').text(allContent.responseJSON["content"][number]["text"]);
  $('#trigger-div').removeClass("d-none");
}

function endGame(blurbKey, winningChips) {
  $('.dif').removeClass('freeze');
  $('.dif input').prop('disabled', false);
  setBlurb(blurbKey);
  setOutlook();
  // setTrigger();
  
  if(winningChips) {
    // not a tie, highlight the chips in the winning run
    for(var i = 0; i < winningChips.length; i++) {
      createLitCell(winningChips[i].col, winningChips[i].row);
    }
  }
  setTimeout(function() { showAd(blurbKey) }, 1000);
}

function createLitCell(col, row) {
  $('<div>')
  .css({
    'left': indexToPixels(col),
    'bottom': indexToPixels(row)
  })
  .appendTo('.lit-cells');
}

function createCursorChip(player, col) {
  var playerClass = 'p' + player;
  $('<div>', { 'class': 'cursor ' + playerClass })
    .css('left', indexToPixels(col))
    .appendTo('.chips');
  
  // also highlight column
  $('.lit-columns div').eq(col).addClass('lit');
}

function destroyCursorChip() {
  $('.chips .cursor').remove();
  $('.lit-columns .lit').removeClass('lit');
}

function moveCursorChip(col, callback) {
  $('.chips .cursor').css('left', indexToPixels(col));
  $('.lit-columns .lit').removeClass('lit');
  $('.lit-columns div').eq(col).addClass('lit');
  
  // callback is only used when the computer is about to drop a chip
  // give it a slight delay for visual interest
  setTimeout(callback, 300);
}

function dropCursorChip(row, callback) {
  // speed of animation depends on how far the chip has to drop
  var ms = (7 - row) * 40;
  var duration = (ms / 1000) + 's';
  
  $('.chips .cursor')
    .removeClass('cursor')
    .css({
      'bottom': indexToPixels(row),
      'transition-duration': duration,
      'animation-delay': duration
    })
    .addClass('dropped');
  
  $('.lit-columns .lit').removeClass('lit');
  setTimeout(callback, ms);
}

function indexToPixels(index) {
  return (index * 52 + 1) + 'px';
}

function getContent() {
  var total = allContent.responseJSON["content"].length;
  var number = Math.floor(Math.random() * total);
  return allContent.responseJSON["content"][number]["text"];
}

function share(data) {
  if (navigator.share) {
    // if (navigator.canShare({ files: [data] })) {
      navigator.share({
        files: [ data ],
        title: 'Chill Panda',
        text: 'Haha! Play and beat me if you can',
        url: window.location.href
      }).then(() => {
        console.log('Thanks for sharing!');
      }).catch(err => {
        console.log('Error while using Web share API:');
        console.log(err);
      });
    // } else {
    //   Swal.fire("Your system doesn't support sharing these files.");
    //   reload();
    // }
  } else {
    Swal.fire("Browser doesn't support this API !");
    reload();
  }
}

function showAd(key) {
  var adPath = allContent.responseJSON["adPath"];
  var total = allContent.responseJSON["totalAds"];
  var number = 1 + Math.floor(Math.random() * total);
  $('.wrapper').addClass('d-none');
  $('body').addClass('ad-img');
  $('body').css('background-image', 'url("' + adPath + '' + number + '.png")');
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
  $('.wrapper').removeClass('d-none');
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
        resetGame();
    } else if (result.isDenied) {
        reload();
    } else if (result.dismiss === Swal.DismissReason.cancel) {
        reload();
    }
  });
  // var triggerDiv = '<div class="trigger-div">' + getContent() + '</div>';
  // $('.swal2-container').append(triggerDiv);
  var shareDiv = document.createElement('div');
  shareDiv.className = 'share-div';
  shareDiv.innerHTML = '<i class="fa fa-share fa-2x" aria-hidden="true"></i>';
  shareDiv.addEventListener('click', (e) => { takeScreenshot(); });
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
}

function takeScreenshot() {
  let div = $('.swal2-container')[0];
  html2canvas(div).then(function(canvas) {
    canvas.toBlob((blob) => {
      var file = new File([blob], "image");
      share(file);
    });
  });
}

function reload() {
  window.location.href = 'https://chillpanda.in';
}