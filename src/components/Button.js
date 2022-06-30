import { ctx } from '../constants';

export default class Button {
    constructor(x, y, width, height, backgroundColor, text) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.text = text;
        this.backgroundColor = backgroundColor;
    }

    draw() {
        // ctx.textAlign = 'start';
        // ctx.baseLine = 'top';
        // ctx.font = '20px Arial';
        // ctx.fillStyle = 'white';
        // ctx.fillText(`Score: ${this.score}`, this.x, this.y);

        ctx.beginPath();
        ctx.rect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        ctx.fillStyle = this.backgroundColor;
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
        ctx.stroke();

        // button text
        ctx.font = '20px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.baseLine = 'middle';
        ctx.fillText(this.text, this.x, this.y);
    }

    update() {
        this.draw();
    }
}
