function reverseImage(img) {
    const reversed = createImage(img.width, img.height)

    for (let x = 0; x < img.width; x++) {
        reversed.copy(img, x, 0, 1, img.height, img.width - x - 1, 0, 1, img.height)
    }

    return reversed
}

class Sprite {
    constructor(sSheet, originPoint, sizeRect, collisionBounds, reaction = undefined) {
        this.spriteSheet = sSheet
        this.origin = originPoint || { x: 0, y: 0 }
        this.size = sizeRect || { x: 1, y: 1 }

        this.image = this.spriteSheet.get(this.origin.x, this.origin.y, this.size.x, this.size.y)
        this.rImage = reverseImage(this.image)

        if (collisionBounds) {
            this.collisionBounds = collisionBounds
        } else {
            this.collisionBounds = {
                originX: 0, originY: 0,
                sizeX: this.image.width, sizeY: this.image.height
            }
        }

        if (reaction) {
            this.colReaction = reaction
        } else {
            this.colReaction = (col) => true
        }
    }

    render(orientation = true) {
        push()
        noSmooth()
        let imageToRender = this.rImage
        if (orientation) {
            imageToRender = this.image
        }
        noFill()
        image(imageToRender, 0, 0, this.size.x, this.size.y)
        pop()
    }
}

class SpriteAnimation {
    constructor(rate = 1, sprites = [], events = {}) {
        this.rate = rate
        this.sprites = sprites
        this.frameCount = 0


        this.eventListeners = {
            start: events.start || [],
            progress: events.progress || [],
            end: events.end || []
        }
    }

    start() {
        this.frameCount = 0
        this.eventListeners.start.forEach(x => x())
    }

    update() {
        this.frameCount += 1
        if (floor(this.frameCount / this.rate) >= this.sprites.length) {
            this.frameCount = 0
            this.eventListeners.end.forEach(x => x(this.frameCount))
        }
        this.eventListeners.progress.forEach(x => x(this.frameCount))
    }

    addEventListener(event, callback) {
        if (Object.keys(this.eventListeners).includes(event)) {
            this.eventListeners[event].push(callback)
        }
    }

    clone() {
        return new SpriteAnimation(this.rate, this.sprites)
    }

    render(orientation) {
        const spriteIndex = floor(this.frameCount / this.rate)
        let currentSprite = this.sprites[spriteIndex]

        currentSprite.render(orientation)
    }

    getCurrent() {
        return this.sprites[this.frameCount % this.sprites.length]
    }
}

class Sprites {

    static addSprite(parent, name, spriteSheet, originPoint, sizeVector, collisionBounds, reaction = undefined) {
        if (!this.Sprites[parent]) this.Sprites[parent] = {}

        this.Sprites[parent][name] = new Sprite(
            spriteSheet,
            originPoint,
            sizeVector,
            collisionBounds,
            reaction
        )
    }

    static addAnimation(parent, name, rate, sprites) {
        if (!this.SpriteAnimations[parent]) this.SpriteAnimations[parent] = {}

        this.SpriteAnimations[parent][name] = new SpriteAnimation(
            rate,
            sprites.map(
                spriteName =>
                    this.Sprites[parent][spriteName]
            )
        )
    }

    static setupSprites() {

        this.SpriteSheet = loadImage('resources/MarioSheet.png', marioSprites => {
            // In closures so I can collapse it in my editor
            {// Init the sprites for mario
                this.addSprite("mario", "still", marioSprites, createVector(0, 0), createVector(16, 32))
                this.addSprite("mario", "still-r", marioSprites, createVector(0, 32), createVector(16, 32))
                this.addSprite("mario", "walk-1", marioSprites, createVector(16, 0), createVector(16, 32))
                this.addSprite("mario", "walk-2", marioSprites, createVector(32, 0), createVector(16, 32))
                this.addSprite("mario", "still-lookup", marioSprites, createVector(48, 0), createVector(16, 32))
                this.addSprite("mario", "still-crouch", marioSprites, createVector(64, 0), createVector(16, 32),
                    { originX: 0, originY: 16, sizeX: 16, sizeY: 16 }
                )
                this.addSprite("mario", "jump", marioSprites, createVector(80, 0), createVector(16, 32))
                this.addSprite("mario", "fall", marioSprites, createVector(96, 0), createVector(16, 32))
                this.addSprite("mario", "drift", marioSprites, createVector(112, 0), createVector(16, 32))
                this.addSprite("mario", "front", marioSprites, createVector(128, 0), createVector(16, 32))
                this.addSprite("mario", "back", marioSprites, createVector(144, 0), createVector(16, 32))
            }

            {// Init the animations for mario
                this.addAnimation("mario", "still", 1, ["still"])
                this.addAnimation("mario", "still-lookup", 1, ["still-lookup"])
                this.addAnimation("mario", "still-crouch", 1, ["still-crouch"])
                this.addAnimation("mario", "walk", 4, ["still", "walk-1", "walk-2", "walk-2", "walk-1", "still"])
                this.addAnimation("mario", "run", 3, ["still", "walk-1", "walk-2", "walk-1"])
                this.addAnimation("mario", "jump", 1, ["jump"])
                this.addAnimation("mario", "fall", 1, ["fall"])
                this.addAnimation("mario", "drift", 1, ["drift"])
                this.addAnimation("mario", "rotate", 3, ["back", "still-r", "front", "still"])
            }

            //  Block Block
            const semiSolid = (col => {
                if (col == 3) {
                    return true
                }
                return false
            })

            const noCollision = () => false

            {// Init the sprites for every block
                this.addSprite("question-block", "normal-1", marioSprites, createVector(0, 64), createVector(16, 16))
                this.addSprite("question-block", "normal-2", marioSprites, createVector(16, 64), createVector(16, 16))
                this.addSprite("question-block", "normal-3", marioSprites, createVector(32, 64), createVector(16, 16))
                this.addSprite("question-block", "normal-4", marioSprites, createVector(48, 64), createVector(16, 16))
                this.addSprite("question-block", "hit", marioSprites, createVector(64, 64), createVector(16, 16))

                this.addSprite("common-block", "normal-still", marioSprites, createVector(0, 80), createVector(16, 16))
                this.addSprite("common-block", "rotate-still", marioSprites, createVector(0, 80), createVector(16, 16), noCollision)
                this.addSprite("common-block", "rotate-1", marioSprites, createVector(16, 80), createVector(16, 16), noCollision), noCollision
                this.addSprite("common-block", "rotate-2", marioSprites, createVector(32, 80), createVector(16, 16), noCollision), noCollision
                this.addSprite("common-block", "rotate-3", marioSprites, createVector(48, 80), createVector(16, 16), noCollision)
            }

            {// Init the sprites for every ground block
                this.addSprite("ground-fill", "normal", marioSprites, createVector(16 * 4, 16 * 6), createVector(16, 16), undefined, noCollision)
                this.addSprite("ground-out-corner-left", "normal", marioSprites, createVector(16 * 0, 16 * 6), createVector(16, 16), undefined,
                    (col) => {
                        if (col == 1 || col == 3) return true
                        return false
                    })

                this.addSprite("ground-out-corner-right", "normal", marioSprites, createVector(16 * 8, 16 * 6), createVector(16, 16), undefined,
                    (col) => {
                        if (col == 0 || col == 3) return true
                        return false
                    })

                this.addSprite("ground-in-corner-left", "normal", marioSprites, createVector(16 * 2, 16 * 6), createVector(16, 16), undefined,
                    (col) => {
                        return false
                    })

                this.addSprite("ground-in-corner-right", "normal", marioSprites, createVector(16 * 9, 16 * 6), createVector(16, 16), undefined,
                    (col) => {
                        return false
                    })

                this.addSprite("ground-flat-top", "normal", marioSprites, createVector(16 * 1, 16 * 6), createVector(16, 16), undefined,
                    (col) => {
                        if (col == 3) return true
                        return false
                    })

                this.addSprite("ground-flat-left", "normal", marioSprites, createVector(16 * 7, 16 * 6), createVector(16, 16), undefined,
                    (col) => {
                        if (col == 1) return true
                        return false
                    })

                this.addSprite("ground-flat-right", "normal", marioSprites, createVector(16 * 6, 16 * 6), createVector(16, 16), undefined,
                    (col) => {
                        if (col == 0) return true
                        return false
                    })

                this.addSprite("ground-flat-line-right", "normal", marioSprites, createVector(16 * 11, 16 * 6), createVector(16, 16), undefined,
                    (col) => {
                        return false
                    })

                this.addSprite("ground-flat-line-left", "normal", marioSprites, createVector(16 * 10, 16 * 6), createVector(16, 16), undefined,
                    (col) => {
                        return false
                    })

                this.addSprite("ground-flat-top-right", "normal", marioSprites, createVector(16 * 5, 16 * 6), createVector(16, 16), undefined,
                    (col) => {
                        if (col == 3)
                            return true
                        return false
                    })

                this.addSprite("ground-flat-top-left", "normal", marioSprites, createVector(16 * 3, 16 * 6), createVector(16, 16), undefined,
                    (col) => {
                        if (col == 3)
                            return true
                        return false
                    })
                // this.addSprite("question-block", "normal-2"     , marioSprites, createVector(16 , 64), createVector(16, 16), undefined, semiSolid)
                // this.addSprite("question-block", "normal-3"     , marioSprites, createVector(32 , 64), createVector(16, 16), undefined, semiSolid)
                // this.addSprite("question-block", "normal-4"     , marioSprites, createVector(48 , 64), createVector(16, 16), undefined, semiSolid)
                // this.addSprite("question-block", "hit"          , marioSprites, createVector(64 , 64), createVector(16, 16), undefined, semiSolid)

                // this.addSprite("common-block" , "normal-still" , marioSprites, createVector(0  , 80), createVector(16, 16)               )
                // this.addSprite("common-block" , "rotate-still" , marioSprites, createVector(0  , 80), createVector(16, 16))
                // this.addSprite("common-block" , "rotate-1"     , marioSprites, createVector(16 , 80), createVector(16, 16))
                // this.addSprite("common-block" , "rotate-2"     , marioSprites, createVector(32 , 80), createVector(16, 16))
                // this.addSprite("common-block" , "rotate-3"     , marioSprites, createVector(48 , 80), createVector(16, 16))
            }

            {// Init the animations for the blocks
                this.addAnimation("question-block", "normal", 8, ["normal-1", "normal-2", "normal-3", "normal-4"])
                this.addAnimation("question-block", "hit", 8, ["hit"])
                this.addAnimation("common-block", "normal", 1, ["normal-still"])
                this.addAnimation("common-block", "rotate", 6, ["rotate-still", "rotate-1", "rotate-2", "rotate-3"])

                this.addAnimation("ground-fill", "normal", 1, ["normal"])
                this.addAnimation("ground-out-corner-left", "normal", 1, ["normal"])
                this.addAnimation("ground-out-corner-right", "normal", 1, ["normal"])
                this.addAnimation("ground-in-corner-left", "normal", 1, ["normal"])
                this.addAnimation("ground-in-corner-right", "normal", 1, ["normal"])
                this.addAnimation("ground-flat-top", "normal", 1, ["normal"])
                this.addAnimation("ground-flat-left", "normal", 1, ["normal"])
                this.addAnimation("ground-flat-right", "normal", 1, ["normal"])
                this.addAnimation("ground-flat-line-left", "normal", 1, ["normal"])
                this.addAnimation("ground-flat-line-right", "normal", 1, ["normal"])
                this.addAnimation("ground-flat-top-left", "normal", 1, ["normal"])
                this.addAnimation("ground-flat-top-right", "normal", 1, ["normal"])
            }
        },
            () => {
                console.error("imageNotFound")
            })
    }

    static getAnimation(animName) {
        const originalAnimations = this.SpriteAnimations[animName]
        const originalAnimationNames = Object.keys(originalAnimations)

        const newAnimations = {}

        originalAnimationNames
            .forEach(aName => {
                newAnimations[aName] = originalAnimations[aName].clone()
            })

        return newAnimations
    }
}

Sprites.Sprites = {}
Sprites.SpriteSheet = {}
Sprites.SpriteAnimations = {}
