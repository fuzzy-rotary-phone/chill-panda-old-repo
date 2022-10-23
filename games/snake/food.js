class Food {
	constructor(rangex, rangey, color, number) {
		this.x = floor(random(rangex));
		this.y = floor(random(rangey));
		this.size = 1;
		this.c = color;
		this.img = loadImage('../../assets/ingame/' + number + '.png');
	}

	show() {
		var edge_indent = -0.01; //same as snake.js
		// fill(this.c);
		fill('#ffffff');
		rect(this.x + edge_indent / 2, this.y + edge_indent / 2, this.size - edge_indent, this.size - edge_indent);
		image(this.img, this.x + edge_indent / 2, this.y + edge_indent / 2, this.size - edge_indent, this.size - edge_indent);
	}
}
