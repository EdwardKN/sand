var canvas = document.createElement("canvas");
var c = canvas.getContext("2d");
canvas.style.zIndex = "1"
document.body.appendChild(canvas)

canvas.width = 160*2;
canvas.height = 90*2;

var renderCanvas = document.createElement("canvas");
var renderC = renderCanvas.getContext("2d");
renderCanvas.style.zIndex = "10"
document.body.appendChild(renderCanvas)

var currentTool = 0;

var mouseSize = 5;

var scale;

const chunkSize = 32;

var mouse = {
    x: 1000,
    y: 1000,
    down: false
}

let typetocreate = "sand"


function fixCanvas() {
    if (window.innerWidth * 9 > window.innerHeight * 16) {
        renderCanvas.width = window.innerHeight * 16 / 9;
        renderCanvas.height = window.innerHeight;
        scale = renderCanvas.width / canvas.width

    } else {
        renderCanvas.width = window.innerWidth;
        renderCanvas.height = window.innerWidth * 9 / 16;
        scale = renderCanvas.height / canvas.height

    }
}

var spritesheet;
var spritesheetImage;

var images = {
    stone: {
        src: "stone"
    }
}

async function loadSpriteSheet() {
    var response = await fetch("./images/texture.json")
    spritesheet = await response.json();
    spritesheetImage = new Image();
    spritesheetImage.src = "./images/texture.png";
}

async function preRender(imageObject) {
    await loadSpriteSheet();
    Object.entries(imageObject).forEach(image => {
        let src = (image[1].src.split("/"))
        let src3 = "images/" + src
        image[1].sprite = spritesheet.frames[spritesheet.frames.map(function (e) { return e.filename; }).indexOf(src3 + ".png")]
    });
}

renderCanvas.addEventListener("wheel", (e) => {
    currentTool += (Math.sign(e.deltaY))
});
renderCanvas.addEventListener("mousemove", function (e) {
    mouse.x = Math.floor(e.offsetX / scale)
    mouse.y = Math.floor(e.offsetY / scale)
})

renderCanvas.addEventListener("mousedown", function (e) {
    mouse.down = true;    
})

window.addEventListener("mouseup", e => {
    mouse.down = false;
})

window.addEventListener("keydown", e => {
    if (e.code === "KeyD" && player.directionX == 0) {
        player.directionX = -1;
    }
    if (e.code === "KeyA" && player.directionX == 0) {
        player.directionX = 1;
    }
    if (e.code === "KeyW" && player.directionY == 0) {
        player.directionY = 1;
    }
    if (e.code === "KeyS" && player.directionY == 0) {
        player.directionY = -1;
    }
})
window.addEventListener("keyup", e => {
    if (e.code === "KeyD" && player.directionX == -1) {
        player.directionX = 0;
    }
    if (e.code === "KeyA" && player.directionX == 1) {
        player.directionX = 0;
    }
    if (e.code === "KeyW" && player.directionY == 1) {
        player.directionY = 0;
    }
    if (e.code === "KeyS" && player.directionY == -1) {
        player.directionY = 0;
    }
})

window.onresize = fixCanvas;

async function drawImageFromSpriteSheet(image, x, y, w, h, cropX, cropY, cropW, cropH, context) {
    context.drawImage(spritesheetImage, image.sprite.frame.x + cropX, image.sprite.frame.y + cropY, cropW, cropH, x, y, w, h)
}

class Particle {
    constructor(x, y, color, texture) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.texture = texture;
        this.velocity = {
            x:1,
            y:1
        };

        if (this.color === undefined) {
            this.color = "black"
        }
    }

    async draw() {
        if (!chunks[Math.floor(this.x / chunkSize) + "," + Math.floor(this.y / chunkSize)]) {
            chunks[Math.floor(this.x / chunkSize) + "," + Math.floor(this.y / chunkSize)] = { canvas: document.createElement("canvas") };
            chunks[Math.floor(this.x / chunkSize) + "," + Math.floor(this.y / chunkSize)].canvas.width = chunkSize;
            chunks[Math.floor(this.x / chunkSize) + "," + Math.floor(this.y / chunkSize)].canvas.height = chunkSize;
            chunks[Math.floor(this.x / chunkSize) + "," + Math.floor(this.y / chunkSize)].context = chunks[Math.floor(this.x / chunkSize) + "," + Math.floor(this.y / chunkSize)].canvas.getContext("2d")
        }
        let tmpX = this.x >= 0 ? this.x % chunkSize : (chunkSize + this.x % (chunkSize))
        let tmpY = this.y >= 0 ? this.y % chunkSize : (chunkSize + this.y % (chunkSize))
        tmpX = tmpX == chunkSize ? 0 : tmpX
        tmpY = tmpY == chunkSize ? 0 : tmpY
        chunks[Math.floor(this.x / chunkSize) + "," + Math.floor(this.y / chunkSize)].context.fillStyle = this.color;
        chunks[Math.floor(this.x / chunkSize) + "," + Math.floor(this.y / chunkSize)].context.fillRect(tmpX, tmpY, 1, 1);
        if (this.texture) {
            await sleep(1)
            let tmpFrameX = this.x >= 0 ? this.x % this.texture.sprite.frame.w : (this.texture.sprite.frame.w + this.x % (this.texture.sprite.frame.w))
            tmpFrameX = tmpFrameX == this.texture.sprite.frame.w ? 0 : tmpFrameX
            let tmpFrameY = this.y >= 0 ? this.y % this.texture.sprite.frame.h : (this.texture.sprite.frame.h + this.y % (this.texture.sprite.frame.h))
            tmpFrameY = tmpFrameY == this.texture.sprite.frame.h ? 0 : tmpFrameY
            await drawImageFromSpriteSheet(this.texture, tmpX, tmpY, 1, 1, tmpFrameX, tmpFrameY, 1, 1, chunks[Math.floor(this.x / chunkSize) + "," + Math.floor(this.y / chunkSize)].context)
        } else {

        }


    }

    async update() {
        this.type?.update();
    }

    async updateNearby(vx, vy) {
        let self = this;
        if(vx == undefined){
            vx = 0;
        }
        if(vy == undefined){
            vy = 0;
        }
        if (self?.type instanceof Fluid && vy == 0) {
            self.type.update()
        } else {
            for (let x = self.x - 2; x < self.x + 3; x++) {
                for (let y = self.y - 2; y < self.y + 3; y++) {
                    if(!updateQueue.includes(particles[(x) + "," + (y)])){
                        updateQueue.push(particles[(x) + "," + (y)]);
                    };
                }
            }
            for (let x = self.x - 2 - vx; x < self.x + 3 - vx; x++) {
                for (let y = self.y - 2 - vy; y < self.y + 3 - vy; y++) {
                    if(!updateQueue.includes(particles[(x) + "," + (y)])){
                        updateQueue.push(particles[(x) + "," + (y)]);
                    };
                }
            }
        };
    };
    checkIfInAir(){
        if(this.type instanceof Sand || this.type instanceof Fluid){
            if(particles[(this.x) + "," + (this.y+1)]?.type == undefined){
                if(!updateQueue.includes(particles[(this.x) + "," + (this.y)])){
                    updateQueue.push(particles[(this.x) + "," + (this.y)]);
                };
            }
        }
    }

    async move(vx, vy) {
        let tmp = particles[(this.x + vx) + "," + (this.y + vy)];
        if (tmp) {
            if (tmp.type == undefined) {
                return;
            } else {
                tmp.x -= vx;
                tmp.y -= vy;
                tmp.draw();
            };
        } else {
            let tmpX = this.x >= 0 ? this.x % chunkSize : (chunkSize + this.x % (chunkSize));
            let tmpY = this.y >= 0 ? this.y % chunkSize : (chunkSize + this.y % (chunkSize));
            tmpX = tmpX == chunkSize ? 0 : tmpX;
            tmpY = tmpY == chunkSize ? 0 : tmpY;
            chunks[Math.floor(this.x / chunkSize) + "," + Math.floor(this.y / chunkSize)].context.clearRect(tmpX, tmpY, 1, 1);
        }
        particles[(this.x + vx) + "," + (this.y + vy)] = this;

        particles[this.x + "," + this.y] = tmp;
        
        if (tmp) {
            tmp.updateNearby(0, 0);
        }
        this.y += vy;
        this.x += vx;
        this.draw();
        let self = this;
        self.updateNearby(vx, vy);
        //self.checkIfInAir();
    }
};

var updateQueue = [];
async function updateNextInQueue(){
    let tmp = updateQueue.length;
    await updateQueue.forEach(async function(e) {
        await e?.update();
        updateQueue.shift();
    })
    return tmp;
}

class Sand {
    constructor(particle) {
        this.particle = particle;
    }
    async update() {
        await sleep()
        let maxVelocityY = 0;
        for(let i = 1; i < this.particle.velocity.y+1; i++){
            if (particles[this.particle.x + "," + (this.particle.y + i)] === undefined || particles[this.particle.x + "," + (this.particle.y + i)].type instanceof Fluid) {
                maxVelocityY = i;
            }else{
                i = undefined;
            }
        }
        if(maxVelocityY !== 0){
            this.particle.move(0, maxVelocityY);
            this.particle.velocity.y++;
        }else{
            let maxVelocityX = 0;
            this.particle.velocity.y = 1;
            for(let i = 1; i < this.particle.velocity.x+1; i++){
                let random = Math.random() > 0.5 ? -1 : 1
                if (particles[(this.particle.x + -i*random) + "," + (this.particle.y + 1)] == undefined || particles[(this.particle.x + -i*random) + "," + (this.particle.y + 1)].type instanceof Fluid) {
                    maxVelocityX = -i*random;
                }else if (particles[(this.particle.x + i*random) + "," + (this.particle.y + 1)] == undefined || particles[(this.particle.x + i*random) + "," + (this.particle.y + 1)].type instanceof Fluid) {
                    maxVelocityX = i*random;
                }else{
                    i = undefined;
                    this.particle.velocity.x = 1;
                }
            }
            if(maxVelocityX !== 0){
                this.particle.move(maxVelocityX, 0);
                this.particle.velocity.x++;
            }

        }
    };
};

class Fluid {
    constructor(particle) {
        this.particle = particle;
    };
    async update() {
        await sleep()
        let maxVelocityY = 0;
        for(let i = 1; i < this.particle.velocity.y+1; i++){
            if (particles[this.particle.x + "," + (this.particle.y + i)] === undefined) {
                maxVelocityY = i;
            }else{
                i = undefined;
            }
        }
        if(maxVelocityY !== 0){
            this.particle.move(0, maxVelocityY);
            this.particle.velocity.y++;
        }else{
            let maxVelocityX = 0;
            this.particle.velocity.y = 1;
            for(let i = 1; i < this.particle.velocity.x+1; i++){
                let random = Math.random() > 0.5 ? -1 : 1
                if (particles[(this.particle.x + -i*random) + "," + (this.particle.y)] == undefined) {
                    maxVelocityX = -i*random;
                }else if (particles[(this.particle.x + i*random) + "," + (this.particle.y)] == undefined) {
                    maxVelocityX = i*random;
                }else{
                    i = undefined;
                    this.particle.velocity.x = 1;
                }
            }
            if(maxVelocityX !== 0){
                this.particle.move(maxVelocityX, 0);
                this.particle.velocity.x++;
            }

        }
    };
}

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.speedLossX = 0.5;
        this.speedLossY = 0.5;
        this.directionX = 0;
        this.directionY = 0;
        this.clampX = 5;
        this.clampY = 7;
        this.speedToSpeedX = 1;
        this.speedToSpeedY = 1;
        this.w = 5
        this.h = 10;
        this.weight = 0.1
        this.gravityV = 0;
        this.gravityClamp = 4;
    }
    draw() {
        c.fillStyle = "black"
        c.fillRect(Math.floor(canvas.width / 2 - this.w / 2), Math.floor(canvas.height / 2 - this.h / 2), this.w, this.h)
    }
    update() {
        this.draw()


        this.vx = this.updateVelocity(this.vx, this.directionX, this.speedLossX, this.clampX, this.speedToSpeedX)
        this.vy = this.updateVelocity(this.vy, this.directionY, this.speedLossY, this.clampY, this.speedToSpeedY)

        this.gravityV = this.gravity(this.gravityV, this.gravityClamp)

        this.checkCollisions();

        this.x += this.vx

        this.y += this.vy + this.gravityV



    }

    checkCollisions() {
        let tmp = false;
        for (let i = 0; i < this.w; i++) {
            if (particles[(Math.floor(-Math.floor(this.x) + Math.floor(canvas.width / 2 - this.w / 2) + i)) + "," + (-Math.floor(this.y) + Math.floor(canvas.height / 2 + this.h / 2))]) {
                if ((particles[(Math.floor(-Math.floor(this.x) + Math.floor(canvas.width / 2 - this.w / 2) + i)) + "," + (-Math.floor(this.y) + Math.floor(canvas.height / 2 + this.h / 2))].type instanceof Fluid) == false) {
                    tmp = true;
                }
            }
        }
        if (tmp) {
            this.gravityV = 0;
            if (this.vy < 0) {
                this.vy = 0;
            }
            for (let i = 0; i < this.w; i++) {
                if (particles[(Math.floor(-Math.floor(this.x) + Math.floor(canvas.width / 2 - this.w / 2) + i)) + "," + (-Math.floor(this.y) + Math.floor(canvas.height / 2 + this.h / 2) - 1)]) {
                    if ((particles[(Math.floor(-Math.floor(this.x) + Math.floor(canvas.width / 2 - this.w / 2) + i)) + "," + (-Math.floor(this.y) + Math.floor(canvas.height / 2 + this.h / 2) - 1)].type instanceof Fluid) == false) {
                        this.y++;
                    }
                }
            }
        }
        let tmp2 = false;
        for (let i = 0; i < this.w; i++) {

            if (particles[(Math.floor(-Math.floor(this.x) + Math.floor(canvas.width / 2 - this.w / 2) + i)) + "," + (-Math.floor(this.y) + Math.floor(canvas.height / 2 - this.h / 2 - 1))]) {
                if ((particles[(Math.floor(-Math.floor(this.x) + Math.floor(canvas.width / 2 - this.w / 2) + i)) + "," + (-Math.floor(this.y) + Math.floor(canvas.height / 2 - this.h / 2 - 1))].type instanceof Fluid) == false) {
                    tmp2 = true;
                }
            }
        }
        if (tmp2) {
            if (this.directionY == 1) {
                this.vy = -this.gravityV;
            }
            for (let i = 0; i < this.w; i++) {
                if (particles[(Math.floor(-Math.floor(this.x) + Math.floor(canvas.width / 2 - this.w / 2) + i)) + "," + (-Math.floor(this.y) + Math.floor(canvas.height / 2 - this.h / 2))]) {
                    if ((particles[(Math.floor(-Math.floor(this.x) + Math.floor(canvas.width / 2 - this.w / 2) + i)) + "," + (-Math.floor(this.y) + Math.floor(canvas.height / 2 - this.h / 2))].type instanceof Fluid) == false) {
                        this.y--;
                    }
                }
            }
        }
        let tmp3 = false;
        for (let i = 0; i < this.h; i++) {
            if (particles[(Math.floor(-Math.floor(this.x) + Math.floor(canvas.width / 2 - this.w / 2 - 1))) + "," + (-Math.floor(this.y) + Math.floor(canvas.height / 2 - this.h / 2) + i)]) {
                if ((particles[(Math.floor(-Math.floor(this.x) + Math.floor(canvas.width / 2 - this.w / 2 - 1))) + "," + (-Math.floor(this.y) + Math.floor(canvas.height / 2 - this.h / 2) + i)].type instanceof Fluid) == false) {
                    tmp3 = true;
                }
            }
        }
        if (tmp3) {
            if (this.directionX == 1) {
                this.vx = 0
            }
            for (let i = 0; i < this.w; i++) {
                if (particles[(Math.floor(-Math.floor(this.x) + Math.floor(canvas.width / 2 - this.w / 2))) + "," + (-Math.floor(this.y) + Math.floor(canvas.height / 2 - this.h / 2) + i)]) {
                    if ((particles[(Math.floor(-Math.floor(this.x) + Math.floor(canvas.width / 2 - this.w / 2))) + "," + (-Math.floor(this.y) + Math.floor(canvas.height / 2 - this.h / 2) + i)].type instanceof Fluid) == false) {
                        this.x--;
                    }
                }
            }
        }
        let tmp4 = false;
        for (let i = 0; i < this.h; i++) {
            if (particles[(Math.floor(-Math.floor(this.x) + Math.floor(canvas.width / 2 + this.w / 2))) + "," + (-Math.floor(this.y) + Math.floor(canvas.height / 2 - this.h / 2) + i)]) {
                if ((particles[(Math.floor(-Math.floor(this.x) + Math.floor(canvas.width / 2 + this.w / 2))) + "," + (-Math.floor(this.y) + Math.floor(canvas.height / 2 - this.h / 2) + i)].type instanceof Fluid) == false) {
                    tmp4 = true;
                }
            }
        }
        if (tmp4) {
            if (this.directionX == -1) {
                this.vx = 0
            }
            for (let i = 0; i < this.w; i++) {
                if (particles[(Math.floor(-Math.floor(this.x) + Math.floor(canvas.width / 2 + this.w / 2 - 1))) + "," + (-Math.floor(this.y) + Math.floor(canvas.height / 2 - this.h / 2) + i)]) {
                    if ((particles[(Math.floor(-Math.floor(this.x) + Math.floor(canvas.width / 2 + this.w / 2 - 1))) + "," + (-Math.floor(this.y) + Math.floor(canvas.height / 2 - this.h / 2) + i)].type instanceof Fluid) == false) {
                        this.x++;
                    }
                }
            }
        }
    }
    updateVelocity(v, direction, speedloss, clamp, speedToSpeed) {
        v += speedToSpeed * direction;
        if (v > clamp) {
            v = clamp;
        }
        if (v < -clamp) {
            v = -clamp;
        }
        if (v > 0) {
            v -= speedloss
            if (v < 0) {
                v = 0;
            }
        } else if (v < 0) {
            v += speedloss
            if (v > 0) {
                v = 0;
            }
        }

        return v

    }
    gravity(v, clamp) {
        if (v > clamp) {
            v = clamp;
        }
        if (v < -clamp) {
            v = -clamp;
        }
        v -= this.weight;

        return v;
    }
}

var particles = []

var chunks = [];

function createParticle(x, y, type, color, texture) {
    if (type == "solid") {
        particles[x + "," + y] = new Particle(x, y, color, texture)
        particles[x + "," + y].draw();
    } else {
        if (particles[x + "," + y] === undefined) {
            particles[x + "," + y] = new Particle(x, y, color, texture)
            if (type == "sand") {
                particles[x + "," + y].type = new Sand(particles[x + "," + y])
            }
            if (type == "fluid") {
                particles[x + "," + y].color = "#2389da"

                particles[x + "," + y].type = new Fluid(particles[x + "," + y])
            }
            particles[x + "," + y].draw();
            particles[x + "," + y].updateNearby();

        } else {
            //createParticle(x, y - 1, type, color, texture)
        }
    }

}


async function render() {
    for (let x = 0 - Math.floor(player.x) - canvas.width / 2, n = canvas.width - player.x + canvas.width; x < n; x++) {
        for (let y = 0 - Math.floor(player.y) - canvas.height / 2, g = canvas.height - player.y + canvas.height; y < g; y++) {
            //particles[x + "," + y]?.type?.update();
        }
    }
    for (let x = -Math.round(player.x / chunkSize) - 1, n = Math.round(canvas.width / chunkSize) - Math.round(player.x / chunkSize) + 1; x < n; x++) {
        for (let y = -Math.round(player.y / chunkSize) - 1, g = Math.round(canvas.height / chunkSize) - Math.round(player.y / chunkSize) + 1; y < g; y++) {
            if (chunks[x + "," + y]) {
                c.drawImage(chunks[x + "," + y].canvas, x * chunkSize + Math.floor(player.x), y * chunkSize + Math.floor(player.y))
            }
        }
    }

    player.update();
}

function testGenerate() {
    for (let x = -500; x < 500; x++) {
        for (let y = -500; y < 500; y++) {
            let perlin = 0//getPerlinNoise(x, y, 20, 100)
            if (perlin > 0.5 || Math.abs(x) > 450 || Math.abs(y) > 450) {
                createParticle(x, y, "solid", "brown")
            }
        }
    }
}

async function update() {
    requestAnimationFrame(update);
    renderC.imageSmoothingEnabled = false;

    c.clearRect(0, 0, canvas.width, canvas.height);
    let updateQueueLength = await updateNextInQueue();
    

    if(mouse.down){
        buttonPress();
    }


    render();

    c.lineWidth = 1;
    c.strokeStyle = "black";
    c.strokeRect(mouse.x- mouseSize/2,mouse.y - mouseSize/2,mouseSize,mouseSize)

    renderC.fillStyle = "white"
    renderC.fillRect(0, 0, renderCanvas.width, renderCanvas.height);
    renderC.drawImage(canvas, 0, 0, renderCanvas.width, renderCanvas.height)

    renderC.fillStyle = "gray"
    renderC.fillText(fps, 100, 100)

    renderC.fillStyle = "gray"
    renderC.fillText(updateQueueLength, 100, 150)
}

function getPerlinNoise(x, y, perlinSeed, resolution) {
    noise.seed(perlinSeed);

    var value = noise.simplex2(x / resolution, y / resolution);
    value++;
    value /= 2;

    return value;

}

var player = new Player(0, 0)

async function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)) }




var times = [];
var fps;

function refreshLoop() {
    window.requestAnimationFrame(function () {
        const now = performance.now();
        while (times.length > 0 && times[0] <= now - 1000) {
            times.shift();
        }
        times.push(now);
        fps = times.length;
        refreshLoop();
    });
}

function buttonPress(){
    let size = mouseSize;
    let thisTool = Math.abs(currentTool) % 4;
    if (thisTool === 0) {
        for (let i = 0; i < Math.pow(size, 2); i++) {
            createParticle(mouse.x + Math.floor(i / size) - Math.floor(size / 2 + player.x), mouse.y + i % size - Math.floor(size / 2 + player.y), "sand", "#c2b280")
        }
    } else if (thisTool === 1) {
        for (let i = 0; i < Math.pow(size, 2); i++) {
            createParticle(mouse.x + Math.floor(i / size) - Math.floor(size / 2 + player.x), mouse.y + i % size - Math.floor(size / 2 + player.y), "fluid", "#c2b280")
        }
    } else if (thisTool === 2) {
        for (let i = 0; i < Math.pow(size, 2); i++) {
            createParticle(mouse.x + Math.floor(i / size) - Math.floor(size / 2 + player.x), mouse.y + i % size - Math.floor(size / 2 + player.y), "solid", "gray")
        }
    } else if (thisTool === 3) {
        for (let i = 0; i < Math.pow(size, 2); i++) {
            let x = (mouse.x + i % size - Math.floor(size / 2 + player.x))
            let y = (mouse.y + Math.floor(i / size) - Math.floor(size / 2 + player.y))
            particles[x + "," + y] = undefined;
            let tmpX = x >= 0 ? x % chunkSize : (chunkSize + x % (chunkSize))
            let tmpY = y >= 0 ? y % chunkSize : (chunkSize + y % (chunkSize))
            tmpX = tmpX == chunkSize ? 0 : tmpX
            tmpY = tmpY == chunkSize ? 0 : tmpY
            chunks[Math.floor(x / chunkSize) + "," + Math.floor(y / chunkSize)].context.clearRect(tmpX, tmpY, 1, 1);
            for (let x2 = x - 2; x2 < x + 2; x2++) {
                for (let y2 = y - 2; y2 < y + 2; y2++) {
                    particles[(x2) + "," + (y2)]?.type?.update();
                }
            }
        }
    }
}



async function init() {
    fixCanvas();
    refreshLoop();
    loadSpriteSheet();
    await preRender(images);
    update();
    testGenerate()
}

window.onload = init;


