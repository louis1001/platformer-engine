
class Collider{
    constructor(pos, sz, parent){
        this.pos = pos
        this.sz = sz
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
