loadInstanceVariables(CONTENT_PATH, CONFIG_PATH)

$(window).on('load', function() {
  $(".loader").fadeOut("1000");
});

document.getElementById('greeting').innerText = 'Welcome to ' + RETAIL_NAME + '!'
document.querySelector('h1').insertAdjacentHTML('afterend', '<img src="' + LOGO_PATH + '.jpg" alt="image">')

// document.getElementById('button1').addEventListener('click', function() {
//   alert('You clicked on Button 1!');
// });
document.getElementById('button2').addEventListener('click', function() {
  // alert('You clicked on Button 2!');
  loadGame();
});