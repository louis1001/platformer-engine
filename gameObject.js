
class GameObject{
  constructor (name, pos, cellSize=16){
    this.name = name
    this.pos = pos
    this.vel = createVector()
    this.acc = createVector()
    
    GameObject.cellSize = cellSize

    this.animations = Sprites.getAnimation(name)
    this.state = ''

    this.setupCollisions()
  }

  static getTile(){
    return null
  }

  gridPos(){
    return GameObject.toGridPos(this.pos)
  }

  static toGridPos(vec){
    const newVec = vec.copy().div(GameObject.cellSize)
    // newVec.x = Math.round(newVec.x)
    // newVec.y = Math.round(newVec.y)

    return newVec
  }

  static fromGridPos(vec){
    const newVec = vec.copy().mult(GameObject.cellSize)
    return newVec
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

    this.lastCollisions = [false, false, false, false]
    
    this.collisionReactions = (col)=>{
      const currentAnimation = this.animations[this.state]
      const currentSprite = currentAnimation.getCurrent()

      return currentSprite.colReaction(col)
    }
  }

  commonUpdate(collisions, grid=[]){
    this.vel.add(this.acc)
    this.acc.mult(0)
    const frVel = p5.Vector.mult(this.vel, 1/frameRate())

    const newPosition = p5.Vector.add(this.pos, frVel)

    const thisCollider = this.getCurrentCollider()
    const updateInCol = thisCollider.calculateCollision(
      grid,
      newPosition,
      this.pos,
      frVel
    )

    const updatedPos = updateInCol.position

    // this.pos.add(frVel)
    const newColls = updateInCol.collisions
    if (newColls[0] || newColls[1]){
      this.vel.x = 0
    }

    if (newColls[2] || newColls[3]){
      this.vel.y = 0
    }

    this.pos = updatedPos
    this.lastCollisions = newColls
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