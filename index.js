var gameMap = {
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