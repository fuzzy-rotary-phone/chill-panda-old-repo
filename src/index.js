export const gameMap = {
	1: 'games/DuckHunt-JS/dist/index.html',
	2: 'games/align-four/index.html',
	3: 'games/flappy-bird/index.html',
	4: 'games/color-match-game-broken/index.html',
	5: 'games/JoyRunner/runner.html',
	6: 'games/snake/index.html',
	7: 'games/sweet-memory-game/index.html',
	8: 'games/tower-blocks/index.html',
	9: 'games/Elimination-games-XiaoXiaoLe/index.html',
	10: 'games/Maze2/maze.html'
};

function getRandomNumber() {
	var total = 10;
	var number = 1 + Math.floor(Math.random() * total);
	if (!localStorage['lastGame']) {
		return number;
	}
	while (number == localStorage['lastGame']) {
		number = 1 + Math.floor(Math.random() * total);
	}
	return number;
}

function loadGame() {
	var number = getRandomNumber();
	$('#myiframe').attr('src', gameMap[number]);
}

$(document).ready(function() {
	loadGame();
});

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBJQO8HWWCV6a-K33knwHYnIcZwm5-4G9w",
  authDomain: "chill-panda-c1184.firebaseapp.com",
  projectId: "chill-panda-c1184",
  storageBucket: "chill-panda-c1184.appspot.com",
  messagingSenderId: "97999123599",
  appId: "1:97999123599:web:c214990d78ab04860b6cfa",
  measurementId: "G-QNEMSD28TV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);