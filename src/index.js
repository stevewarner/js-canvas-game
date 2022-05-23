import Phaser from 'phaser';
import star from './assets/star.png';
import playerImg from './assets/player.png';

let player;
let cursors;
let circle;

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: 0xffffff,
    scene: {
        preload: preload,
        create: create,
        update: update,
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false,
        },
    },
};

export const game = new Phaser.Game(config);

// load assets
function preload() {
    this.load.image('star', star);
    this.load.spritesheet('player', playerImg, {
        frameWidth: 32,
        frameHeight: 48,
    });
}

// create scene
function create() {
    circle = this.add.circle(200, 200, 80, 0x6666ff);
    player = this.physics.add.sprite(380, 500, 'player');
    player.setCollideWorldBounds(true);

    this.physics.add.collider(player, circle);

    cursors = this.input.keyboard.createCursorKeys();
    // overriding arrow controls to WASD
    cursors = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D,
    });

    this.anims.create({
        key: 'still',
        frames: [{ key: 'player', frame: 4 }],
        frameRate: 20,
    });

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1,
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('player', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1,
    });

    let stars = this.physics.add.group();
    stars.create(22, Math.random() * 800, 'star');
    stars.create(122, Math.random() * 800, 'star');
    stars.create(222, Math.random() * 800, 'star');
    stars.create(322, Math.random() * 800, 'star');
    stars.create(422, Math.random() * 800, 'star');
    stars.create(522, Math.random() * 800, 'star');
    stars.create(622, Math.random() * 800, 'star');
    stars.create(722, Math.random() * 800, 'star');

    this.physics.add.collider(stars);

    let score = 0;
    let scoreText = this.add.text(16, 16, 'Stars: 0', {
        fontSize: '32px',
        fill: '#000',
    });

    // if player and star touch
    this.physics.add.overlap(
        player,
        stars,
        (player, star) => {
            // eslint-disable-next-line no-console
            console.log(player);
            star.disableBody(true, true);
            score += 1;
            scoreText.setText('Stars: ' + score);
        },
        null,
        this
    );
}

// anything that moves
function update() {
    if (cursors.left.isDown) {
        player.setVelocityX(-160);
        player.anims.play('left', true);
    } else if (cursors.right.isDown) {
        player.setVelocityX(160);
        player.anims.play('right', true);
    } else if (cursors.up.isDown) {
        player.setVelocityY(-160);
        player.anims.play('left', true);
    } else if (cursors.down.isDown) {
        player.setVelocityY(160);
        player.anims.play('right', true);
    } else {
        player.setVelocityX(0);
        player.setVelocityY(0);
        player.anims.play('still');
    }
    // this was if gravity is on, to control jump
    // if (cursors.up.isDown && player.body.touching.down) {
    //     player.setVelocityY(-330);
    // }
}
