import { Color, IColor } from "wombat-math";
import { AnimationArray } from "../animation/animation.sequence";
import { Vector3 } from "../data/Vector3";
import { GameManager } from "./GameManager";

export class World {

  public lightColor = Vector3.of(1, 1, 1);
  private sunLight: AnimationArray<IColor>;

  constructor() {

    const sunLightFrames = [
      { t: 0 , c: '#01000E'},
      { t: 4, c: '#6564A8' },
      { t: 5 , c: '#DB818A'},
      { t: 6, c: '#FED095' },
      { t: 7, c: '#CFEEFD' },
      { t: 12, c: '#DAF4FF' },
      { t: 16, c: '#CFEEFD' },
      { t: 17, c: '#FED095' },
      { t: 18 , c: '#DB818A'},
      { t: 19, c: '#6564A8' },
      { t: 24 , c: '#01000E'}
    ].map(d => {
      return { t: d.t, data : Color.parse(d.c) as IColor };
    });

    this.sunLight = new AnimationArray<IColor>(sunLightFrames,
    (p, n, t) => {
      const color = Color.lerp(p, n, t);
      Vector3.of(color.r, color.g, color.b, this.lightColor);
    });
  }

  public update() {
    this.sunLight.update(GameManager.clock.dayFraction * GameManager.clock.hoursInDay);
  }

}
