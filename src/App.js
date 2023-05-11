import './App.css';
import React, { Component, createRef } from 'react';

const HEIGHT = 500;
const WIDTH = 800;
const PIPE_WIDTH = 60;
const PIPE_SPACE = 80;
const MIN_PIPE_HEIGHT = 40;
const MAX_PIPE_HEIGHT = HEIGHT - PIPE_SPACE - MIN_PIPE_HEIGHT;
const FPS = 144;

class Bird {
  constructor(ctx) {
    this.ctx = ctx;
    this.x = 150;
    this.y = 150;
    this.gravity = 0.1;
    this.velocity = 0;
  }

  draw() {
    this.ctx.fillStyle = "red";
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, 15, 0, 2 * Math.PI);
    this.ctx.fill();
  }

  update() {
    /* this.velocity += this.gravity;
    if(this.velocity > 1) {
      this.velocity = 1;
    }
    this.y += this.velocity; */
    this.velocity += this.gravity;
    this.y += this.velocity;
  }

  jump = () => {
    this.velocity = -4;
  }
}


class Pipe {
  constructor(ctx, height, space) {
    this.ctx = ctx;
    this.isDead = false;
    this.x = WIDTH;
    this.y = height ? HEIGHT - height : 0;
    this.width = PIPE_WIDTH;
    this.height = height || Math.random() * (MAX_PIPE_HEIGHT - MIN_PIPE_HEIGHT) + MIN_PIPE_HEIGHT;
  }

  draw() {
    this.ctx.fillStyle = "#000";
    this.ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  update = () => {
    this.x -= 1;
    if (this.x + PIPE_WIDTH < 0) {
      this.isDead = true;
    }
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
    this.frameCount = 0;
    this.space = 120;
    this.pipes = [];
    this.birds = [];
  }

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown);
    const ctx = this.getContext();
    this.pipes = this.generatePipes();
    this.birds = [new Bird(ctx)];
    this.loop = setInterval(this.gameLoop, 1000 / FPS);
  }

  onKeyDown = (e) => {
    if (e.code === 'Space') {
      this.birds[0].jump();
    }
  }

  getContext = () => this.canvasRef.current.getContext("2d");

  generatePipes = () => {
    const ctx = this.getContext();
    const firstPipe = new Pipe(ctx, null, this.space);
    const secondPipeHeight = HEIGHT - firstPipe.height - this.space;
    const secondPipe = new Pipe(ctx, secondPipeHeight, 80);
    return [firstPipe, secondPipe];
  }

  gameLoop = () => {
    this.update();
    this.draw();
  }

  update = () => {
    this.frameCount = this.frameCount + 1;
    if (this.frameCount % 320 === 0) {
      const pipes = this.generatePipes();
      this.pipes.push(...pipes);
    }

    // update pipe positions
    this.pipes.forEach(pipe => pipe.update());
    this.pipes = this.pipes.filter(pipe => !pipe.isDead);

    // update bird positions
    this.birds.forEach(bird => bird.update());

    if (this.isGameOver()) {
      alert('game over');
      clearInterval(this.loop);
    }
  }

  isGameOver = () => {
    // detect collisions
    let gameOver = false;
    this.birds.forEach(bird => {
      this.pipes.forEach(pipe => {
        const pipeTopLeft = { x: pipe.x, y: pipe.y };
        const pipeTopRight = { x: pipe.x + pipe.width, y: pipe.y };
        const pipeBottomLeft = { x: pipe.x, y: pipe.y + pipe.height };
        const pipeBottomRight = { x: pipe.x + pipe.width, y: pipe.y + pipe.height };
        if ( bird.y < 0 || bird.y > HEIGHT ||
          (bird.x > pipeTopLeft.x && bird.x < pipeTopRight.x && bird.y > pipeTopLeft.y && bird.y < pipeBottomLeft.y)
        ) {
          console.log('game over');
          gameOver = true;
        }
      });
    });
    return gameOver;
  }

  draw() {
    const ctx = this.canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    this.pipes.forEach(pipe => pipe.draw());
    this.birds.forEach(bird => bird.draw());
  }



  render() {
    return (
      <div className="App">
        <canvas ref={this.canvasRef}
          width={WIDTH}
          height={HEIGHT}
          style={{ marginTop: '24px', border: '2px solid #000' }}>
          Your browser does not support the HTML canvas tag.
        </canvas>
      </div>
    );
  }
}

export default App;
