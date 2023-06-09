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

renderCanvas.addEventListener("mousedown", function (e) {
    mouse = {
        x: Math.floor(e.offsetX / scale),
        y: Math.floor(e.offsetY / scale)
    }
    let size = 10;
    for (let i = 0; i < Math.pow(size, 2); i++) {
        createParticle(mouse.x + i % size, mouse.y - Math.floor(i / size), "#c2b280", typetocreate)
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
        c.fillRect(this.x, this.y, 1, 1);
    }

    update() {
        this.draw()
        this.type.update();
    }
};

class Sand {
    constructor(particle) {
        this.particle = particle;
    }
    update() {
        if (this.particle.y + 1 < canvas.height) {
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
}

class Fluid {
    constructor(particle) {
        this.particle = particle;
    }
    update() {
        if (particles[this.particle.x + "," + (this.particle.y - 1)]) {
            if (particles[this.particle.x + "," + (this.particle.y - 1)].type instanceof Sand) {
                let tmp = this.particle;
                particles[this.particle.x + "," + (this.particle.y - 1)].y++;
                particles[this.particle.x + "," + (this.particle.y)] = particles[this.particle.x + "," + (this.particle.y - 1)]
                particles[this.particle.x + "," + (this.particle.y - 1)] = tmp;
                particles[this.particle.x + "," + (this.particle.y - 1)].y--;
                return;
            }
        }

        if (this.particle.y + 1 < canvas.height) {
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

function render() {
    for (let x = 0; x < canvas.width; x++) {
        for (let y = 0; y < canvas.height; y++) {
            if (particles[x + "," + y]) {
                particles[x + "," + y].update();
            }
        }
    }
}

function update() {
    requestAnimationFrame(update);
    renderC.imageSmoothingEnabled = false;

    c.clearRect(0, 0, canvas.width, canvas.height);

    render();
    renderC.fillStyle = "white"
    renderC.fillRect(0, 0, renderCanvas.width, renderCanvas.height);
    renderC.drawImage(canvas, 0, 0, renderCanvas.width, renderCanvas.height)

}


update();
