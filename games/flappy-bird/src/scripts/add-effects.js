/**
 * Create a Audio and Image effects
 * @param {object} main - Main object
 */

export default function (main) {
  main.sprites = new Image()
  main.sprites.src = './public/sprites.png'

  main.hitAudio = new Audio('./public/hitsound.mp3')
}
