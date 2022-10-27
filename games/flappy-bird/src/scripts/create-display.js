import { score } from './create-score.js'
export let global = {}

/**
 * When the game start, it will create a display object.
 * @param {object} main - Main object
 */
export default function (main) {
  main.display = {
    start: {
      started() {
        global.flappyBird = main.makeFlappyBird()
        global.floor = main.createFloor()
        global.pipes = main.makePipes()
        global.allContent = $.getJSON('../../resources/content.json')
      },

      draw() {
        main.background.draw()
        global.flappyBird.draw()

        global.floor.draw()
        main.getReady.draw()
      },

      click() {
        main.changeScreen(main.display.game)
      },

      update() {
        global.floor.update()
      },
    },

    game: {
      started() {
        global.score = main.createScore()
        global.storagedScore = main.storagedScore()
        global.getScore = main.getScore()
      },
      draw() {
        main.background.draw()
        global.pipes.draw()
        global.floor.draw()

        global.flappyBird.draw()
        global.score.draw()
      },

      click() {
        global.flappyBird.jump()
      },

      update() {
        global.flappyBird.update()
        global.floor.update()
        global.pipes.update()
        global.score.update()
      },
    },

    over: {
      draw() {
        main.background.draw()
        global.floor.draw()
        main.gameOver.draw()

        global.storagedScore.draw()
        global.getScore.draw()
        main.addMedal.draw()
      },
      click() {
        var adPath = global.allContent.responseJSON["adPath"];
        var total = global.allContent.responseJSON["totalAds"];
        var number = 1 + Math.floor(Math.random() * total);
        $('canvas').addClass('d-none');
        $('#instructions').addClass('d-none');
        $('body').addClass('ad-img');
        $('body').css('background-image', 'url("' + adPath + '' + number + '.png")');
        var closeDiv = document.createElement('div');
        closeDiv.className = 'close-div';
        closeDiv.innerHTML = '<i class="fa fa-times fa-2x" aria-hidden="true"></i>';
        closeDiv.addEventListener('click', (e) => {
          $('body').removeClass('ad-img');
          $('body').css('background-image', '');
          $('.close-div').remove();
          $('canvas').removeClass('d-none');
          $('#instructions').removeClass('d-none');
          Swal.fire({
            allowEscapeKey: false,
            allowOutsideClick: false,
            title: 'Game over!',
            html: `<p>You've earned <strong>${score}</strong> points</p>`,
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
              main.changeScreen(main.display.start)
            } else if (result.isDenied) {
              window.location.href = 'https://chillpanda.in';
            } else if (result.dismiss === Swal.DismissReason.cancel) {
              window.location.href = 'https://chillpanda.in';
            }
          });
          // var triggerDiv = '<div class="trigger-div">' + global.allContent.responseJSON["content"][number]["text"] + '</div>';
          // $('.swal2-container').append(triggerDiv);
          var shareDiv = document.createElement('div');
          shareDiv.className = 'share-div';
          shareDiv.innerHTML = '<i class="fa fa-share fa-2x" aria-hidden="true"></i>';
          shareDiv.addEventListener('click', () => {
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
          });
          $('.swal2-container').append(shareDiv);
          var buttonTextDiv = document.createElement('div');
          buttonTextDiv.className = 'button-div';
          buttonTextDiv.innerHTML = '<span>Repeat</span><span>Shuffle</span><span>Exit</span>';
          $('.swal2-container').append(buttonTextDiv);
          var logoDiv = document.createElement('div');
          logoDiv.className = 'logo-div';
          logoDiv.innerHTML = '<a href='+ global.allContent.responseJSON['website'] +' target="_blank">' 
          + '<img src=' + global.allContent.responseJSON['logo'] + '>' + '</a>';
          $('.swal2-container').append(logoDiv);
        });
        $('body').append(closeDiv);
        setTimeout(function() {
          closeDiv.classList.add('is-shown');
        }, 3000);

        global.storagedScore.save()

        global.score.over()

        main.changeScreen(main.display.start)
      },
      update() {
        main.gameOver.update()
        main.addMedal.draw()
        global.storagedScore.draw()
        global.getScore.draw()
      },
    },
  }
}
