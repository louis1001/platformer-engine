
class Block extends GameObject{
    constructor(name = "question-block", pos){

        super(name, pos)

        this.state = "normal"

        this.vel = createVector()
        this.acc = createVector()
    }

    updateAnimation(){
        this.animations[this.state].update()
    }

    update(){
        this.updateAnimation()
    }

    applyForce(f){
        this.acc.add(f)
    }
}
