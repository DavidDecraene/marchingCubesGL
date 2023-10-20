export class Timer {
  private delta = 0;
  public paused = false;

  constructor(public readonly time: number){

  }

  public reset(): void {
    this.delta = 0;
  }

  public update(time: number): boolean {
    if (this.paused) return false;
    this.delta += time;
    if (this.delta > this.time){
      this.delta = this.delta - this.time;
      return true;
    }
    return false;

  }


}
