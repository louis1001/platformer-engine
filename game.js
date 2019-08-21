function sign(x){
    return x / abs(x)
}

function fillArray(num, obj=null){
    const newArr = new Array(num)

    for(let i = 0; i < num; i++){
        if (obj){
            newArr[i] = obj();
        } else {
            newArr[i] = null;            
        }
    }

    return newArr
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
    "F6B55DFF": {
        type:       "block",
        name:       "ground-fill"
    },
    "F9471FFF": {
        type:       "block",
        name:       "ground-out-corner-left"
    },
    "261FF9FF": {
        type:       "block",
        name:       "ground-out-corner-right"
    },
    "09DE23FF": {
        type:       "block",
        name:       "ground-in-corner-left"
    },
    "0AF3C9FF": {
        type:       "block",
        name:       "ground-in-corner-right"
    },
    "AA00FFFF": {
        type:       "block",
        name:       "ground-flat-top"
    },
    "FC653CFF": {
        type:       "block",
        name:       "ground-flat-left"
    },
    "0963DEFF": {
        type:       "block",
        name:       "ground-flat-right"
    },
    "2D2C2DFF": {
        type:       "block",
        name:       "ground-flat-line-right"
    },
    "767178FF": {
        type:       "block",
        name:       "ground-flat-line-left"
    },
    "55005AFF": {
        type:       "block",
        name:       "ground-flat-top-right"
    },
    "F000FFFF": {
        type:       "block",
        name:       "ground-flat-top-left"
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

        this.gravity = createVector(0, 0.5 * 60)

        this.map = loadImage("resources/maps/" + mapName + ".png", this.setupImageMap.bind(this))

        this.controls = {
            jump  : 32,
            rotate: 68,
            run   : SHIFT,
            left  : LEFT_ARROW,
            right : RIGHT_ARROW,
            up    : UP_ARROW,
            down  : DOWN_ARROW
        }

        GameObject.getTile = (_x, _y)=>{
            const x = Math.floor(_x)
            const y = Math.floor(_y)
            if (x >= 0 && x < this.map.width &&
                y >= 0 && y < this.map.height){
                return this.mapGrid[x][y]
            }
        }
    }

    setupImageMap(imageMap){
        this.mapGrid = fillArray(imageMap.width, ()=>fillArray(imageMap.height))

        for (let j = 0; j < imageMap.height; j++){
            for (let i = 0; i < imageMap.width; i++){
                const currentPixel = imageMap.get(i, j)
                if(currentPixel.filter(x=>x).length){

                    const hexColor = fromArrayToColor(currentPixel)

                    const objectFromPixel = colorToObject[hexColor]

                    if (!objectFromPixel){
                        console.error("Unknown Block X. Error in the map.\n"+hexColor)
                        console.log("At (" + i + ", " + j + ")")
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

                            this.mapGrid[i][j] = newBlock

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
        if (this.players[0]){
            image(backg, this.players[0].pos.x, 0)
        }

        this.gameObjects.forEach(x => {
            x.draw()
        })
    }

    update(){
        // this.blocks.forEach(x => {
        //     x.applyForce(this.gravity)
        // })

        this.entities.forEach(x => {
            x.applyForce(this.gravity)
        })

        this.blocks.forEach(x => {
            x.update()
        })

        this.entities.forEach((x, i) => {
            x.update(this.gameObjects.map(b=>b.getCurrentCollider()), this.mapGrid)
        })
    }

}
