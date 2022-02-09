import { quat2, ReadonlyQuat } from 'gl-matrix';

export const Rotators = {
  x: new Map<number, quat2>(),
  y: new Map<number, quat2>(),
  z: new Map<number, quat2>(),
  rotateY: function( degrees: number): ReadonlyQuat {
    let quat = this.y.get(degrees);
    if (!quat) {
      quat = quat2.create();
      quat2.rotateY(quat, quat, degrees * Math.PI / 180);
      this.y.set(degrees, quat);
    }
    return quat as ReadonlyQuat;
  },
  rotateX: function( degrees: number): ReadonlyQuat {
    let quat = this.x.get(degrees);
    if (!quat) {
      quat = quat2.create();
      quat2.rotateX(quat, quat, degrees * Math.PI / 180);
      this.x.set(degrees, quat);
    }
    return quat as ReadonlyQuat;
  },
  rotateZ: function( degrees: number): ReadonlyQuat {
    let quat = this.z.get(degrees);
    if (!quat) {
      quat = quat2.create();
      quat2.rotateZ(quat, quat, degrees * Math.PI / 180);
      this.z.set(degrees, quat);
    }
    return quat as ReadonlyQuat;
  }
};
