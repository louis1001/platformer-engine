class Character extends GameObject{

    constructor (name = "mario", pos = createVector()){
        super(name, pos)

        this.vel             = createVector()
        this.acc             = createVector()

        this.direction       = false
        this.drifting        = false

        this.crouching       = false
        this.lookingUp       = false

        this.state           = 'still'
        this.prevState       = ''

        this.maxSpeedRunX    = 4 * 60
        this.running         = false
        this.runForce        = createVector(0.1 * 60, 0)

        this.maxSpeedX       = 2 * 60
        this.maxSpeedY       = 4 * 60
        this.jumpForce       = createVector(0, -3 * 40)

        this.rotating        = false
        this.jumpingReleased = false
        this.jumping         = false
        this.jumpingTime     = 0
        this.maxJumpingTime  = 11
        this.minJumpTime     = 5
    }

    updateControls(){
        this.running = false
        this.drifting = false
        // Here the keyboard input should be updated
        if (keyIsDown(SHIFT)){
            // "Run"
            this.running = true
        }

        if(keyIsDown(RIGHT_ARROW)){
            // Walk Right
            this.applyForce(this.runForce)
            if (this.vel.x < 0){
                this.drifting = true
                this.vel.x *= 0.8
            }
        } else if(keyIsDown(LEFT_ARROW)){
            // Walk Left
            this.applyForce(p5.Vector.mult(this.runForce, -1))
            if (this.vel.x > 0){
                this.drifting = true
                this.vel.x *= 0.8
            }
        } else {
            if (this.vel.y !== 0){
                this.vel.x *= 0.95
            } else{
                this.vel.x *= 0.7
            }
            if(abs(this.vel.x) < 1){
                this.vel.x = 0
            }
        }

        if(keyIsDown(32) || keyIsDown(68)){
            // Jump
            if(!this.jumping && this.lastCollisions[3]){
                this.applyForce(this.jumpForce)
                this.jumping = true

                if (keyIsDown(68)){
                    this.rotating = true
                }
            } else if (this.jumpingTime < this.maxJumpingTime) {
                this.applyForce(this.jumpForce)
                this.jumpingTime++
            }
        } else if (this.jumping && (this.jumpingTime < this.minJumpTime)){
            this.applyForce(this.jumpForce)
            this.jumpingTime++
        }

        if (keyIsDown(UP_ARROW)){
            // Look Up
            this.lookingUp = true
        } else if (keyIsDown(DOWN_ARROW)){
            // Crouch
            this.crouching = true
        } else {
            // Do Nothing (Still)
            this.lookingUp = false
            this.crouching = false
        }
    }

    updateAnimation(){
        // Here the state should be updated
        // Checking velocity, direction, crouching
        if (this.rotating){
            this.state = "rotate"
        } else if (this.vel.y > 0){
            this.state = "fall"
        } else if (this.vel.y < 0) {
            this.state = "jump"
        } else if (this.drifting){
            this.state = "drift"
        } else if (abs(this.vel.x) > 0) {
            this.state = "walk"
            if(abs(this.vel.x) > this.maxSpeedX){
                this.state = "run"
            }
        } else if (this.crouching){
            this.state = "still-crouch"
        } else if (this.lookingUp){
            this.state = "still-lookup"
        }else{
            this.state = "still"
        }

        if (this.vel.x != 0){
            this.direction = this.vel.x < 0
        }

        if (this.state != this.prevState){
            this.animations[this.state].start()
            this.prevState = this.state
        }else{
            this.animations[this.state].update()
        }
    }

    update(collisions, grid=[]){
        // Collision detection must go here.
        this.updateControls()
        this.commonUpdate(collisions, grid)

        if (this.lastCollisions[3]){
            // console.log("Coll")
            this.vel.y = 0

            this.jumping = false
            this.rotating = false
            this.jumpingTime = 0
        }

        if (!this.running && abs(this.vel.x) > this.maxSpeedX){
            const signX = abs(this.vel.x) / this.vel.x
            this.vel.x = this.maxSpeedX * signX
        }

        if (this.running && abs(this.vel.x) > this.maxSpeedRunX){
            const signX = abs(this.vel.x) / this.vel.x
            this.vel.x = this.maxSpeedRunX * signX
        }

        if (abs(this.vel.y) > this.maxSpeedY){
            const signY = abs(this.vel.y) / this.vel.y
            this.vel.y = this.maxSpeedY * signY
        }

        this.updateAnimation()
    }

    applyForce(f){
        this.acc.add(f)
    }
}
