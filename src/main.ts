import * as utils from "./utils";
import { DesmosFourierSeries } from "./desmosEquations";

import "./style.css";

// compute fourier series
const X = [];
const Y = [];
for (let i = 0; i < 2 * Math.PI; i += 0.001) {
  X.push(20 * Math.cos(i) * (Math.cos(i / 2)) ** 2 + 20 + Math.sin(i));
  Y.push(20 * Math.sin(i) * (Math.cos(i / 2)) ** 2 + 20);
}
const FS = new DesmosFourierSeries(X, Y);
console.log(FS.getDesmosExpanded(30));
console.log(FS.getDesmosList(30));


// define vector type
type vec = { x: number, y: number; };

/*
const sketch = (p5: P5) => {

  // size of sections of sketch
  let dim: vec;
  let mainPos: vec, mainSize: vec;
  
  // location in coordinate plane
  let origin: vec;
  let scale: number;

  // draw fourier series
  const drawFS = (fs: DesmosFourierSeries, terms: number = -1) => {
    const { x, y } = fs.getFunc(terms);
    let oldPos: vec = toPos({ x: x(0), y: y(0) });
    for (let t = 0.05; t < 2 * p5.PI; t += 0.05) {
      const pos: vec = toPos({ x: x(t), y: y(t) });
      p5.line(oldPos.x, oldPos.y, pos.x, pos.y);

      oldPos = pos;
    }
    const pos: vec = toPos({ x: x(0), y: y(0) });
    p5.line(oldPos.x, oldPos.y, pos.x, pos.y);
  };

  // to coordinates (from screen position)
  const toCoords = (pos: vec): vec => {
    return {
      x: origin.x + scale * (pos.x - mainPos.x),
      y: origin.y + scale * (mainPos.y + mainSize.y - pos.y)
    };
  };

  // to screen position (from coordinates)
  const toPos = (coords: vec): vec => {
    return {
      x: (coords.x - origin.x) / scale + mainPos.x,
      y: mainPos.y + mainSize.y - (coords.y - origin.y) / scale
    };
  };

  // update size of main frame
  const updateSize = () => {
    dim = { x: p5.width, y: p5.height };
    mainPos = { x: 50, y: 50 };
    mainSize = { x: dim.x - 100, y: dim.y - 100 };
  };


  p5.setup = () => {
    const canvas = p5.createCanvas(window.innerWidth, window.innerHeight);
    canvas.parent("app");

    p5.frameRate(30);

    updateSize();

    scale = 50 / Math.min(mainSize.x, mainSize.y);
    origin = { x: 0, y: 0 };

    p5.noCursor();
  };

  p5.draw = () => {

    updateSize();

    p5.background(170);

    // grid
    const maxCoords: vec = toCoords({ x: mainPos.x + mainSize.x, y: mainPos.y });
    const gridSpacing: number = p5.min(p5.pow(10, p5.round(p5.log(p5.min(maxCoords.x - origin.x, maxCoords.y - origin.y) / 10) / p5.log(10), 0)), 100);
    const roundPlaces: number = p5.max(0, -p5.round(p5.log(gridSpacing) / p5.log(10)));
    let currGrid: vec = { x: origin.x - origin.x % gridSpacing, y: origin.y - origin.y % gridSpacing };
    let eqPos: vec = toPos(currGrid);

    p5.fill(100);
    p5.textSize(14);
    while (eqPos.x <= mainPos.x + mainSize.x || eqPos.y >= mainPos.y) {
      
      if (eqPos.x >= mainPos.x && eqPos.x < mainPos.x + mainSize.x) {
        if (p5.round(currGrid.x, roundPlaces) == 0) {
          p5.strokeWeight(2);
          p5.stroke(0);
        } else {
          p5.strokeWeight(1);
          p5.stroke(100);
        }
        p5.line(eqPos.x, mainPos.y + mainSize.y, eqPos.x, mainPos.y);

        p5.noStroke();
        p5.text(p5.round(currGrid.x, roundPlaces), eqPos.x + 5, mainPos.y + mainSize.y - 5);
      }

      if (eqPos.y > mainPos.y && eqPos.y <= mainPos.y + mainSize.y) {
        p5.stroke(100);
        if (p5.round(currGrid.y, roundPlaces) == 0) {
          p5.strokeWeight(2);
          p5.stroke(0);
        } else {
          p5.strokeWeight(1);
          p5.stroke(100);
        }
        p5.line(mainPos.x, eqPos.y, mainPos.x + mainSize.x, eqPos.y);

        p5.noStroke();
        p5.text(p5.round(currGrid.y, roundPlaces), mainPos.y + 5, eqPos.y - 5);
      }
      
      
      currGrid = { x: currGrid.x + gridSpacing, y: currGrid.y + gridSpacing };
      eqPos = toPos(currGrid);
    }


    // cursor
    p5.strokeWeight(2);
    p5.stroke(50);
    p5.line(p5.mouseX - 5, p5.mouseY, p5.mouseX + 5, p5.mouseY);
    p5.line(p5.mouseX, p5.mouseY - 5, p5.mouseX, p5.mouseY + 5);

    p5.textSize(14);
    p5.fill(100);
    p5.noStroke();
    const coords: vec = toCoords({ x: p5.mouseX, y: p5.mouseY });
    p5.text(p5.round(coords.x, roundPlaces) + ", " + p5.round(coords.y, roundPlaces), p5.mouseX + 5, p5.mouseY - 5);

    // draw Fourier Series
    p5.stroke(0);
    p5.strokeWeight(5);
    drawFS(FS);

  };

  p5.mousePressed = () => {
    const m: vec = { x: p5.mouseX - mainPos.x, y: p5.mouseY - mainPos.y };
    if (
      m.x >= 0 &&
      m.x < mainSize.x &&
      m.y >= 0 &&
      m.y < mainSize.y
    ) {
      console.log(m);
    }
  };

  p5.mouseDragged = (event: { movementX: number, movementY: number; }) => {
    origin.x -= event.movementX * scale;
    origin.y += event.movementY * scale;
  };

  p5.mouseWheel = (event: { delta: number; }) => {
    const origMouseCoords: vec = toCoords({ x: p5.mouseX, y: p5.mouseY });
    let shift: number = event.delta;
    if (p5.abs(shift) > 20) {
      shift *= 20 / p5.abs(shift);
    }
    if (shift < 0 && scale < 0.001) {
      return;
    } else if (shift > 0 && scale > 3) {
      return;
    }
    const factor: number = p5.pow(1.002, shift);
    scale *= factor;
    const finalMouseCoords: vec = toCoords({ x: p5.mouseX, y: p5.mouseY });
    let originShift: vec = { x: origMouseCoords.x - finalMouseCoords.x, y: origMouseCoords.y - finalMouseCoords.y };
    origin.x += originShift.x;
    origin.y += originShift.y;
  };

  p5.windowResized = () => {
    p5.resizeCanvas(window.innerWidth, window.innerHeight);
  };

};
*/

abstract class Sketch {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d")!;
  }

  /**
   * Run once for initialization
   */
  abstract setup(): void;

  /**
   * Draws sketch, run repeatedly
   */
  abstract draw(): void;

  /**
   * Update sketch, run repeatedly
   */
  abstract update(): void;

  /**
   * Creates event listeners for user input
   */
  abstract createEventListeners(): void;

  /**
   * Call this method to run the sketch
   */
  run() {
    this.setup();
    this.createEventListeners();
    const drawFunc = ()=>{
      requestAnimationFrame(drawFunc);
      this.update();
      this.draw();
    }
    drawFunc();
  }
}


class MainSketch extends Sketch {
  x: number = 0;
  ball: vec = {x:0, y:0};

  static rgbToHex(r: number, g: number, b: number): string {
    r = Math.floor(r < 0 ? 0 : (r > 255 ? 255 : r));
    g = Math.floor(g < 0 ? 0 : (g > 255 ? 255 : g));
    b = Math.floor(b < 0 ? 0 : (b > 255 ? 255 : b));

    return "#" + r.toString(16).padStart(2, "0") + g.toString(16).padStart(2, "0") + b.toString(16).padStart(2, "0");
  }

  setup() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  draw() {
    const width = this.canvas.width;
    const height = this.canvas.height;

    this.ctx.fillStyle = MainSketch.rgbToHex(255, 255, 255);
    this.ctx.fillRect(0, 0, width, height);

    this.ctx.fillStyle = MainSketch.rgbToHex(this.x, 0, 0);
    this.ctx.fillRect(width / 4, height / 4, width / 2, height / 2);


    this.ctx.fillStyle = MainSketch.rgbToHex(0, 0, 255);
    this.ctx.beginPath();
    this.ctx.ellipse(this.ball.x,this.ball.y,30,30,0,0,utils.TWO_PI);
    this.ctx.fill();
  }

  update(){
    this.ball.x = (this.ball.x + 6)%this.canvas.width;
    this.ball.y = (this.ball.y + 3)%this.canvas.height;
  }

  createEventListeners() {

    addEventListener("resize", () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.x += 1;
      this.draw();
    });

  }
}

(new MainSketch(<HTMLCanvasElement>document.getElementById("sketch"))).run();
