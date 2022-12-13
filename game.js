const KEYS = { //ключи для отслеживания клавиш
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
                    active: true,
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
        this.ball.collideWorldBounce()
        this.collideBlocks()
        this.collidePlatform()

    },
    collideBlocks() {
        for (let block of this.blocks) {
            if (block.active && this.ball.collide(block)) { //проверка блоко до которого не дотронулся мяч и столкновения мяча с блоком
                this.ball.bumpBlock(block) //функция отскока
            }

        }
    },
    collidePlatform(element) {
        if (this.ball.collide(this.platform)) {
            this.ball.bumpPlatform(this.platform) //создаёт отдачу от левого края - вправо, от правого - влево
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
            if (block.active) {
                this.ctx.drawImage(this.sprites.block, block.x, block.y) // рендер блоков
            }
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

        return x + this.width > element.x && //проверка столкновения с block
            x < element.x + element.width &&
            y + this.height > element.y &&
            y < element.y + element.height;
    },
    bumpBlock(block) {
        this.dy = -this.dy
        block.active = false
    },
    bumpPlatform(platform){
        if (this.dy > 0) {
            this.dy = -this.velocity //мяч отталкивается только наверх и никогда назад
            let touchX = this.x + this.width / 2 //делится на 2 чтобы было понятно в какую часть ударил мяч
            this.dx = this.velocity * platform.getTouchOffset(touchX)
        }
    },
    collideWorldBounce() {
        let x = this.x + this.dx;
        let y = this.y + this.dy;

        let ballLeft = x
        let ballRight = ballLeft + this.width
        let balltop = y
        let ballBottom = balltop + this.height

        let worldLeft = 0
        let worldRight = game.width
        let worldTop = 0
        let worldBottom = game.height

        if (ballLeft < worldLeft) {
            this.x = 0
            this.dx = this.velocity
        } else if (ballRight > worldRight) {
            this.x = worldRight - this.width
            this.dx = -this.velocity
        } else if (balltop < worldTop) {
            this.dy = this.velocity
            this.y = 0
        } else if (ballBottom > worldBottom) {
            console.log('game over')
        }

    }
};

game.platform = {
    velocity: 6,
    dx: 0,
    x: 280,
    y: 300,
    height: 14,
    width: 100,
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
    },
    getTouchOffset(x) { //метод делит на 2 части платформу от точки касания мяча
        let diff = (this.x + this.width) - x //правая часть
        let offset = this.width - diff //левая часть

        // this.width = 2(вся ширина)  result вычисляется по правилам пропорции
        // offset - ?

        let result = offset * 2 / this.width //центр попадания мяча
       return  result -= 1 // вернуть результат в пределах [-1;1]
    }
};


window.addEventListener('load', () => {
    game.start()
})