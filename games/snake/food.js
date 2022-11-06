class Food {
	constructor(rangex, rangey, color, number) {
		this.x = floor(random(rangex));
		this.y = floor(random(rangey));
		this.size = 1;
		this.c = color;
		this.img = loadImage(IN_GAME_ASSETS_PATH + 'snake/' + number + '.png');
		// this.img = loadImage('\u1F354');
	}

	show() {
		var edge_indent = -0.01; //same as snake.js
		// fill(this.c);
		// fill('#ffffff');
		// clear();
		// rect(this.x + edge_indent / 2, this.y + edge_indent / 2, this.size - edge_indent, this.size - edge_indent);
		image(this.img, this.x + edge_indent / 2, this.y + edge_indent / 2, this.size - edge_indent, this.size - edge_indent);
		// this.style('content', "\u1F354");
	}
}
