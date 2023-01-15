import P5 from "p5";

import "./style.css";

const sketch = (p5: P5) => {
  let red: int = 0;
  let redAdder: int = 5;

  p5.setup = () => {
    const canvas = p5.createCanvas(500, 500);
    canvas.parent("app");
  };

  p5.draw = () => {
    p5.background(0,0,0);

    p5.fill(red,0,0);
    p5.noStroke();
    p5.ellipse(100,100,50,50);

    red += redAdder;
    if (red < 0 || red > 250){
      redAdder *= -1;
    }

  };
};

new P5(sketch);
