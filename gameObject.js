
class GameObject{
  constructor (name, pos){
    this.name = name
    this.pos = pos
    this.vel = createVector()
    this.acc = createVector()

    this.animations = Sprites.getAnimation(name)
    this.state = ''

    this.setupCollisions()
  }

  setupCollisions () {
    this.colliders = {}

    const animNames = Object.keys(this.animations)
    animNames.forEach(animName => {
        const anim = this.animations[animName]
        this.colliders[animName] = []

        anim.sprites.forEach((spriteName, i)=>{
            const theBounds = anim.sprites[i].collisionBounds

            const theCollider = new Collider(
                createVector(theBounds.originX, theBounds.originY),
                createVector(theBounds.sizeX  , theBounds.sizeY  ),
                this
            )
            this.colliders[animName][i] = theCollider
        })
    })
  }

  commonUpdate(collisions){

    const thisCollider = this.getCurrentCollider()
    collisions.forEach(x=>{
      const collides = thisCollider.collidesWith(x)

      if (collides){
        const response = Collider.calculateCollision(thisCollider, x, true)

        this.pos.x += response.overlap.x * response.shortestAxis.x
        this.pos.y += response.overlap.y * response.shortestAxis.y

        // this.vel.x *= -response.shortestAxis.x
        // this.vel.y *= -response.shortestAxis.y
      }
    })
    this.pos.add(this.vel)
    this.vel.add(this.acc)
    this.acc.mult(0)
  }

  getCurrentCollider(){
    const currentAnimation = this.animations[this.state]
    const currentSpriteIndex = currentAnimation.frameCount % currentAnimation.sprites.length
    const currentCollider = this.colliders[this.state][currentSpriteIndex]

    return currentCollider
  }

  draw(){
    push()
    translate(this.pos.x, this.pos.y)
    this.animations[this.state].render(this.direction)
    if (debug)
      this.getCurrentCollider().render()
    this.getCurrentCollider().update()
    pop()
    }
}