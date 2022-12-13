const KEYS = {
    LEFT: 37,
    RIGHT: 39,
    SPACE: 32
}

let game = {
    ctx: null,
    platform: null,
    ball: null,
    blocks: [],
    rows: 4,
    cols: 8,
    height: 360,
    width: 640,
    sprites: {
        background: null,
        ball: null,
        platform: null,
        block: null
    },
    init() {
        this.ctx = document.getElementById("mycanvas").getContext("2d");
        this.setEvents();
    },
    setEvents() {
        window.addEventListener("keydown", e => {
            if (e.keyCode === KEYS.SPACE) {
                this.platform.fire();
            } else if (e.keyCode === KEYS.LEFT || e.keyCode === KEYS.RIGHT) {
                this.platform.start(e.keyCode);
            }
        });
        window.addEventListener("keyup", e => {
            this.platform.stop();
        });
    },
    preload (callback) {
        let loaded = 0
        let required = Object.keys(this.sprites).length
        let onImageLoad = () => {
            ++loaded
            if (loaded >= required) {
                callback() //выполняется коллбек генерации
            }
        }
        for (const spritesKey in this.sprites) {
            this.sprites[spritesKey] = new Image()
            this.sprites[spritesKey].src = `img/${spritesKey}.png`
            this.sprites[spritesKey].addEventListener("load", onImageLoad); //загрузка динамического пути
        }
    },
    create() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.blocks.push({
                    width: 60,
                    height: 20,
                    x: (60 + 4) * col + 65, //отступы по 4 пикселя (+ 65 это смещение всей конструкции вправо)
                    y: (20 + 4) * row + 20 //здесь +20 отступ сверху
                })
            }

        }
    },

    update() {
        this.platform.move()
        this.ball.move()

        for (let block of this.blocks) {
            if(this.ball.collide(block)) {
                this.ball.bumpBlock(block)
                console.log('collide!')
            }
        }
    },
    run(){
        window.requestAnimationFrame(() => {
            this.update()
            this.render() //отрисовка запланированной анимации
            this.run() //рекурсивное объявление рендера чтобы программа бесконечно отрисовывала новый стейт
        });
    },

    render() {
        this.ctx.clearRect(0,0, 640, 360) //очистка поля
        //начальные координаты всех спрайтов
        this.ctx.drawImage(this.sprites.background, 0, 0)
        this.ctx.drawImage(this.sprites.ball, 0, 0, this.ball.width, this.ball.height, this.ball.x,this.ball.y, this.ball.width, this.ball.height)
        this.ctx.drawImage(this.sprites.platform, this.platform.x, this.platform.y)

        this.renderBlocks()
    },
    renderBlocks() {
        for(let block of this.blocks) {
            this.ctx.drawImage(this.sprites.block, block.x, block.y) // рендер блоков
        }
    },
    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    },
    start() {
        this.init()
        this.preload(()=> {
            this.create()
            this.run()
        })
    }
};

//свойства спрайтов

game.ball = {
    dy: 0,
    velocity: 3,
    x: 320,
    y: 280,
    width: 20,
    height: 20,
    start() {
        this.dy = -this.velocity
        this.dx = game.random(-this.velocity, this.velocity)
    },
    move() {
        if (this.dy) {
            this.y += this.dy
        }
        if (this.dx) {
            this.x += this.dx
        }
    },
    collide(element) {
        let x = this.x + this.dx;
        let y = this.y + this.dy;

        return x + this.width > element.x &&
            x < element.x + element.width &&
            y + this.height > element.y &&
            y < element.y + element.height;
    },
    bumpBlock(block) {
        this.dy = -this.dy
    }
};

game.platform = {
    velocity: 6,
    dx: 0,
    x: 280,
    y: 300,
    ball: game.ball,
    fire() {
        if (this.ball) {
            this.ball.start()
            this.ball = null
        }
    },
    start(direction) {
        if (direction === KEYS.LEFT) {
            this.dx = -this.velocity
        } else if (direction === KEYS.RIGHT) {
            this.dx = this.velocity
        }
    },
    stop() {
        this.dx = 0
    },
    move() {
        if (this.dx) {
            this.x += this.dx
            if (this.ball) {
                this.ball.x += this.dx
            }
        }
    }
};


window.addEventListener('load', () => {
    game.start()
})