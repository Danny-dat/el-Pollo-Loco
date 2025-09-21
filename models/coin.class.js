class Coin extends MovableObject {
    IMAGES_COIN = ['img/8_coin/coin_1.png',
        'img/8_coin/coin_2.png',
    ];
    
    offset = {
        top: 20,
        left: 20,
        right: 20,
        bottom: 20
    }

    constructor() {
        super().loadImage('img/8_coin/coin_1.png');
        this.x = Math.random() * -1400 + Math.random() * 1800;
        this.loadImages(this.IMAGES_COIN);
        this.y = 100 + Math.random() * 200; 
        this.height = 100;
        this.width = 100;
        this.animate();
    }

    /**
    * Animates the character by repeatedly playing the animation for collecting coins.
    */
    animate() {
        setInterval(() => {
            this.playAnimation(this.IMAGES_COIN);

        }, 500);
    }
}