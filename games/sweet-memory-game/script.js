var symbols = ['bicycle', 'bicycle', 'leaf', 'leaf', 'cube', 'cube', 'anchor', 'anchor', 'paper-plane-o', 'paper-plane-o', 'bolt', 'bolt', 'bomb', 'bomb', 'diamond', 'diamond'],
		opened = [],
		match = 0,
		moves = 0,
		$deck = $('.deck'),
		$scorePanel = $('#score-panel'),
		$moveNum = $scorePanel.find('.moves'),
		$ratingStars = $scorePanel.find('i'),
		$restart = $scorePanel.find('.restart'),
		delay = 800,
		gameCardsQTY = symbols.length / 2,
		rank3stars = gameCardsQTY + 2,
		rank2stars = gameCardsQTY + 6,
		rank1stars = gameCardsQTY + 10,
		allContent = $.getJSON('../../resources/content.json');

// Shuffle function From http://stackoverflow.com/a/2450976
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;
	
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

// Initial Game
function initGame() {
	var cards = shuffle(symbols);
  $deck.empty();
  match = 0;
  moves = 0;
  $moveNum.html(moves);
  $ratingStars.removeClass('fa-star-o').addClass('fa-star');
	for (var i = 0; i < cards.length; i++) {
		$deck.append($('<li class="card"><i class="fa fa-' + cards[i] + '"></i></li>'))
	}
};

// Set Rating and final Score
function setRating(moves) {
	var rating = 3;
	if (moves > rank3stars && moves < rank2stars) {
		$ratingStars.eq(2).removeClass('fa-star').addClass('fa-star-o');
		rating = 2;
	} else if (moves > rank2stars && moves < rank1stars) {
		$ratingStars.eq(1).removeClass('fa-star').addClass('fa-star-o');
		rating = 1;
	} else if (moves > rank1stars) {
		$ratingStars.eq(0).removeClass('fa-star').addClass('fa-star-o');
		rating = 0;
	}	
	return { score: rating };
};

// End Game
function endGame(moves, score) {
	var total = allContent.responseJSON["content"].length,
			number = Math.floor(Math.random() * total);
	$deck.empty();
	showEndScreen(moves);
	// swal({
	// 	allowEscapeKey: false,
	// 	allowOutsideClick: false,
	// 	title: 'Congratulations!',
	// 	html: 'You won with ' + moves + ' Moves' + 
	// 	'<br/><div>' + allContent.responseJSON["content"][number]["text"] + '</div>',
	// 	type: 'success',
	// 	showDenyButton: true,
 //    showCancelButton: true,
 //    confirmButtonText: '<i class="fa fa-repeat fa-2x" aria-hidden="true"></i>',
 //    denyButtonText: '<i class="fa fa-random fa-2x" aria-hidden="true"></i>',
 //    cancelButtonText: '<i class="fa fa-times fa-2x" aria-hidden="true"></i>',    
	// 	// confirmButtonColor: '#9BCB3C',
	// 	// confirmButtonText: 'Play again!'
	// }).then((result) => {
	// 	console.log(result);
 //    if (result.isConfirmed) {
 //        initGame();
 //    } else if (result.isDenied) {
 //        window.location.href = config['prod_url'];
 //    } else if (result.dismiss === Swal.DismissReason.cancel) {
 //        window.location.href = config['prod_url'];
 //    }		
	// 	// if (isConfirm) {
	// 	// 	initGame();
	// 	// }
	// })
}

// Restart Game
$restart.on('click', function() {
  swal({
    allowEscapeKey: false,
    allowOutsideClick: false,
    title: 'Are you sure?',
    text: "Your progress will be Lost!",
    type: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#9BCB3C',
    cancelButtonColor: '#EE0E51',
    confirmButtonText: 'Yes, Restart Game!'
  }).then(function(isConfirm) {
    if (isConfirm) {
      initGame();
    }
  })
});

// Card flip
$deck.on('click', '.card:not(".match, .open")', function() {
	if($('.show').length > 1) { return true; }
	
	var $this = $(this),
			card = $this.context.innerHTML;
  $this.addClass('open show');
	opened.push(card);

	// Compare with opened card
  if (opened.length > 1) {
    if (card === opened[0]) {
      $deck.find('.open').addClass('match animated infinite rubberBand');
      setTimeout(function() {
        $deck.find('.match').removeClass('open show animated infinite rubberBand');
      }, delay);
      match++;
    } else {
      $deck.find('.open').addClass('notmatch animated infinite wobble');
			setTimeout(function() {
				$deck.find('.open').removeClass('animated infinite wobble');
			}, delay / 1.5);
      setTimeout(function() {
        $deck.find('.open').removeClass('open show notmatch animated infinite wobble');
      }, delay);
    }
    opened = [];
		moves++;
		setRating(moves);
		$moveNum.html(moves);
  }
	
	// End Game if match all cards
	if (gameCardsQTY === match) {
		setRating(moves);
		var score = setRating(moves).score;
		setTimeout(function() {
			endGame(moves, score);
		}, 500);
  }
});

// initGame();

function get_content() {
	var total = allContent.responseJSON["content"].length,
			number = Math.floor(Math.random() * total);
	return allContent.responseJSON["content"][number]["text"];	
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
    swal("Browser doesn't support this API !");
  }	
}

showEndScreen();

function showEndScreen(moves) {
	var allContent = $.getJSON('../../resources/content.json');
  swal({
    allowEscapeKey: false,
    allowOutsideClick: false,
    title: 'Congratulations!',
    html: '<span>You won with <strong>' + moves + '</strong> Moves </span>',
    type: 'success',
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
        window.location.href = config['prod_url'];
    } else if (result.dismiss === Swal.DismissReason.cancel) {
        window.location.href = config['prod_url'];
    }
  });
  var triggerDiv = '<div class="trigger-div">' + 'get_content()' + '</div>';
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
  logoDiv.innerHTML = '<a href="http://coffeecrush.net/site/" target="_blank">' 
  + '<img src="../../assets/CoffeeCrush.jpg">' + '</a>';
  $('.swal2-container').append(logoDiv);
}