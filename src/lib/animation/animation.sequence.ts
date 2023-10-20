
type EndFN = () => void;

export interface Frame<State> {
  t: number;
  data: State;
}

export class AnimationArray<State> {
  constructor(public readonly frames: Array<Frame<State>>,
    public onUpdate: (prev: State, next: State, t: number) => void) {

  }

  public update(t: number) {
    // find the lowest smaller or equal to t.
    const endPos = this.frames.length - 1;
    let start = 0, end = endPos;
    while(start <= end) {
      let mid = (start + end) >> 1;
      const x = this.frames[mid];
      if (x.t < t){
        start = mid + 1;
      } else if(x.t > t) {
        end = mid - 1;
      } else {
        // found it..
        if (mid === 0) {
          this.onUpdate(x.data, this.frames[1].data, 0);
          return;
        }
        this.onUpdate( this.frames[mid - 1].data, x.data, 1);
        return;
      }
    }
    if (start === 0 ){
      this.onUpdate(this.frames[0].data, this.frames[1].data, 0);
      return;
    }
    if (start >= this.frames.length){
      this.onUpdate(this.frames[endPos-1].data, this.frames[endPos].data, 1);
      return;
    }
    const l = this.frames[start - 1];
    const h =  this.frames[start];
    const ratio = (t - l.t) /(h.t - l.t);
    this.onUpdate( l.data, h.data, ratio);
  }
}

export class AnimationSequence<State> {
  private time = 0;
  private current = 0;
  private next = 1;
  private forward = true;
  public pingpong = false;
  private paused = false;
  public loop = true;
  public onEnd: EndFN | undefined = undefined;

  constructor(public readonly frames: Array<Frame<State>>,
    public onUpdate: (prev: State, next: State, t: number) => void) {
    if(frames.length <= 1) throw new Error();
    this.current = 0;
    this.next = 1;
  }

  public update(delta: number): boolean {
    if (this.paused) return false;
    const currentFrame = this.frames[this.current];
    const nextFrame = this.frames[this.next];
    if (this.forward) {
      const time = this.time + delta;
      if (time >= nextFrame.t) {
        this.time = nextFrame.t;
        delta = time - nextFrame.t;
        // move ahead
        if (this.next >= this.frames.length - 1) {
          // no more entries.
          if (!this.loop){
            this.paused = true;
            this.onUpdate(currentFrame.data, nextFrame.data, 1);
            if(this.onEnd) this.onEnd();
            return false;
          }
          if (this.pingpong) {
            this.forward = false;
            this.current = this.next;
            this.next--;
          } else {
            this.current = 0;
            this.next = 1;
          }
          return this.update(delta);
        }
      }
      this.time = time;
      const frameLength = nextFrame.t - currentFrame.t;
      const ratio = (time - currentFrame.t) / frameLength;
      this.onUpdate(currentFrame.data, nextFrame.data, ratio);
      return true;
    }
    // backward..
    const time = this.time - delta;
    if (time <= nextFrame.t) {
      this.time = nextFrame.t;
      delta = nextFrame.t - time;
      // move ahead
      if (this.next <= 0) {
        // no more entries.
        if (!this.loop){
          this.paused = true;
          this.onUpdate(currentFrame.data, nextFrame.data, 1);
          if(this.onEnd) this.onEnd();
          return false;
        }
        if (this.pingpong) {
          this.forward = true;
          this.current = this.next;
          this.next++;
        } else {
          this.current = this.frames.length - 1;
          this.next = this.current - 1;
        }
        return this.update(delta);
      }


    }

    this.time = time;
    const frameLength = nextFrame.t - currentFrame.t;
    const ratio = (currentFrame.t - time) / frameLength;
    this.onUpdate(currentFrame.data, nextFrame.data, ratio);
    return true;
  }
}
