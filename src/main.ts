import * as utils from "./utils";
import { DesmosFourierSeries } from "./desmosEquations";

import "./style.css";

function rgbToHex(r: number, g: number, b: number): string {
  r = utils.floor(r < 0 ? 0 : (r > 255 ? 255 : r));
  g = utils.floor(g < 0 ? 0 : (g > 255 ? 255 : g));
  b = utils.floor(b < 0 ? 0 : (b > 255 ? 255 : b));

  return "#" + r.toString(16).padStart(2, "0") + g.toString(16).padStart(2, "0") + b.toString(16).padStart(2, "0");
}
// colors
namespace Colors {
  export const Background = rgbToHex(170, 170, 170);
  export const Black = rgbToHex(0, 0, 0);
  export const LightGray = rgbToHex(100, 100, 100);
  export const DarkGray = rgbToHex(70, 70, 70);
}


// define vector type
type vec = { x: number, y: number; };


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
    const drawFunc = () => {
      requestAnimationFrame(drawFunc);
      this.update();
      this.draw();
    };
    drawFunc();
  }
}


class MainSketch extends Sketch {
  // size of sections of sketch
  dim: vec = { x: 0, y: 0 };
  mainPos: vec = { x: 0, y: 0 };
  mainSize: vec = { x: 0, y: 0 };

  // location in coordinate plane
  origin: vec = { x: 0, y: 0 };
  scale: number = 1;

  // mouse information
  mouseIsDown: boolean = false;
  mouse: vec = { x: 0, y: 0 };

  drawing: boolean = false;

  // Fourier Series information
  X: number[] = [];
  Y: number[] = [];
  FS: DesmosFourierSeries | null = null;
  addCoordsToData(coords: vec, xData: number[], yData: number[]) {
    if (xData.length == 0) {
      xData.push(coords.x);
      yData.push(coords.y);
    } else {
      const last = { x: xData[xData.length - 1], y: yData[xData.length - 1] };
      const dist = utils.sqrt(utils.pow(coords.x - last.x, 2) + utils.pow(coords.y - last.y, 2));
      for (let a: number = 1; a <= dist + 0.2; a++) {
        xData.push(last.x + (coords.x - last.x) * a / dist);
        yData.push(last.y + (coords.y - last.y) * a / dist);
      }
      //xData.push(coords.x);
      //yData.push(coords.y);
    }
  }
  copyDesmos() {
    if (this.FS != null) {
      const desmosFormula = this.FS.getDesmosList(30);//this.FS.getDesmosExpanded(30);
      window.navigator.clipboard.writeText(desmosFormula);
      setTimeout(alert, 100, "copied!");
    }
  }


  updateSize() {
    this.dim = { x: this.canvas.width, y: this.canvas.height };
    this.mainPos = { x: 50, y: 50 };
    this.mainSize = { x: this.dim.x - 100, y: this.dim.y - 100 };
  }

  // to coordinates (from screen position)
  toCoords(pos: vec): vec {
    return {
      x: this.origin.x + this.scale * (pos.x - this.mainPos.x),
      y: this.origin.y + this.scale * (this.mainPos.y + this.mainSize.y - pos.y)
    };
  }

  // to screen position (from coordinates)
  toPos(coords: vec): vec {
    return {
      x: (coords.x - this.origin.x) / this.scale + this.mainPos.x,
      y: this.mainPos.y + this.mainSize.y - (coords.y - this.origin.y) / this.scale
    };
  }

  // draw line
  line(x1: number, y1: number, x2: number, y2: number) {
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
  }

  setup() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.updateSize();
    this.scale = 50 / utils.min(this.mainSize.x, this.mainSize.y);

  }

  draw() {
    // draw background
    this.ctx.fillStyle = Colors.Background;
    this.ctx.fillRect(0, 0, this.dim.x, this.dim.y);

    // grid
    const maxCoords: vec = this.toCoords({ x: this.mainPos.x + this.mainSize.x, y: this.mainPos.y });
    const gridSpacing: number = utils.min(utils.pow(10, utils.round(utils.log(utils.min(maxCoords.x - this.origin.x, maxCoords.y - this.origin.y) / 10) / utils.log(10), 0)), 100);
    const roundPlaces: number = utils.max(0, -utils.round(utils.log(gridSpacing) / utils.log(10), 0));
    let currGrid: vec = { x: this.origin.x - this.origin.x % gridSpacing, y: this.origin.y - this.origin.y % gridSpacing };
    let eqPos: vec = this.toPos(currGrid);

    this.ctx.fillStyle = Colors.LightGray;
    this.ctx.font = "14px Arial";

    while (eqPos.x <= this.mainPos.x + this.mainSize.x || eqPos.y >= this.mainPos.y) {
      
      if (eqPos.x >= this.mainPos.x && eqPos.x < this.mainPos.x + this.mainSize.x) {
        if (utils.round(currGrid.x, roundPlaces) == 0) {
          this.ctx.lineWidth = 2;
          this.ctx.strokeStyle = Colors.Black;
        } else {
          this.ctx.lineWidth = 1;
          this.ctx.strokeStyle = Colors.LightGray;
        }
        this.ctx.beginPath();
        this.line(eqPos.x, this.mainPos.y + this.mainSize.y, eqPos.x, this.mainPos.y);
        this.ctx.stroke();

        this.ctx.fillText(utils.round(currGrid.x, roundPlaces).toString(), eqPos.x + 5, this.mainPos.y + this.mainSize.y - 5);
      }

      
      if (eqPos.y > this.mainPos.y && eqPos.y <= this.mainPos.y + this.mainSize.y) {
        if (utils.round(currGrid.y, roundPlaces) == 0) {
          this.ctx.lineWidth = 2;
          this.ctx.strokeStyle = Colors.Black;
        } else {
          this.ctx.lineWidth = 1;
          this.ctx.strokeStyle = Colors.LightGray;
        }
        this.ctx.beginPath();
        this.line(this.mainPos.x, eqPos.y, this.mainPos.x + this.mainSize.x, eqPos.y);
        this.ctx.stroke();

        this.ctx.fillText(utils.round(currGrid.y, roundPlaces).toString(), this.mainPos.y + 5, eqPos.y - 5);
      }
      
      
      currGrid = { x: currGrid.x + gridSpacing, y: currGrid.y + gridSpacing };
      eqPos = this.toPos(currGrid);
    }

    // cursor
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = Colors.DarkGray;
    this.ctx.beginPath();
    this.line(this.mouse.x - 5, this.mouse.y, this.mouse.x + 5, this.mouse.y);
    this.line(this.mouse.x, this.mouse.y - 5, this.mouse.x, this.mouse.y + 5);
    this.ctx.stroke();

    this.ctx.fillStyle = Colors.DarkGray;
    const coords: vec = this.toCoords(this.mouse);
    this.ctx.fillText(utils.round(coords.x, roundPlaces + 1) + ", " + utils.round(coords.y, roundPlaces + 1), this.mouse.x + 5, this.mouse.y - 5);


    // draw fs
    if (this.FS != null) {
      const func = this.FS.getFunc(30);

      this.ctx.strokeStyle = Colors.LightGray;
      this.ctx.lineWidth = 2;

      this.ctx.beginPath();
      const pos = this.toPos({ x: func.x(0), y: func.y(0) });
      this.ctx.moveTo(pos.x, pos.y);
      for (let t: number = 0; t < utils.TWO_PI; t += 0.01) {
        const pos = this.toPos({ x: func.x(t), y: func.y(t) });
        this.ctx.lineTo(pos.x, pos.y);
      }
      this.ctx.closePath();
      this.ctx.stroke();
    }


    // draw current path
    this.ctx.strokeStyle = Colors.LightGray;
    this.ctx.lineWidth = 2;

    this.ctx.beginPath();
    const pos = this.toPos({ x: this.X[0], y: this.Y[0] });
    this.ctx.moveTo(pos.x, pos.y);
    for (let i: number = 0; i < this.X.length; i++) {
      const pos = this.toPos({ x: this.X[i], y: this.Y[i] });
      this.ctx.lineTo(pos.x, pos.y);
    }
    this.ctx.stroke();

  }

  update() {
    this.updateSize();

    if (this.X.length > 50) {
      const X = [...this.X];
      const Y = [...this.Y];
      this.addCoordsToData({ x: X[0], y: Y[0] }, X, Y);
      this.FS = new DesmosFourierSeries(X, Y);
    }
  }

  createEventListeners() {

    addEventListener("resize", () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.draw();
    });

    addEventListener("wheel", (event: WheelEvent) => {
      const origMouseCoords: vec = this.toCoords({ x: event.clientX, y: event.clientY });
      let shift: number = utils.abs(event.deltaX) > utils.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (utils.abs(shift) > 20) {
        shift *= 20 / utils.abs(shift);
      }
      if (shift < 0 && this.scale < 0.001) {
        return;
      } else if (shift > 0 && this.scale > 3) {
        return;
      }
      const factor: number = utils.pow(1.002, shift);
      this.scale *= factor;
      const finalMouseCoords: vec = this.toCoords({ x: event.clientX, y: event.clientY });
      let originShift: vec = { x: origMouseCoords.x - finalMouseCoords.x, y: origMouseCoords.y - finalMouseCoords.y };
      this.origin.x += originShift.x;
      this.origin.y += originShift.y;
    });

    addEventListener("mousedown", () => {
      this.mouseIsDown = true;
    });

    addEventListener("mousemove", (event) => {
      this.mouse.x = event.clientX;
      this.mouse.y = event.clientY;
      if (this.mouseIsDown) {
        this.origin.x -= event.movementX * this.scale;
        this.origin.y += event.movementY * this.scale;
      } else if (this.drawing) {
        this.addCoordsToData(this.toCoords({ x: this.mouse.x, y: this.mouse.y }), this.X, this.Y);
      }
    });

    addEventListener("mouseup", () => {
      this.mouseIsDown = false;
    });

    addEventListener("keypress", (event) => {
      switch (event.key) {
        case "a":
          this.addCoordsToData(this.toCoords({ x: this.mouse.x, y: this.mouse.y }), this.X, this.Y);
          break;
        case "e":
          this.copyDesmos();
          break;
      }
    });

    addEventListener("keydown", (event) => {
      switch (event.key) {
        case "d":
          this.drawing = true;
          break;
      }
    });

    addEventListener("keyup", (event) => {
      switch (event.key) {
        case "d":
          this.drawing = false;
          break;
      }
    });

  }
}

(new MainSketch(<HTMLCanvasElement>document.getElementById("sketch"))).run();
