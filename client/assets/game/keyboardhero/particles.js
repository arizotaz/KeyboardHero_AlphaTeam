let particles = [];
let particle_size = 50;

class Particle{
    constructor(x,y,forceX,forceY) {
        this.x = x;
        this.y = y;
        this.forceX = forceX;
        this.forceY = forceY;
    }

    Tick() {
        this.x += this.forceX*(deltaTime/100);
        this.y += this.forceY*(deltaTime/100);
        this.forceX = this.forceX*.95;
        this.forceY = this.forceY*.95;

        let dieLimit = 5;
        if (Math.abs(this.forceX) < dieLimit && Math.abs(this.forceY) < dieLimit) {
            for (let i = particles.length-1; i >= 0; --i) {
                if (particles[i] == this) {
                    particles.splice(i,1);
                }
            }
        }
    }

    Render() {

    }
}

class Particle_MISS extends Particle {
    Render() {
        let h = particle_size;
        let w = h*(100/30);;
        let x = this.x + w/2;
        let y = this.y - h/2;
        image(GetTexture("score_miss"),x,y,w,h);
    }
}
class Particle_PERFECT extends Particle {
    Render() {
        let h = particle_size;
        let w = h*(120/30);;
        let x = this.x + w/2;
        let y = this.y - h/2;
        image(GetTexture("score_perfect"),x,y,w,h);
    }
}
class Particle_GREAT extends Particle {
    Render() {
        let h = particle_size;
        let w = h*(100/30);
        let x = this.x + w/2;
        let y = this.y - h/2;
        image(GetTexture("score_great"),x,y,w,h);
    }
}
class Particle_GOOD extends Particle {
    Render() {
        let h = particle_size;
        let w = h*(100/30);
        let x = this.x + w/2;
        let y = this.y - h/2;
        image(GetTexture("score_good"),x,y,w,h);
    }
}
class Particle_OK extends Particle {
    Render() {
        let h = particle_size;
        let w = h*(45/30);;
        let x = this.x + w/2;
        let y = this.y - h/2;
        image(GetTexture("score_ok"),x,y,w,h);
    }
}