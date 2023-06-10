var canvas = document.createElement("canvas");
var c = canvas.getContext("2d");
canvas.style.zIndex = "1"
document.body.appendChild(canvas)

canvas.width = 160;
canvas.height = 90;

var renderCanvas = document.createElement("canvas");
var renderC = renderCanvas.getContext("2d");
renderCanvas.style.zIndex = "10"
document.body.appendChild(renderCanvas)

var currentTool = 0;

var scale;

var mouse = {
    x: 1000,
    y: 1000
}

let typetocreate = "sand"

window.onload = fixCanvas;

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

renderCanvas.addEventListener("wheel", (e) => {
    currentTool += (Math.sign(e.deltaY))
  });

renderCanvas.addEventListener("mousedown", function (e) {
    mouse = {
        x: Math.floor(e.offsetX / scale),
        y: Math.floor(e.offsetY / scale)
    }
    let size = 10/2;
    let thisTool = Math.abs(currentTool)%4;
    if(thisTool === 0){
        for (let i = 0; i < Math.pow(size, 2); i++) {
            createParticle(mouse.x + i % size - Math.floor(size/2 +player.x), mouse.y + Math.floor(i / size) - Math.floor(size/2+player.y), "#c2b280", "sand")
        }
    }else if(thisTool === 1){
        for (let i = 0; i < Math.pow(size, 2); i++) {
            createParticle(mouse.x + i % size - Math.floor(size/2+player.x), mouse.y + Math.floor(i / size) - Math.floor(size/2+player.y), "#c2b280", "fluid")
        }
    }else if(thisTool === 2){
        for (let i = 0; i < Math.pow(size, 2); i++) {
            createParticle(mouse.x + i % size - Math.floor(size/2+player.x), mouse.y + Math.floor(i / size) - Math.floor(size/2+player.y), "gray","solid")
        }
    }else if(thisTool === 3){
        for (let i = 0; i < Math.pow(size, 2); i++) {
            particles[(mouse.x + i % size - Math.floor(size/2+player.x)) + "," + (mouse.y + Math.floor(i / size) - Math.floor(size/2+player.y))] = undefined;
        }
    }
    
})

window.addEventListener("keydown",e => {
    if(e.code === "KeyD" && player.directionX == 0){
        player.directionX = -1;
    }
    if(e.code === "KeyA" && player.directionX == 0){
        player.directionX = 1;
    }
    if(e.code === "KeyW" && player.directionY == 0){
        player.directionY = 1;
    }
    if(e.code === "KeyS" && player.directionY == 0){
        player.directionY = -1;
    }
})
window.addEventListener("keyup",e => {
    if(e.code === "KeyD" && player.directionX  == -1){
        player.directionX = 0;
    }
    if(e.code === "KeyA" && player.directionX  == 1){
        player.directionX = 0;
    }
    if(e.code === "KeyW" && player.directionY == 1){
        player.directionY = 0;
    }
    if(e.code === "KeyS" && player.directionY == -1){
        player.directionY = 0;
    }
})

window.onresize = fixCanvas;

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;

        if (this.color === undefined) {
            this.color = "black"
        }
    }

    draw() {
        c.fillStyle = this.color
        c.fillRect(this.x + Math.floor(player.x), this.y + Math.floor(player.y), 1, 1);
    }

    update() {
        this.type?.update();
    }
};

class Sand {
    constructor(particle) {
        this.particle = particle;
    }
    update() {
        if (particles[this.particle.x + "," + (this.particle.y + 1)] === undefined || particles[this.particle.x + "," + (this.particle.y + 1)].type instanceof Fluid) {
            moveParticle(this.particle, 0, 1)
        } else {
            let random = Math.random() > 0.5 ? -1 : 1

            if (particles[(this.particle.x + random) + "," + (this.particle.y + 1)] == undefined) {
                moveParticle(this.particle, random, 0)
            }
            if (particles[(this.particle.x + random) + "," + (this.particle.y + 1)] !== undefined) {
                if (particles[(this.particle.x + random) + "," + (this.particle.y + 1)].type instanceof Fluid) {
                    moveParticle(this.particle, random, 0)
                }
            }
        }
    }
}

class Fluid {
    constructor(particle) {
        this.particle = particle;
    }
    update() {
        if (particles[this.particle.x + "," + (this.particle.y - 1)]) {
            if (particles[this.particle.x + "," + (this.particle.y - 1)].type instanceof Sand) {
                let random = Math.random() > 0.5 ? -1 : 1

                if (particles[(this.particle.x + random) + "," + (this.particle.y)] == undefined) {
                    moveParticle(this.particle, random, 0)
                }
                return
            }
        }
        if (particles[this.particle.x + "," + (this.particle.y + 1)] === undefined) {
            moveParticle(this.particle, 0, 1)

        } else {
            let random = Math.random() > 0.5 ? -1 : 1

            if (particles[(this.particle.x + random) + "," + (this.particle.y)] == undefined) {
                moveParticle(this.particle, random, 0)
            }
        }
    }
}

class Player{
    constructor(x,y){
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
        this.w =5
        this.h = 10;
        this.weight = 0.1
        this.gravityV = 0;
        this.gravityClamp = 4;
    }
    draw(){
        c.fillStyle = "black"
        c.fillRect(Math.floor(canvas.width/2 - this.w/2),Math.floor(canvas.height/2 - this.h/2),this.w,this.h)
    }
    update(){
        this.draw()
        

        this.vx =this.updateVelocity(this.vx,this.directionX,this.speedLossX,this.clampX,this.speedToSpeedX)
        this.vy =this.updateVelocity(this.vy,this.directionY,this.speedLossY,this.clampY,this.speedToSpeedY)

        this.gravityV = this.gravity(this.gravityV,this.gravityClamp)

        this.checkCollisions();

        this.x += this.vx

        this.y += this.vy + this.gravityV


        
    }

    checkCollisions(){
        let tmp = false;
        for(let i = 0; i< this.w; i++){
            if(particles[(Math.floor(-Math.floor(this.x) + Math.floor(canvas.width/2 - this.w/2) + i))+","+(-Math.floor(this.y)+ Math.floor(canvas.height/2 + this.h/2))]){
                if((particles[(Math.floor(-Math.floor(this.x) + Math.floor(canvas.width/2 - this.w/2) + i))+","+(-Math.floor(this.y)+ Math.floor(canvas.height/2 + this.h/2))].type instanceof Fluid) == false){
                    tmp = true;
                } 
            }
        }
        if(tmp){
            this.gravityV = 0;
            if(this.vy < 0){
                this.vy = 0;
            }
            for(let i = 0; i< this.w; i++){
                if(particles[(Math.floor(-Math.floor(this.x) + Math.floor(canvas.width/2 - this.w/2) + i))+","+(-Math.floor(this.y)+ Math.floor(canvas.height/2 + this.h/2)-1)]){
                    if((particles[(Math.floor(-Math.floor(this.x) + Math.floor(canvas.width/2 - this.w/2) + i))+","+(-Math.floor(this.y)+ Math.floor(canvas.height/2 + this.h/2)-1)].type instanceof Fluid) == false){
                        this.y++;
                    }
                }
            }
        }
        let tmp2 = false;
        for(let i = 0; i< this.w; i++){

            if(particles[(Math.floor(-Math.floor(this.x) + Math.floor(canvas.width/2 - this.w/2) + i))+","+(-Math.floor(this.y)+ Math.floor(canvas.height/2 - this.h/2 - 1))]){
                if((particles[(Math.floor(-Math.floor(this.x) + Math.floor(canvas.width/2 - this.w/2) + i))+","+(-Math.floor(this.y)+ Math.floor(canvas.height/2 - this.h/2 - 1))].type instanceof Fluid) == false){
                    tmp2 = true;
                } 
            }
        }
        if(tmp2){
            if(this.directionY == 1){
                this.vy = -this.gravityV;
            }
            for(let i = 0; i< this.w; i++){
                if(particles[(Math.floor(-Math.floor(this.x) + Math.floor(canvas.width/2 - this.w/2) + i))+","+(-Math.floor(this.y)+ Math.floor(canvas.height/2 - this.h/2))]){
                    if((particles[(Math.floor(-Math.floor(this.x) + Math.floor(canvas.width/2 - this.w/2) + i))+","+(-Math.floor(this.y)+ Math.floor(canvas.height/2 - this.h/2))].type instanceof Fluid) == false){
                        this.y--;
                    }
                }
            }
        }
        let tmp3 = false;
        for(let i = 0; i< this.h; i++){
            if(particles[(Math.floor(-Math.floor(this.x) + Math.floor(canvas.width/2 - this.w/2 - 1)))+","+(-Math.floor(this.y)+ Math.floor(canvas.height/2 - this.h/2)+ i)]){
                if((particles[(Math.floor(-Math.floor(this.x) + Math.floor(canvas.width/2 - this.w/2 - 1)))+","+(-Math.floor(this.y)+ Math.floor(canvas.height/2 - this.h/2)+ i)].type instanceof Fluid) == false){
                    tmp3 = true;
                } 
            }
        }
        if(tmp3){
            if(this.directionX == 1){
                this.vx = 0
            }
            for(let i = 0; i< this.w; i++){
                if(particles[(Math.floor(-Math.floor(this.x) + Math.floor(canvas.width/2 - this.w/2)))+","+(-Math.floor(this.y)+ Math.floor(canvas.height/2 - this.h/2)+ i)]){
                    if((particles[(Math.floor(-Math.floor(this.x) + Math.floor(canvas.width/2 - this.w/2)))+","+(-Math.floor(this.y)+ Math.floor(canvas.height/2 - this.h/2)+ i)].type instanceof Fluid) == false){
                        this.x--;
                    }
                }
            }
        }
        let tmp4 = false;
        for(let i = 0; i< this.h; i++){
            if(particles[(Math.floor(-Math.floor(this.x) + Math.floor(canvas.width/2 + this.w/2)))+","+(-Math.floor(this.y)+ Math.floor(canvas.height/2 - this.h/2)+ i)]){
                if((particles[(Math.floor(-Math.floor(this.x) + Math.floor(canvas.width/2 + this.w/2)))+","+(-Math.floor(this.y)+ Math.floor(canvas.height/2 - this.h/2)+ i)].type instanceof Fluid) == false){
                    tmp4 = true;
                } 
            }
        }
        if(tmp4){
            if(this.directionX == -1){
                this.vx = 0
            }
            for(let i = 0; i< this.w; i++){
                if(particles[(Math.floor(-Math.floor(this.x) + Math.floor(canvas.width/2 + this.w/2 - 1)))+","+(-Math.floor(this.y)+ Math.floor(canvas.height/2 - this.h/2)+ i)]){
                    if((particles[(Math.floor(-Math.floor(this.x) + Math.floor(canvas.width/2 + this.w/2 - 1)))+","+(-Math.floor(this.y)+ Math.floor(canvas.height/2 - this.h/2)+ i)].type instanceof Fluid) == false){
                        this.x++;
                    }
                }
            }
        }
    }
    updateVelocity(v,direction,speedloss,clamp,speedToSpeed){
        v+= speedToSpeed*direction;
        if(v > clamp){
            v = clamp;
        }
        if(v < -clamp){
            v = -clamp;
        }
        if(v > 0){
            v -= speedloss
            if(v < 0){
                v = 0;
            }
        }else if(v < 0){
            v += speedloss
            if(v > 0){
                v = 0;
            }
        }
        
        return v

    }
    gravity(v,clamp){
        if(v > clamp){
            v = clamp;
        }
        if(v < -clamp){
            v = -clamp;
        }
        v-=this.weight;

        return v;
    }
}

var particles = []

function moveParticle(particle, vx, vy) {
    let tmp = particles[(particle.x + vx) + "," + (particle.y + vy)]

    particles[(particle.x + vx) + "," + (particle.y + vy)] = particle;
    if (tmp) {
        tmp.x -= vx;
        tmp.y -= vy;
    }
    particles[particle.x + "," + particle.y] = tmp;

    particle.y += vy;
    particle.x += vx;
}

function createParticle(x, y, color, type) {
    if(type == "solid"){
        particles[x + "," + y] = new Particle(x, y, color)
    }else{
        if (particles[x + "," + y] === undefined) {
            particles[x + "," + y] = new Particle(x, y, color)
            if (type == "sand") {
                particles[x + "," + y].type = new Sand(particles[x + "," + y])
            }
            if (type == "fluid") {
                particles[x + "," + y].color = "#2389da"
    
                particles[x + "," + y].type = new Fluid(particles[x + "," + y])
            }
            
        } else {
            createParticle(x, y - 1, color, type)
        }
    }
    
}


async function render() {
    for (let x = 0 - Math.floor(canvas.width/2) -Math.floor(player.x); x < canvas.width * 2-Math.floor(player.x); x++) {
        for (let y = 0 - Math.floor(canvas.height/2)-Math.floor(player.y); y < canvas.height * 2-Math.floor(player.y); y++) {
            if (particles[x + "," + y]) {
                particles[x + "," + y].update();
            }
        }
    }
    for (let x = 0-Math.floor(player.x); x < canvas.width-Math.floor(player.x); x++) {
        for (let y = 0-Math.floor(player.y); y < canvas.height-Math.floor(player.y); y++) {
            if (particles[x + "," + y]) {
                particles[x + "," + y].draw();
            }
        }
    }
    player.update();
}

function testGenerate(){
    for(let x = -500; x<500; x++){
        for(let y = -500; y<500; y++){
            let perlin = getPerlinNoise(x,y,20,100)
            if(perlin > 0.5 || Math.abs(x) === 499 || Math.abs(y) === 499){
                createParticle(x,y,"black","solid")
            }
        }
    }
}

async function update() {
    requestAnimationFrame(update);
    renderC.imageSmoothingEnabled = false;

    c.clearRect(0, 0, canvas.width, canvas.height);

    render();
    renderC.fillStyle = "white"
    renderC.fillRect(0, 0, renderCanvas.width, renderCanvas.height);
    renderC.drawImage(canvas, 0, 0, renderCanvas.width, renderCanvas.height)

}

function getPerlinNoise(x,y,perlinSeed, resolution){
    noise.seed(perlinSeed);

    var value = noise.simplex2(x / resolution, y / resolution);
    value++;
    value /= 2;
    
    return value;

}

var player = new Player(0,0)

async function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)) }


testGenerate()
update();
