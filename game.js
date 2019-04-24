function sign(x){
    return x / abs(x)
}

function fromArrayToColor(cRGB) {
    let hexColor = ""

    cRGB.forEach(x => {
        hexColor += hex(x, 2)
    })

    return hexColor
}

const colorToObject = {
    "FFFF00FF": {
        type:       "block",
        name:       "common-block"
    },
    "E3D346FF": {
        type:       "block",
        name:       "question-block"
    },
    "856B22FF": {
        type:       "spawn",
        direction:  "right"
    },
    "85227EFF": {
        type:       "spawn",
        direction:  "left"
    }
}

class Game{
    constructor(mapName = "first-map"){
        this.players = []
        this.entities = []
        this.gameObjects = []
        this.blocks = []
        this.spawnPoints = []

        this.gravity = createVector(0, 0.5)

        this.map = loadImage("resources/maps/" + mapName + ".png", this.setupMap.bind(this))

        this.controls = {
            jump  : 32,
            rotate: 68,
            run   : SHIFT,
            left  : LEFT_ARROW,
            right : RIGHT_ARROW,
            up    : UP_ARROW,
            down  : DOWN_ARROW
        }
    }

    setupMap(imageMap){
        for (let j = 0; j < imageMap.height; j++){
            for (let i = 0; i < imageMap.width; i++){
                const currentPixel = imageMap.get(i, j)
                if(currentPixel.filter(x=>x).length){

                    const hexColor = fromArrayToColor(currentPixel)

                    const objectFromPixel = colorToObject[hexColor]

                    if (!objectFromPixel){
                        console.error("Unknown Block X. Error in the map.\n"+hexColor)
                        continue
                    }

                    switch (objectFromPixel.type){
                        case "spawn":
                            this.spawnPoints.push(
                                {
                                    pos: createVector(i * 16, j * 16),
                                    direction: objectFromPixel.direction === "left"
                                }
                            )
                            break

                        case "block":
                            const newBlock = new Block(
                                objectFromPixel.name,
                                createVector(i * 16, j * 16)
                            )

                            this.gameObjects.push(newBlock)
                            this.blocks.push(newBlock)
                            break
                    }
                }
            }
        }

        this.spawnPlayer()
    }

    spawnPlayer(){
        const chosenSpawn = random(this.spawnPoints)
        if (!chosenSpawn){
            return
        }

        const newPlayer = new Character(
            "mario",
            createVector(chosenSpawn.pos.x, chosenSpawn.pos.y)
        )

        newPlayer.direction = chosenSpawn.direction

        newPlayer.animations.jump  .addEventListener('start', () => jumpSound  .play())
        newPlayer.animations.rotate.addEventListener('start', () => rotateSound.play())

        this.entities.push(newPlayer)
        this.gameObjects.push(newPlayer)
        this.players.push(newPlayer)

        return newPlayer
    }

    render(){
        this.gameObjects.forEach(x => {
            x.draw()
        })
    }

    update(){
        this.blocks.forEach(x => {
            x.applyForce(this.gravity)
        })

        this.entities.forEach(x => {
            x.applyForce(this.gravity)
        })

        this.blocks.forEach(x => {
            x.update()
        })

        this.entities.forEach((x, i) => {
            x.update(this.gameObjects.map(b=>b.getCurrentCollider()))
        })
    }

}
