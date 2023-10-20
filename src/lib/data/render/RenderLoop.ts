import { Time } from '../time/Time';



export class RenderLoop {

  public pause = false;

  private renderBind = this.render.bind(this);


  constructor(
    private readonly drawFn: () => void){

  }

  private render(now: number) {
    Time.update(now, this.pause);
    if (this.pause) {
      requestAnimationFrame(this.renderBind);
      return;
    }
    this.drawFn();
    requestAnimationFrame(this.renderBind);
  }

  public start() {
    requestAnimationFrame(this.renderBind);
  }

}
