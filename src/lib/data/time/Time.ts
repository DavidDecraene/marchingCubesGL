import { MovingAverage } from "wombat-math";

class TimeImpl {
  private _delta = 0;
  private _frame = 0;
  private _time = 0;
  private fpsCount = new MovingAverage(60);


  public get deltaTime(): number {
    return this._delta;
  }

  public get time(): number {
    return this._time;
  }

  public get frame(): number {
    return this._frame;
  }

  public get fps(): number {
    return Math.round(this.fpsCount.value);
  }

  constructor(){

  }



  public update(render: number, paused = false) {
    render *= 0.001;  // convert to seconds
    if (!paused) this._frame++;
    if(this._time) {
      this._delta = render - this._time;
    }
    this._time = render;
    if (!paused ) {
        const fps = this._delta ? 1/this._delta : 0;
        this.fpsCount.add(fps);
    }

  }
}


export const Time = new TimeImpl();
