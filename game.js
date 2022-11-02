let game = {
    ctx: null,
    platform: null,
    ball: null,
    blocks: [],
    rows: 4,
    cols: 8,
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
        window.addEventListener("keydown", (e) => {
            if (e.code === "ArrowLeft" ||  e.code === "ArrowRight") {
                this.platform.start(e.code)
            }
        })

        window.addEventListener("keyup", () => {
            this.platform.dx = 0 // обнуление скорости чтобы платформа останавливалась
        })
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
            this.sprites[spritesKey].addEventListener("load", onImageLoad()); //загрузка динамического пути
        }

    },
    create() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.blocks.push({
                    x: (60 + 4) * col + 65, //отступы по 4 пикселя (+ 65 это смещение всей конструкции вправо)
                    y: (20 + 4) * row + 20 //здесь +20 отступ сверху
                })
            }

        }
    },

    update() {
        this.platform.move()
    },
    run(){
        window.requestAnimationFrame(() => {
            this.update()
            this.render() //отрисовка запланированной анимации
            this.run() //рекурсивное объявление рендера чтобы программа бесконечно отрисовывала новый стейт
        });
    },

    render() {
        //начальные координаты всех спрайтов
        this.ctx.drawImage(this.sprites.background, 0, 0);
        this.ctx.drawImage(this.sprites.ball, 0, 0, this.ball.width, this.ball.height, this.ball.x,this.ball.y, this.ball.width, this.ball.height);
        this.ctx.drawImage(this.sprites.platform, this.platform.x, this.platform.y);

        this.renderBlocks()
    },
    renderBlocks() {
        for(let block of this.blocks) {
            this.ctx.drawImage(this.sprites.block, block.x, block.y); // рендер блоков
        }
    },
    start: function() {
        this.init()
        this.preload(()=> {
            this.create();
            this.run()
        })
    }
};

//свойства спрайтов

game.ball = {
    x: 320,
    y: 280,
    width: 20,
    height: 20
}

game.platform = {
    move() {
        if(this.dx) { //если координата не равна нулю то платформа движется
            this.x += this.dx
            game.ball.x +=this.dx
        }
    },
    start(keyVal) {
        if (keyVal === "ArrowLeft") {
            this.dx = -this.velocity
        } else if ( keyVal === "ArrowRight") {
            this.dx = this.velocity
        }
    },
    velocity: 6,//скорость платформы
    dx: 0, //скорость по дефолту
    x: 280,
    y: 300
}

window.addEventListener('load', () => {
    game.start()
})