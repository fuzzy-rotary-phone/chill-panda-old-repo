import { score } from './create-score.js'
export let global = {}

let currentScore = 0
let isOverDraw = false

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
      },

      draw() {
        main.background.draw()
        global.flappyBird.draw()

        global.floor.draw()
        main.getReady.draw()
      },

      click() {
        main.changeScreen(main.display.game)
        
        gtag("event", "game_start")
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
      // draw() {
      //   main.background.draw()
      //   global.floor.draw()
      //   main.gameOver.draw()

      //   global.storagedScore.draw()
      //   global.getScore.draw()
      //   main.addMedal.draw()

      //   // main.display.over.click()
      // },
      // click() {
      draw() {
        if (!isOverDraw) {
          $('.loader').css('display','');
          currentScore = score
          var number = 1 + Math.floor(Math.random() * TOTAL_ADS);
          var urlPath = AD_ASSETS_PATH + '' + number + AD_FORMAT;
          $('canvas').addClass('d-none');
          $('#instructions').addClass('d-none');
          $('body').addClass('ad-img');
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
              html: "<p>You've earned <strong>" + currentScore + "</strong> points</p>",
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
                currentScore = 0
                isOverDraw = false
                main.changeScreen(main.display.start)
              } else if (result.isDenied) {
                window.location.href = window.location.origin + '/' + GAME_MAP[getRandomNumber()];
              } else if (result.dismiss === Swal.DismissReason.cancel) {
                window.location.href = window.location.origin + '/rating.html';
              }
            });
            var shareDiv = document.createElement('div');
            shareDiv.className = 'share-div';
            shareDiv.innerHTML = '<i class="fa fa-share fa-2x" aria-hidden="true"></i>';
            shareDiv.addEventListener('click', () => {
              if (navigator.share) {
                navigator.share({
                  title: 'Chill Panda',
                  text: 'Haha! I scored ' + currentScore + '. Play and beat me if you can',
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
            logoDiv.innerHTML = '<a href='+ WEBSITE_LINK +' target="_blank">' 
            + '<img src=' + LOGO_PATH + '>' + '</a>';
            $('.swal2-container').append(logoDiv);
            localStorage.setItem('lastGame', 3);
          });
          $('<img/>').attr('src', urlPath).on('load', function() {
            $(this).remove();
            $('body').css('background-image', 'url("' + urlPath + '")');
            $(".loader").fadeOut("1000");
            $('body').append(closeDiv);
            setTimeout(function() {
              closeDiv.classList.add('is-shown');
            }, 3000);
          });

          isOverDraw = true

          global.storagedScore.save()

          global.score.over()

          main.changeScreen(main.display.start)
        }
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
