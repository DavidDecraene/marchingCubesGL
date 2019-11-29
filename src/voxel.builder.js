/*jshint esversion: 6 */

class BuildResult {
  constructor(side) {
    this.side = side;
    this.quads = [];
    this.tris = [];
    this.enabled = true;
  }

  quad(quad, targetSide) {
    if (!this.enabled) return;
    this.quads.push({ v: quad, s: this.side, t: targetSide !== undefined ? targetSide : this.side });
  }

  tri(triangle, targetSide) {
    if (!this.enabled) return;
    this.tris.push({ v: triangle, s: this.side, t: targetSide !== undefined ? targetSide : this.side });
  }
}

class VoxelBuilder {

  constructor(voxelModel) {
    this.mode = 1; // beveled cube, only indented corners
    //this.mode = 2; // beveled cube,  indented corners an borders
    this.model = voxelModel;
    this.data = new MeshData();
    this.cubes = new CubeBuilder(0.5, this.data);
    this.tris = new TriangleBuilder(this.data);
    this.quads = new QuadBuilder(this.data, this.tris);
    this.inset = 0.1;
  }

  append(vector) {
    const vox = this.model.getVoxel(vector);
    if (!vox) return;
    this.quads.offset = vector;
  //  this.tris.offset = vector;
    const front = this.model.getVoxel(vec3.fromValues(vector[0], vector[1], vector[2] + 1));
    const back = this.model.getVoxel(vec3.fromValues(vector[0], vector[1], vector[2] - 1));
    const top = this.model.getVoxel(vec3.fromValues(vector[0], vector[1] + 1, vector[2]));
    const bottom = this.model.getVoxel(vec3.fromValues(vector[0], vector[1] - 1, vector[2]));
    const right = this.model.getVoxel(vec3.fromValues(vector[0] +1, vector[1], vector[2]));
    const left = this.model.getVoxel(vec3.fromValues(vector[0] - 1, vector[1] , vector[2]));
    const sides = [front, back, top, bottom, right, left];
    // If everything is surrounded: return
    const sideResults = [];
    for(let i = 0; i < 7; i++) sideResults.push({ quads: [], tris: [] });

    this.buildFront(vox, sides, sideResults);
    this.buildBack(vox, sides, sideResults);
    this.buildTop(vox, sides, sideResults);
    this.buildBottom(vox, sides, sideResults);
    this.buildRight(vox, sides, sideResults);
    this.buildLeft(vox, sides, sideResults);

    const colors = [
      [1.0,  1.0,  1.0,  1.0],// front white
      [1.0,  0.0,  0.0,  1.0], // back red
      [0.0,  1.0,  0.0,  1.0], // green top
      [0.0,  0.0,  1.0,  1.0],
      [1.0,  1.0,  0.0,  1.0], // r: yellow.
      [1.0,  0.0,  1.0,  1.0], // l: pink
      [1.0,  0.4,  0.4,  1.0] // testing
    ];
    sideResults.forEach((r, i) => {
      r.quads.forEach(q => q.appendTo(this.quads, colors[i]));
      r.tris.forEach(q => q.appendTo(this.tris, colors[i]));
    });
  }

  createBevel1Border(ul, ur, bl, br) {
    const s = this.inset;
    const botQuad = new Quad(this.cubes.unitSize);
    botQuad.ul.y(botQuad.bl.y() + s);
    botQuad.ur.y(botQuad.br.y()  + s);
    if (ul) botQuad.ul.add(s);
    if (ur) botQuad.ur.add(-s);
    if (bl) botQuad.bl.add(s);
    if (br) botQuad.br.add(-s);
    return botQuad;
  }

  createBevel2Triangle() {
    const s = this.inset;
    const u = this.cubes.unitSize;
    // s, s/2, -s/2
    // const bl = new LVec([-u, -u, u]); // front bottom left.
    const blTri = new Triangle(
      [-u + s, -u + s/2, u - s/2],
      [-u + s, -u + s, u],
      [-u + s - s/2, -u + s, u  - s/2]);
    return blTri;
  }

  createBevel2Triangle2() {
    const s = this.inset;
    const u = this.cubes.unitSize;
    // s, s/2, -s/2
    // const bl = new LVec([-u, -u, u]); // front bottom left.
    const blTri = new Triangle(
      [-u + s, -u + s/2, u - s/2],
      [-u + s - s/2, -u + s, u  - s/2],
      [-u + s/2, -u +s/2, u - s ]);
    return blTri;
  }

  createBevel1Triangle() {
    const s = this.inset;
    const u = this.cubes.unitSize;
    // const bl = new LVec([-u, -u, u]); // front bottom left.
    // [ -u + s, -u + s, u]
    const blTri = new Triangle(
      [-u + s, -u, u],
      [-u, -u + s, u],
      [-u, -u, u -s]);
    return blTri;
  }

  buildQuads(flag, side, tbrl) {
    const s = this.inset;
    const u = this.cubes.unitSize;
    const r = new BuildResult(side);
    const middle = new Quad(u);
    let rotation = 0;
    let botQuad;
    if (this.mode === 0) {
      r.quad(middle);
      return r;
    }
    if (this.mode === 1) {
      r.quad(middle);
      const genTris = side === 0 || side === 1;
      // do we need to draw the bot corners..
      switch(flag) {
        case 0: // No neighbours. All outer corners..
          middle.ul.add(s, -s);
          middle.ur.add(-s, -s);
          middle.bl.add(s, s);
          middle.br.add(-s, s);

          if (genTris) // bottom left, right and topleft: right corners.
          {
            r.tri(this.createBevel1Triangle());
            r.tri(this.createBevel1Triangle().rotateZ(90));
            r.tri(this.createBevel1Triangle().rotateZ(-90));
            r.tri(this.createBevel1Triangle().rotateZ(180));
          }
          r.quad(this.createBevel1Border(0, 0, 1, 1));
          r.quad(this.createBevel1Border(0, 0, 1, 1).rotateZ(180));

          r.quad(this.createBevel1Border(1, 1, 1, 1).rotateZ(-90));
          r.quad(this.createBevel1Border(1, 1, 1, 1).rotateZ(90));
          break;
        case 1: // 'top' is filled in..
        case 2: // only bot is filled in.
        case 4: // only right is filled in.
        case 8: // only left is filled in.
          if (flag === 2) rotation = 180;
          else  if (flag === 4) rotation = -90;
          else  if (flag === 8) rotation = 90;
          middle.ul.add(s);
          middle.ur.add(-s);
          middle.bl.add(s, s);
          middle.br.add(-s, s);
          middle.rotateZ(rotation);
          botQuad = this.createBevel1Border(0, 0, 1, 1);
          r.quad(botQuad.clone().rotateZ(rotation));
          // one side must be extended: right
          r.quad(botQuad.clone(c => c.br.add(s)).rotateZ(90 + rotation));
          // one side must be extended: left
          r.quad(botQuad.clone(c => c.bl.add(-s)).rotateZ(-90 + rotation));

          if (genTris) {
            const blTri = this.createBevel1Triangle();
            r.tri(blTri.clone().rotateZ(rotation));
            r.tri(blTri.clone().rotateZ(90 + rotation));
          }
          break;
        case 5: // top & right
        case 10:// left + bot
        // Adjacent outer corners
          if (flag === 10) rotation = -180;
          middle.ul.add(s);
          middle.bl.add(s, s);
          middle.br.add(0, s);
          middle.rotateZ(rotation);
          r.quad(this.createBevel1Border(0, 0, 1, 0).rotateZ(rotation));
          r.quad(this.createBevel1Border(0, 1, 0, 1).rotateZ(-90 + rotation));
          if (genTris) { r.tri(this.createBevel1Triangle().rotateZ(rotation)); }
          break;
          //console.log('bottom and right');
        case 9: // top & left
        case 6: // bot & right
        // Adjacent outer corners
          if (flag === 6) rotation = 180;
          middle.ur.add(-s);
          middle.br.add(-s, s);
          middle.bl.add(0, s);
          middle.rotateZ(rotation);
          r.quad(this.createBevel1Border(0, 0, 0, 1).rotateZ(rotation));
          r.quad(this.createBevel1Border(1, 0, 1, 0).rotateZ(90 + rotation));
          if (genTris) { r.tri(this.createBevel1Triangle().rotateZ(90 + rotation)); }
          break;
        // The next cases require no rounding (no outer corners)
        case 3: // Top and bottom
        case 12: // left & right
        // opposing: build plain cubes
          break;
        case 7: // bot & right & top
        case 11: // left & bot & top
        case 13: // left & right & top
        case 14: // left & right & bot
          //console.log('bottom and right & top');
          break;
        case 15: // all corners: cube it..
          break;
      }
      return r;
    }
    if (this.mode === 2) {
      //r.enabled = false;
      // r.quad(middle);
      // This mode has considerably more triangles....
      const genTris = side === 0 || side === 1;
      // do we need to draw the bot corners..
      switch(flag) {
        case 0: // No neighbours. All outer corners..
          //r.quad(middle);
          middle.ul.add(s, -s);
          middle.ur.add(-s, -s);
          middle.bl.add(s, s);
          middle.br.add(-s, s);
          r.quad(middle);
            r.quad(this.createBevel2Border(1, 1, 1, 1));
            r.quad(this.createBevel2Border(1, 1, 1, 1).rotateZ(180));
            r.quad(this.createBevel2Border(1, 1, 1, 1).rotateZ(90));
            r.quad(this.createBevel2Border(1, 1, 1, 1).rotateZ(-90));
            const blTri = this.createBevel2Triangle();
            r.tri(blTri.clone().rotateZ(rotation));
            r.tri(blTri.clone().rotateZ(90 + rotation));
            r.tri(blTri.clone().rotateZ(-90 + rotation));
            r.tri(blTri.clone().rotateZ(180 + rotation));
            if (genTris) {
              // Fill the stretched corner = points from 3 diff tris;
              r.tri(this.createBevel2Triangle2().rotateZ(rotation));
              r.tri(this.createBevel2Triangle2().rotateZ(90 + rotation));
              r.tri(this.createBevel2Triangle2().rotateZ(-90 + rotation));
              r.tri(this.createBevel2Triangle2().rotateZ(180 + rotation));
            }
          break;

        case 1: // 'top' is filled in..
        case 2: // only bot is filled in.
        case 4: // only right is filled in.
        case 8: // only left is filled in.
          if (flag === 2) rotation = 180;
          else  if (flag === 4) rotation = -90;
          else  if (flag === 8) rotation = 90;
          middle.ul.add(s);
          middle.ur.add(-s);
          middle.bl.add(s, s);
          middle.br.add(-s, s);
          middle.rotateZ(rotation);
          r.quad(middle);
          r.quad(this.createBevel2Border(1, 1, 1, 1).rotateZ(rotation));
          r.quad(this.createBevel2Border(1, 0, 1, 0).rotateZ(rotation + 90));
          r.quad(this.createBevel2Border(0, 1, 0, 1).rotateZ(rotation - 90));
          r.tri(this.createBevel2Triangle().rotateZ(rotation));
          r.tri(this.createBevel2Triangle().rotateZ(rotation + 90));
          if (genTris) {
            // Fill the stretched corner = points from 3 diff tris;
            r.tri(this.createBevel2Triangle2().rotateZ(rotation));

            r.tri(this.createBevel2Triangle2().rotateZ( rotation + 90));
          }
          // TODO: fill inner corners...

          break;

        case 5: // top & right
        case 10:// left + bot
        // Adjacent outer corners
          if (flag === 10) rotation = -180;
          middle.ul.add(s);
          middle.bl.add(s, s);
          middle.br.add(0, s);
          middle.rotateZ(rotation);
          r.quad(middle);
          r.quad(this.createBevel2Border(1, 0, 1, 0).rotateZ(rotation));
          r.quad(this.createBevel2Border(0, 1, 0, 1).rotateZ(rotation -90));
          r.tri(this.createBevel2Triangle().rotateZ(rotation));
          // TODO:
          //r.quad(this.createBevel2Border().rotateZ(rotation));
          //r.quad(this.createBevel2Border().rotateZ(-90 + rotation));

          if (genTris) {
            // Fill the stretched corner = points from 3 diff tris;
            r.tri(this.createBevel2Triangle2().rotateZ(rotation));
          }

          break;

        case 9: // top & left
        case 6: // bot & right
        // Adjacent outer corners
          if (flag === 6) rotation = 180;
          middle.ur.add(-s);
          middle.br.add(-s, s);
          middle.bl.add(0, s);
          middle.rotateZ(rotation);
          r.quad(middle);
          r.quad(this.createBevel2Border(0, 1, 0, 1).rotateZ(rotation));
          r.quad(this.createBevel2Border(1, 0, 1, 0).rotateZ(rotation + 90));
          r.tri(this.createBevel2Triangle().rotateZ(rotation + 90));
          if (genTris) {
            // Fill the stretched corner = points from 3 diff tris;
            r.tri(this.createBevel2Triangle2().rotateZ(rotation + 90));
          }
          break;
        case 3: // Top and bottom
        case 12: // left & right
          // opposing: build plain cubes
          if (flag === 12) rotation = 90;
          middle.ur.add(-s);
          middle.br.add(-s);
          middle.bl.add(s);
          middle.ul.add(s);
          middle.rotateZ(rotation);
          r.quad(middle);
          r.quad(this.createBevel2Border(0, 0, 0, 0).rotateZ(rotation + 90));
          r.quad(this.createBevel2Border(0, 0, 0, 0).rotateZ(rotation - 90));

          break;
        case 7: // bot & right & top
        case 11: // left & bot & top
        case 13: // left & right & top
        case 14: // left & right & bot
          r.enabled = true;
          if (flag === 13) rotation = 90;
          else if (flag === 11) rotation = 180;
          else if (flag === 14) rotation = -90;
          middle.ur.add(-s);
          middle.br.add(-s);
          middle.bl.add(s);
          middle.ul.add(s);
          const right = new Quad(u);
          right.ul.x(middle.ur.x());
          right.bl.x(middle.br.x());
          right.ul.add(0, -s);
          right.ur.add(0, -s);
          right.bl.add(0, s);
          right.br.add(0, s);

          const p = this.createInnerBevelBorder(false);
          p.rotateZ(90);
          const p2 = this.createInnerBevelBorder(true);
          p2.rotateZ(90);
          // triangle:
          // rp2.ur -> rp.ul ->  s, -s, s/2?
          const rightSideCorner = new Triangle(right.br, right.bl, [u, -u, u - s]); // this is a triangle for the other side? (right side..)
          const botSideCorner = new Triangle(rightSideCorner.t, rightSideCorner.r, rightSideCorner.l); // this is a triangle for the other side (bottom)
          botSideCorner.r.add(0, -s);

          let rTop = new Quad(u);
          rTop.br.copy(right.ur);
          rTop.bl.copy(p.ul);
          rTop.ur.copy(right.ur).add(0, s/2, -s/2);
          rTop.ul.copy(p.bl);
          const rBot = this.createInnerBevelBorder(false); // bevel border right block bottom
          rTop = this.createInnerBevelBorder(true).rotateZ(180);

          r.tri(this.createInnerBevelTriangle(false, rBot).rotateZ(rotation), tbrl[1]);
          r.tri(this.createInnerBevelTriangle(false, rBot, p2).rotateZ(rotation), tbrl[2]);
          r.tri(this.createInnerBevelTriangle(true, rTop).rotateZ(rotation), tbrl[0]);
          r.tri(this.createInnerBevelTriangle(true, rTop, p).rotateZ(rotation), tbrl[2]);

          r.quad(middle.rotateZ(rotation));
          r.quad(this.createBevel2Border(0, 0, 0, 0).rotateZ(rotation - 90)); //left side
          r.quad(rBot.rotateZ(rotation)); // bevel border right block bottom
          r.quad(p2.rotateZ(rotation));
          r.quad(right.rotateZ(rotation)); // Right quad..
          r.quad(p.rotateZ(rotation));
          r.quad(rTop.rotateZ(rotation)); // bevel border right block top
          break;
        case 15:
          middle.ul.add(s, -s);
          middle.ur.add(-s, -s);
          middle.bl.add(s, s);
          middle.br.add(-s, s);
          const right15 = middle.clone().add(s);
          const left15 = middle.clone().add(-s);
          const top15 = middle.clone().add(0, s);
          const bot15 = middle.clone().add(0, -s);
          const leftP = this.createInnerBevelBorder(false);
          const ps = [leftP];
          ps[1] = leftP.clone().rotateZ(90);
          ps[2] = leftP.clone().rotateZ(180);
          ps[3] = leftP.clone().rotateZ(-90);
          const rightP = this.createInnerBevelBorder(true);
          ps[4] = rightP;
          ps[5] = rightP.clone().rotateZ(90);
          ps[6] = rightP.clone().rotateZ(180);
          ps[7] = rightP.clone().rotateZ(-90);
          ps.forEach((pp, i) => r.quad(pp, i === 4 ? 0 : undefined));
          r.quad(right15);
          r.quad(left15);
          r.quad(top15);
          r.quad(bot15);
          r.quad(middle);
          const t1 = this.createInnerBevelTriangle(false, leftP);
          const t2 = this.createInnerBevelTriangle(false, leftP, ps[5]);
          r.tri(t1.rotateZ(rotation), tbrl[1]);
          r.tri(t2.rotateZ(rotation), tbrl[2]);
          r.tri(t1.clone().rotateZ(rotation + 90), 6);
          r.tri(t2.clone().rotateZ(rotation + 90), 6);
          r.tri(t1.clone().rotateZ(rotation + 180), 6);
          r.tri(t2.clone().rotateZ(rotation + 180), 6);
          r.tri(t1.clone().rotateZ(rotation -90), 6);
          r.tri(t2.clone().rotateZ(rotation  -90), 6);
          break;
      }
    }
    return r;
  }

  createInnerBevelTriangle(rightSide, rBot, top) {
    const u = this.cubes.unitSize;
    const s = this.inset;
    if (rightSide) {
      if (top) {
        return new Triangle([ u, u, u - s ], top.br, rBot.br );
      }
      return new Triangle(rBot.br, rBot.bl, [ u, u, u - s ]);
    }

    if (top) {
      return new Triangle([ u, -u, u - s ], rBot.bl, top.bl);
    }
    return new Triangle(rBot.br, rBot.bl, [ u, -u, u - s ]);
  }

  createInnerBevelBorder(rightSide) {
    const s = this.inset;
    const p = this.createBevel2Border(0, 0, 0, 0);
    if (rightSide) {
      p.ur.x(p.ul.x() + s);
      p.br.x(p.bl.x() + s - s/2);
    } else {
      p.ul.x(p.ur.x() - s);
      p.bl.x(p.br.x() - s + s/2);
    }
    return p;
  }

  createBevel2Border(ul, ur, bl, br) {
    const s = this.inset;
    const botQuad = new Quad(this.cubes.unitSize);
    botQuad.ul.y(botQuad.bl.y() + s);
    botQuad.ur.y(botQuad.br.y()  + s);
    if (ul) botQuad.ul.add(s);
    if (ur) botQuad.ur.add(-s);
    botQuad.bl.add(0, s/2, -s/2);
    botQuad.br.add(0, s/2, -s/2);
    if (bl) botQuad.bl.add(s);
    if (br) botQuad.br.add(-s);
    return botQuad;

  }

  buildFront(voxel, sides, results) {
    if (sides[0]) {
      return;
    }
    let flag = 0;
    if (sides[2]) flag = BitFlags.set(flag, 1 << 0); // top
    if (sides[3]) flag = BitFlags.set(flag, 1 << 1); // bot
    if (sides[4]) flag = BitFlags.set(flag, 1 << 2); // right
    if (sides[5]) flag = BitFlags.set(flag, 1 << 3); // left
    const r = this.buildQuads(flag, 0, [2, 3, 4, 5]);
    r.quads.forEach(q => results[q.t].quads.push(q.v));
    r.tris.forEach(q => results[q.t].tris.push(q.v));
  }

  buildBack(voxel, sides, results) {
    if (sides[1]) {
      return;
    }
    let flag = 0;
    if (sides[2]) flag = BitFlags.set(flag, 1 << 0); // top
    if (sides[3]) flag = BitFlags.set(flag, 1 << 1); // bot
    if (sides[5]) flag = BitFlags.set(flag, 1 << 2); // right
    if (sides[4]) flag = BitFlags.set(flag, 1 << 3); // left
    const r = this.buildQuads(flag, 1, [2, 3, 5, 4]);
    r.quads.forEach(q => results[q.t].quads.push(q.v.back()));
    r.tris.forEach(q => results[q.t].tris.push(q.v.back()));
  }

  buildTop(voxel, sides, results) {
    if (sides[2]) {
      return;
    }
    let flag = 0;
    if (sides[1]) flag = BitFlags.set(flag, 1 << 0); // top
    if (sides[0]) flag = BitFlags.set(flag, 1 << 1); // bot
    if (sides[4]) flag = BitFlags.set(flag, 1 << 2); // right
    if (sides[5]) flag = BitFlags.set(flag, 1 << 3); // left
    const r = this.buildQuads(flag, 2, [1, 0, 4, 5]);
    r.quads.forEach(q => results[q.t].quads.push(q.v.top()));
    r.tris.forEach(q => results[q.t].tris.push(q.v.top()));
  }

  buildBottom(voxel, sides, results) {
    if (sides[3]) {
      return;
    }
    let flag = 0;
    if (sides[0]) flag = BitFlags.set(flag, 1 << 0); // top
    if (sides[1]) flag = BitFlags.set(flag, 1 << 1); // bot
    if (sides[4]) flag = BitFlags.set(flag, 1 << 2); // right
    if (sides[5]) flag = BitFlags.set(flag, 1 << 3); // left
    const r = this.buildQuads(flag, 3, [0, 1, 4, 5]);
    r.quads.forEach(q => results[q.t].quads.push(q.v.bottom()));
    r.tris.forEach(q => results[q.t].tris.push(q.v.bottom()));
  }

  buildRight(voxel, sides, results) {
    if (sides[4]) {
      return;
    }
    let flag = 0;
    if (sides[2]) flag = BitFlags.set(flag, 1 << 0); // top
    if (sides[3]) flag = BitFlags.set(flag, 1 << 1); // bot
    if (sides[1]) flag = BitFlags.set(flag, 1 << 2); // right
    if (sides[0]) flag = BitFlags.set(flag, 1 << 3); // left
    const r = this.buildQuads(flag, 4, [2, 3, 1, 0]);
    r.quads.forEach(q => results[q.t].quads.push(q.v.right()));
    r.tris.forEach(q => results[q.t].tris.push(q.v.right()));
  }

  buildLeft(voxel, sides, results) { // yellow
    if (sides[5]) {
      return;
    }
    let flag = 0;
    if (sides[2]) flag = BitFlags.set(flag, 1 << 0); // top
    if (sides[3]) flag = BitFlags.set(flag, 1 << 1); // bot
    if (sides[0]) flag = BitFlags.set(flag, 1 << 2); // right
    if (sides[1]) flag = BitFlags.set(flag, 1 << 3); // left
    const r = this.buildQuads(flag, 5, [2, 3, 0, 1]);
    r.quads.forEach(q => results[q.t].quads.push(q.v.left()));
    r.tris.forEach(q => results[q.t].tris.push(q.v.left()));
  }


}
