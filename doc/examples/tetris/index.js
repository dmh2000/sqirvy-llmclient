const canvas=document.getElementById('tetris-board')
const context=canvas.getContext('2d')
const nextCanvas=document.getElementById('next-piece-canvas')
const nextContext=nextCanvas.getContext('2d')
const scoreElement=document.getElementById('score')
const finalScoreElement=document.getElementById('final-score')
const startButton=document.getElementById('start-button')
const restartButton=document.getElementById('restart-button')
const gameOverModal=document.getElementById('game-over-modal')

const COLS=10
const ROWS=20
const BLOCK_SIZE=30
const NEXT_BLOCK_SIZE=20

canvas.width=COLS*BLOCK_SIZE
canvas.height=ROWS*BLOCK_SIZE
nextCanvas.width=4*NEXT_BLOCK_SIZE
nextCanvas.height=4*NEXT_BLOCK_SIZE

const colors=[null,'#00f0f0','#0000f0','#f0a000','#f0f000','#00f000','#a000f0','#f00000']
const tetrominoes={
  I:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
  J:[[2,0,0],[2,2,2],[0,0,0]],
  L:[[0,0,3],[3,3,3],[0,0,0]],
  O:[[4,4],[4,4]],
  S:[[0,5,5],[5,5,0],[0,0,0]],
  T:[[0,6,0],[6,6,6],[0,0,0]],
  Z:[[7,7,0],[0,7,7],[0,0,0]]
}

function createMatrix(w,h){
  const m=[]
  while(h--) m.push(new Array(w).fill(0))
  return m
}

function drawMatrix(ctx,m,offset,blockSize){
  m.forEach((row,y)=>{
    row.forEach((value,x)=>{
      if(value){
        ctx.fillStyle=colors[value]
        ctx.fillRect((x+offset.x)*blockSize,(y+offset.y)*blockSize,blockSize,blockSize)
        ctx.strokeStyle='#fff'
        ctx.strokeRect((x+offset.x)*blockSize,(y+offset.y)*blockSize,blockSize,blockSize)
      }
    })
  })
}

function merge(board,player){
  player.matrix.forEach((row,y)=>{
    row.forEach((value,x)=>{
      if(value) board[y+player.pos.y][x+player.pos.x]=value
    })
  })
}

function collide(board,player){
  const m=player.matrix
  const o=player.pos
  for(let y=0;y<m.length;y++){
    for(let x=0;x<m[y].length;x++){
      if(m[y][x]&& (board[y+o.y]&&board[y+o.y][x+o.x])!==0){
        return true
      }
    }
  }
  return false
}

function rotate(matrix,dir){
  for(let y=0;y<matrix.length;y++){
    for(let x=0;x<y;x++){
      [matrix[x][y],matrix[y][x]]=[matrix[y][x],matrix[x][y]]
    }
  }
  if(dir>0) matrix.forEach(row=>row.reverse())
  else matrix.reverse()
}

function playerRotate(dir){
  const pos=player.pos.x
  let offset=1
  rotate(player.matrix,dir)
  while(collide(board,player)){
    player.pos.x+=offset
    offset=-(offset+(offset>0?1:-1))
    if(offset>player.matrix[0].length){
      rotate(player.matrix,-dir)
      player.pos.x=pos
      return
    }
  }
}

function playerDrop(){
  player.pos.y++
  if(collide(board,player)){
    player.pos.y--
    merge(board,player)
    sweep()
    updateScore()
    playerReset()
    if(collide(board,player)){
      endGame()
    }
  }
  dropCounter=0
}

function playerMove(dir){
  player.pos.x+=dir
  if(collide(board,player)) player.pos.x-=dir
}

function hardDrop(){
  while(!collide(board,player)){
    player.pos.y++
  }
  player.pos.y--
  merge(board,player)
  sweep()
  updateScore()
  playerReset()
  if(collide(board,player)) endGame()
}

function sweep(){
  let rowCount=1
  outer: for(let y=board.length-1;y>=0;y--){
    for(let x=0;x<board[y].length;x++){
      if(board[y][x]===0) {
        continue outer
      }
    }
    const row=board.splice(y,1)[0].fill(0)
    board.unshift(row)
    y++
    player.lines+=rowCount
    score+=rowCount*10
    rowCount*=2
  }
}

function update(t=0){
  const deltaTime = t-lastTime
  lastTime=t
  if(!paused){
    dropCounter+=deltaTime
    if(dropCounter>dropInterval) playerDrop()
    context.fillStyle='#f8fafc'
    context.fillRect(0,0,canvas.width,canvas.height)
    drawMatrix(context,board,{x:0,y:0},BLOCK_SIZE)
    drawMatrix(context,player.matrix,player.pos,BLOCK_SIZE)
    drawNext()
  }
  if(!gameOverFlag) requestAnimationFrame(update)
}

function drawNext(){
  nextContext.fillStyle='#f8fafc'
  nextContext.fillRect(0,0,nextCanvas.width,nextCanvas.height)
  drawMatrix(nextContext,nextMatrix,{x:0,y:0},NEXT_BLOCK_SIZE)
}

function playerReset(){
  player.matrix=nextMatrix
  nextMatrix=createPiece()
  player.pos.y=0
  player.pos.x=(COLS>>1)-(player.matrix[0].length>>1)
}

function createPiece(){
  const types='IJLOSTZ'
  const type=types[Math.random()*types.length|0]
  return tetrominoes[type].map(row=>row.slice())
}

function updateScore(){
  scoreElement.textContent=score
}

function startGame(){
  board=createMatrix(COLS,ROWS)
  score=0
  player={pos:{x:0,y:0},matrix:null,lines:0}
  nextMatrix=createPiece()
  playerReset()
  updateScore()
  gameOverFlag=false
  paused=false
  lastTime=0
  dropCounter=0
  dropInterval=1000
  gameOverModal.style.display='none'
  requestAnimationFrame(update)
}

function endGame(){
  gameOverFlag=true
  finalScoreElement.textContent=score
  gameOverModal.style.display='flex'
}

document.addEventListener('keydown',event=>{
  if(event.key==='ArrowLeft') playerMove(-1)
  else if(event.key==='ArrowRight') playerMove(1)
  else if(event.key==='ArrowDown') playerDrop()
  else if(event.key==='ArrowUp') playerRotate(1)
  else if(event.key===' ') hardDrop()
  else if(event.key.toLowerCase()==='p') paused=!paused
})

startButton.addEventListener('click',startGame)
restartButton.addEventListener('click',startGame)

let board=createMatrix(COLS,ROWS)
let player={}
let nextMatrix=createPiece()
let dropCounter=0
let dropInterval=1000
let lastTime=0
let score=0
let paused=false
let gameOverFlag=false
