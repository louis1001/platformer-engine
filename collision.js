
class Collider{
    constructor(pos, sz, parent){
        this.pos = pos
        this.sz = sz
        this.points = [
            this.pos.copy(),
            this.pos.copy().add(this.sz.x, 0),
            this.pos.copy().add(this.sz.x, this.sz.y),
            this.pos.copy().add(0, this.sz.y)            
        ]

        // this.sz.x -= 1
        // this.sz.y -= 1
        this.parent = parent

        this.lastCollision = false
    }

    getPosition(){
        const thisPos = createVector(
            this.pos.x + this.parent.pos.x,
            this.pos.y + this.parent.pos.y
        )

        return thisPos
    }

    getVelocity(){
        return this.parent.vel
    }

    update(){
        // debugger
        this.lastCollision = false
    }

    render() {
        // debugger
        push()
        const thisPos = this.getPosition()
        noFill()
        if (this.lastCollision){
            fill(255, 30, 60, 50)
        }
        stroke(0)
        rect(this.pos.x, this.pos.y,
            this.sz.x-1, this.sz.y-1)
        pop()
    }

    calculateCollision(others, newPos, oldPos, vel){
        let updatedPosition = newPos.copy()
        const oldPosTiled = GameObject.toGridPos(oldPos)
    
        const updatedCollisions = [false, false, false, false]
        if (vel.x <= 0){
            const indexTile = GameObject.toGridPos(updatedPosition)

            const leftTopTile = GameObject.getTile(indexTile.x, oldPosTiled.y)
            const leftBotTile = GameObject.getTile(indexTile.x, oldPosTiled.y+1.9)

            // console.log(indexTile)
            let collided = false
            if (leftTopTile){
                if (leftTopTile.collisionReactions(0)){
                    collided = true
                }
            }

            if (leftBotTile){
                if (leftBotTile.collisionReactions(0)){
                    collided = true
                }
            }

            if (collided){
                // console.log("Collision going left!")
                const offSetX = indexTile.copy()
                offSetX.x = Math.floor(offSetX.x+1)
                updatedPosition.x = GameObject.fromGridPos(offSetX).x
                updatedCollisions[0] = true
            }
        } else {
            const indexTile = GameObject.toGridPos(updatedPosition)

            const rightTopTile = GameObject.getTile(indexTile.x+1, oldPosTiled.y)
            const rightBotTile = GameObject.getTile(indexTile.x+1, oldPosTiled.y+1.9)

            // console.log(indexTile)

            let collided = false
            if (rightTopTile){
                if (rightTopTile.collisionReactions(1)){
                    collided = true
                }
            }

            if (rightBotTile){
                if (rightBotTile.collisionReactions(1)){
                    collided = true
                }
            }

            if (collided){
                // console.log("Collision going right!")
                const offSetX = indexTile.copy()
                offSetX.x = Math.floor(offSetX.x)
                updatedPosition.x = GameObject.fromGridPos(offSetX).x
                updatedCollisions[1] = true
            }
        }

        if (vel.y <= 0){
            const indexTile = GameObject.toGridPos(updatedPosition)

            const leftTopTile = GameObject.getTile(indexTile.x, indexTile.y)
            const rightTopTile = GameObject.getTile(indexTile.x+0.9, indexTile.y)

            // console.log(indexTile)
            let collided = false
            if (leftTopTile){
                if (leftTopTile.collisionReactions(2)){
                    collided = true
                }
            }

            if (rightTopTile){
                if (rightTopTile.collisionReactions(2)){
                    collided = true
                }
            }

            if (collided){
                // console.log("Collision going up!")
                const offSetY = indexTile.copy()
                offSetY.y = Math.floor(offSetY.y+1)
                updatedPosition.y = GameObject.fromGridPos(offSetY).y
                updatedCollisions[2] = true
            }
        } else {
            const indexTile = GameObject.toGridPos(updatedPosition)

            const leftBotTile = GameObject.getTile(indexTile.x, indexTile.y+2)
            const rightBotTile = GameObject.getTile(indexTile.x+0.9, indexTile.y+2)

            // console.log(indexTile)
            let collided = false
            if (leftBotTile){
                if (leftBotTile.collisionReactions(3)){
                    collided = true
                }
            }

            if (rightBotTile){
                if (rightBotTile.collisionReactions(3)){
                    collided = true
                }
            }

            if (collided){
                // console.log("Collision going down!")
                const offSetY = indexTile.copy()
                offSetY.y = Math.floor(offSetY.y)
                updatedPosition.y = GameObject.fromGridPos(offSetY).y
                updatedCollisions[3] = true
            }
        }

        return {
            position: updatedPosition,
            collisions: updatedCollisions
        }
    }

    static calculateCollision(a, b, considerVelocity) {
        if (!a.collidesWith(b)){
            return false
        }
        const aPos = a.getPosition()
        const bPos = b.getPosition()

        let x_overlap = Math.max(0, Math.min(aPos.x + a.sz.x-1, bPos.x + b.sz.x-1) - Math.max(aPos.x, bPos.x))
        let y_overlap = Math.max(0, Math.min(aPos.y + a.sz.y-1, bPos.y + b.sz.y-1) - Math.max(aPos.y, bPos.y))

        const shortestAxis = createVector(x_overlap<y_overlap, y_overlap<x_overlap)

        if (aPos.x + a.sz.x-1 < bPos.x + b.sz.x-1){
            x_overlap *= -1
        }

        if (aPos.y + a.sz.y-1 < bPos.y + b.sz.y-1){
            y_overlap *= -1
        }

        const response = {
            overlap: createVector(x_overlap, y_overlap),
            shortestAxis
        }

        if (considerVelocity){
            const aVel = a.getVelocity()
            const bVel = b.getVelocity()

            const sumVel = p5.Vector.sub(aVel, bVel)

            if (abs(sumVel.x) > abs(sumVel.y)){
                response.shortestAxis = createVector(1, 0)
            } else {
                response.shortestAxis = createVector(0, 1)
            }
        }

        return response
    }

    collidesWith(other) {
        if (other === this) return
        // debugger
        const thisPos = this.getPosition()
        const otherPos = other.getPosition()

        const collide = collideRectRect(
            thisPos.x, thisPos.y, this.sz.x-1, this.sz.y-1,
            otherPos.x, otherPos.y, other.sz.x-1, other.sz.y-1,
        )

        if (collide){
            this.lastCollision = true
            other.lastCollision = true
        }

        return collide
    }
}

class Collisions{
    static areColliding(rect1, rect2) {
        return (
            (rect1.x < (rect2.x + rect2.w)) &&
            ((rect1.x + rect1.w) > rect2.x) &&
            (rect1.y < (rect2.y + rect2.h)) &&
            ((rect1.y + rect1.h) > rect2.y)
        )
    }
}
