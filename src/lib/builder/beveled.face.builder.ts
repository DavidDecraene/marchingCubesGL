import { States } from "../constants/states";
import { Quad } from "../data/Quad";
import { Triangle } from "../data/Triangle";
import { VoxelBuilder } from "./voxel.builder";

export class BeveledFaceBuilder {

  constructor(private builder: VoxelBuilder){

  }

  private createBevel1Border(ul: number, ur: number, bl: number, br: number) {
    const s = this.builder.inset;
    const botQuad = new Quad(this.builder.unitSize);
    botQuad.ul.y(botQuad.bl.y() + s);
    botQuad.ur.y(botQuad.br.y()  + s);
    if (ul) botQuad.ul.add(s);
    if (ur) botQuad.ur.add(-s);
    if (bl) botQuad.bl.add(s);
    if (br) botQuad.br.add(-s);
    return botQuad;
  }

  private createBevel1Triangle() {
    const s = this.builder.inset;
    const u = this.builder.unitSize;
    // const bl = new LVec([-u, -u, u]); // front bottom left.
    // [ -u + s, -u + s, u]
    const blTri = new Triangle(
      [-u + s, -u, u],
      [-u, -u + s, u],
      [-u, -u, u -s]);
    return blTri;
  }

  public build(
    flag: number,
    side: number,
    quad: (q: Quad) => void,
    tri: (t: Triangle) => void) {
    const s = this.builder.inset;
    const u = this.builder.unitSize;
    const middle = new Quad(u);
    let rotation = 0;
    let botQuad;
    const genTris = side === States.front || side === States.back;
    // do we need to draw the bot corners..
    switch(flag) {
      case 0: // No neighbours. All outer corners..
        middle.ul.add(s, -s);
        middle.ur.add(-s, -s);
        middle.bl.add(s, s);
        middle.br.add(-s, s);
        quad(middle.rotateZ(rotation).calcUv(0, 1, u));
        if (genTris) // bottom left, right and topleft: right corners.
        {
          tri(this.createBevel1Triangle().calcUv(0, 1, u));
          tri(this.createBevel1Triangle().rotateZ(90).calcUv(0, 1, u));
          tri(this.createBevel1Triangle().rotateZ(-90).calcUv(0, 1, u));
          tri(this.createBevel1Triangle().rotateZ(180).calcUv(0, 1, u));
        }
        quad(this.createBevel1Border(0, 0, 1, 1).calcUv(0, 1, u));
        quad(this.createBevel1Border(0, 0, 1, 1).rotateZ(180).calcUv(0, 1, u));

        quad(this.createBevel1Border(1, 1, 1, 1).rotateZ(-90).calcUv(0, 1, u));
        quad(this.createBevel1Border(1, 1, 1, 1).rotateZ(90).calcUv(0, 1, u));
        break;
      case 1: // 'top' is filled in..
      case 2: // only bot is filled in.
      case 4: // only right is filled in.
      case 8: // only left is filled in.
        if (flag === 2) rotation = 180;
        else  if (flag === 4) rotation = -90;
        else  if (flag === 8) rotation = 90;
        //if (flag == 2) r.enabled = false;
        middle.ul.add(s);
        middle.ur.add(-s);
        middle.bl.add(s, s);
        middle.br.add(-s, s);
        quad(middle.rotateZ(rotation).calcUv(0, 1, u));


        botQuad = this.createBevel1Border(0, 0, 1, 1);
        quad(this.createBevel1Border(1, 1, 1, 1).rotateZ(rotation).calcUv(0, 1, u));
        // one side must be extended: right
        quad(botQuad.clone(c => c.br.add(s)).rotateZ(90 + rotation).calcUv(0, 1, u));
        // one side must be extended: left
        quad(botQuad.clone(c => c.bl.add(-s)).rotateZ(-90 + rotation).calcUv(0, 1, u));

        if (genTris) {
          const blTri = this.createBevel1Triangle();
          tri(blTri.clone().rotateZ(rotation).calcUv(0, 1, u));
          tri(blTri.clone().rotateZ(90 + rotation).calcUv(0, 1, u));
        }
        break;
      case 5: // top & right
      case 10:// left + bot
      // Adjacent outer corners
        if (flag === 10) rotation = -180;
        middle.ul.add(s);
        middle.bl.add(s, s);
        middle.br.add(0, s);
        quad(middle.rotateZ(rotation).calcUv(0, 1, u));
        quad(this.createBevel1Border(0, 0, 1, 0).rotateZ(rotation).calcUv(0, 1, u));
        quad(this.createBevel1Border(0, 1, 0, 1).rotateZ(-90 + rotation).calcUv(0, 1, u));
        if (genTris) { tri(this.createBevel1Triangle().rotateZ(rotation).calcUv(0, 1, u)); }
        break;
        //console.log('bottom and right');
      case 9: // top & left
      case 6: // bot & right
      // Adjacent outer corners
        if (flag === 6) rotation = 180;
        middle.ur.add(-s);
        middle.br.add(-s, s);
        middle.bl.add(0, s);
        quad(middle.rotateZ(rotation).calcUv(0, 1, u));
        quad(this.createBevel1Border(0, 0, 0, 1).rotateZ(rotation).calcUv(0, 1, u));
        quad(this.createBevel1Border(1, 0, 1, 0).rotateZ(90 + rotation).calcUv(0, 1, u));
        if (genTris) {tri(this.createBevel1Triangle().rotateZ(90 + rotation).calcUv(0, 1, u)); }
        break;
      // The next cases require no rounding (no outer corners)
      case 3: // Top and bottom
      case 12: // left & right
      // opposing: build plain cubes
        // if(flag === 12) rotation = 90;
        quad(middle.rotateZ(rotation).calcUv(0, 1, u));
        break;
      case 7: // bot & right & top
      case 11: // left & bot & top
      case 13: // left & right & top
      case 14: // left & right & bot
        //console.log('bottom and right & top');
        quad(middle.rotateZ(rotation).calcUv(0, 1, u));
        break;
      case 15: // all corners: cube it..
        quad(middle.rotateZ(rotation).calcUv(0, 1, u));
        break;
    }
  }
}
