$.getJSON('../../resources/content.json', allcontent => {
    $.getJSON('../../resources/config.json', config => {
        showEndScreen(allcontent, config);
    });
});

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

function resetGame() {
    // body...
    location.href = 'index.html';
}

function showEndScreen(allcontent, config) {
    var score = localStorage['memoryGameMoves'];
    var total = allcontent["content"].length;
    var number = Math.floor(Math.random() * total);
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
            window.location.href = '';
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            window.location.href = '';
        }
    });
    var triggerDiv = '<div class="trigger-div">' + allcontent["content"][number]["text"] + '</div>';
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
    logoDiv.innerHTML = '<a href='+ allcontent['website'] +' target="_blank">' 
    + '<img src=' + allcontent['logo'] + '>' + '</a>';
    $('.swal2-container').append(logoDiv);
}