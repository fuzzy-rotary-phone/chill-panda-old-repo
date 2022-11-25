loadInstanceVariables('../../' + CONTENT_PATH, '../../' + CONFIG_PATH, showAd)

// let promise = new Promise(function(resolve, reject) {
//     loadInstanceVariables('../../' + CONTENT_PATH, '../../' + CONFIG_PATH)
//     if (INSTANCE_JSON) {
//         resolve()
//     } else {
//         reject()
//     }
// })

// promise.then(function () {
//     showAd(INSTANCE_JSON, CONFIG_JSON)
// }, function () {
//     loadJSONsAndShowAd()
// })

function loadJSONsAndShowAd() {
    $.getJSON('../../resources/content.json', allretailcontent => {
        $.getJSON('../../resources/config.json', config => {
            var allRetailLocationsContent = allretailcontent;
            var allcontent;
            var matches = $.map(allRetailLocationsContent, function(entry) {
                    var match = entry.urlTag == localStorage['retailLocation'];
                    return match ? entry : null;
                });
            if (matches.length) {
                allcontent = matches[0];
            } else {
                allcontent = allRetailLocationsContent[0];
            }
            showAd(allcontent, config);
        });
    });
}

function share(score) {
    if (navigator.share) {
        navigator.share({
            title: 'Chill Panda',
            text: 'Haha! I completed in ' + score + ' moves. Play and beat me if you can',
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

function resetGame() {
    // body...
    location.href = 'index.html';
    localStorage['memoryGameMoves'] = 0
}

// function showAd(allcontent, config) {
function showAd() {
    $('.loader').css('display','');
    var number = 1 + Math.floor(Math.random() * TOTAL_ADS);
    var urlPath = AD_ASSETS_PATH + '' + number + '.png';
    $('.main').addClass('d-none');
    $('body').addClass('ad-img');
    var closeDiv = document.createElement('div');
    closeDiv.className = 'close-div';
    closeDiv.innerHTML = '<i class="fa fa-times fa-2x" aria-hidden="true"></i>';
    // closeDiv.addEventListener('click', (e) => { showEndScreen(allcontent, config); });
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
  $('.main').removeClass('d-none');
}

// function showEndScreen(allcontent, config) {
function showEndScreen() {
    removeAd();
    var score = localStorage['memoryGameMoves'];
    Swal.fire({
        allowEscapeKey: false,
        allowOutsideClick: false,
        title: 'Congratulations!',
        html: '<span>You won with </span><strong>' + score + '</strong> moves<br/>',
        icon: 'success',
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
            loadNewGame();
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            openNPS();
        }
    });
    var shareDiv = document.createElement('div');
    shareDiv.className = 'share-div';
    shareDiv.innerHTML = '<i class="fa fa-share fa-2x" aria-hidden="true"></i>';
    shareDiv.addEventListener('click', function() {
        share(score)
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
    localStorage.setItem('lastGame', 7);
}

function loadNewGame() {
    window.location.href = window.location.origin + '/' + GAME_MAP[getRandomNumber()];
}

function openNPS() {
    window.location.href = window.location.origin + '/rating.html';
}