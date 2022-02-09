import { Rotators } from "../utils/Rotators";
import { vec3 } from 'gl-matrix';


export class Polygon {
  public points: Array<Array<number>> = [];
  constructor() {

  }

  rotateZ(degrees: number) {
    if (!degrees) { return this; }
    const quat = Rotators.rotateZ(degrees);
    this.points.forEach(p => vec3.transformQuat(p as vec3, p as vec3, quat));
    return this;
  }

  rotateY(degrees: number) {
    if (!degrees) { return this; }
    const quat = Rotators.rotateY(degrees);
    this.points.forEach(p => vec3.transformQuat(p as vec3, p as vec3, quat));
    return this;
  }

  rotateX(degrees: number) {
    if (!degrees) { return this; }
    const quat = Rotators.rotateX(degrees);
    this.points.forEach(p => vec3.transformQuat(p as vec3, p as vec3, quat));
    return this;
  }

  left() {
    return this.rotateY(-90);
  }

  right() {
    return this.rotateY(90);
  }

  back() {
    return  this.rotateY(180);
  }

  top() {
    return  this.rotateX(-90);
  }

  bottom() {
    return this.rotateX(90);

  }
}
