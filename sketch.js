let marioFont

let gravity

let paused = false

let pauseSound
let jumpSound
let rotateSound

let backg

let theGame

let debug = false

function preload(){
    pauseSound  = loadSound('resources/sounds/pause.wav'      )
    jumpSound   = loadSound('resources/sounds/jump.wav'       )
    rotateSound = loadSound('resources/sounds/spin_jump.wav'  )

    marioFont   = loadFont ('resources/Super-Mario-World.ttf' )

    backg       = loadImage ('resources/Background - Level.png' )
    Sprites.setupSprites()
}

function restart(){
    createCanvas(canvasSz.x * gameScale, canvasSz.y * gameScale)

    theGame = new Game("GroundMap")
    loop()
}

const gameScale = 2

const canvasSz = {x: 20*16, y: 20*16}
function setup(){
    restart()
}

function draw() {
    textFont(marioFont)
    background(255)

    scale(gameScale)
    noSmooth()

    theGame.update()
    theGame.render()
}

function keyPressed(){
    if (keyCode == 13){
        paused = !paused

        if (paused){
            noLoop()
        }else{
            loop()
        }

        pauseSound.play()
    } else if (keyCode == 78){
        restart()
    }

    return false
}

window.addEventListener('blur', ()=>{
    paused = true
    pauseSound.play()
    noLoop()
})

window.addEventListener('focus', ()=>{
    paused = false
    pauseSound.play()
    loop()
})