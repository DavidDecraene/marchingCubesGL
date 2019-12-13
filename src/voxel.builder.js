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
    //if (targetSide === 5) console.log(new Error());
    this.tris.push({ v: triangle, s: this.side, t: targetSide !== undefined ? targetSide : this.side });
  }
}

States = {
    front: 0,
    back: 1,
    top: 2,
    bottom: 3,
    right: 4,
    left: 5
};

class VoxelState {
  constructor(vector, voxelModel) {
    this.vector = vector;
    this.model = voxelModel;
    this.voxel = this.model.getVoxel(vector);
    const vectors = this.vectors = [
      vec3.fromValues(vector[0], vector[1], vector[2] + 1),
      vec3.fromValues(vector[0], vector[1], vector[2] - 1),
      vec3.fromValues(vector[0], vector[1] + 1, vector[2]),
      vec3.fromValues(vector[0], vector[1] - 1, vector[2]),
      vec3.fromValues(vector[0] +1, vector[1], vector[2]),
      vec3.fromValues(vector[0] - 1, vector[1] , vector[2])
    ];
    const front = this.model.getVoxel(vectors[0]);
    const back = this.model.getVoxel(vectors[1]);
    const top = this.model.getVoxel(vectors[2]);
    const bottom = this.model.getVoxel(vectors[3]);
    const right = this.model.getVoxel(vectors[4]);
    const left = this.model.getVoxel(vectors[5]);
    this.sides = [front, back, top, bottom, right, left];
    let flag = 0;
    this.sides.forEach((side, i) => {
      if (side) { flag = BitFlags.set(flag, 1 << i); }
    });
    this.flag = flag;
  }

  diagonal(a, b, voxels) {
    const dia = this.diagonals(voxels);
    if (a === States.front) { // front [2, 3, 4, 5];  tbrl
      if (b === States.top) return dia[4];
      if (b === States.bottom) return dia[7];
      if (b === States.right) return dia[0];
      if (b === States.left) return dia[3];
      return undefined;
    }
    if (a === States.back) {
      if (b === States.top) return dia[5];
      if (b === States.bottom) return dia[6];
      if (b === States.right) return dia[1];
      if (b === States.left) return dia[2];
      return undefined;
    }
    if (a === States.top) {
      if (b === States.back) return dia[5];
      if (b === States.front) return dia[4];
      if (b === States.right) return dia[8];
      if (b === States.left) return dia[9];
      return undefined;
    }
    if (a === States.bottom) {
      if (b === States.back) return dia[6];
      if (b === States.front) return dia[7];
      if (b === States.right) return dia[11];
      if (b === States.left) return dia[10];
      return undefined;
    }
    if (a === States.right) {
      if (b === States.back) return dia[1];
      if (b === States.front) return dia[0];
      if (b === States.top) return dia[8];
      if (b === States.bottom) return dia[11];
      return undefined;
    }
    if (a === States.left) {
      if (b === States.back) return dia[2];
      if (b === States.front) return dia[3];
      if (b === States.top) return dia[9];
      if (b === States.bottom) return dia[10];
      return undefined;
    }
    return undefined;
  }

  diagonals(voxels) {
    if (this._diagonals) {
      return voxels ? this._diagonalVoxels : this._diagonals;
    }
    const vector = this.vector;
    this._diagonals = [
      vec3.fromValues(vector[0] + 1, vector[1], vector[2] + 1), // Front Right 0
      vec3.fromValues(vector[0] + 1, vector[1], vector[2] - 1), // right back 1
      vec3.fromValues(vector[0] - 1, vector[1], vector[2] - 1), // back left 2
      vec3.fromValues(vector[0] - 1, vector[1], vector[2] + 1), // left front 3
      vec3.fromValues(vector[0], vector[1] + 1, vector[2] + 1), // Front top 4
      vec3.fromValues(vector[0], vector[1] + 1, vector[2] - 1), // top back 5
      vec3.fromValues(vector[0], vector[1] - 1, vector[2] - 1), // back bot 6
      vec3.fromValues(vector[0], vector[1] - 1, vector[2] + 1), // bot front 7
      vec3.fromValues(vector[0] + 1, vector[1] + 1, vector[2]), // right top 8
      vec3.fromValues(vector[0] - 1, vector[1] + 1, vector[2]), // top left 9
      vec3.fromValues(vector[0] - 1, vector[1] - 1, vector[2]), // left bot 10
      vec3.fromValues(vector[0] + 1, vector[1] - 1, vector[2]), // bot right 11
      ];
    let dflag = 0;
    this._diagonalVoxels= this._diagonals.map((v, i) => {
      const side = this.model.getVoxel(v);
      if (side) { dflag = BitFlags.set(dflag, 1 << i); }
      return side;
    });
    this.dflag = dflag;
    // br, brb, blb, bl
    return voxels ? this._diagonalVoxels : this._diagonals;
  }
}

class VoxelBuilder {

  constructor(voxelModel, textureMap) {
    this.mode = 1; // beveled cube, only indented corners
    //this.mode = 2; // beveled cube,  indented corners an borders
    this.model = voxelModel;
    this.textureMap = textureMap;
    this.data = new MeshData();
    this.unitSize = 0.5;
    this.tris = new TriangleBuilder(this.data);
    this.quads = new QuadBuilder(this.data, this.tris);
    this.inset = 0.1;
  }

  append(vector) {
    const state = new VoxelState(vector, this.model);
    if (!state.voxel) return;
    this.quads.offset = vector;
  //  this.tris.offset = vector;
    // If everything is surrounded: return
    const sideResults = [];
    for(let i = 0; i < 7; i++) sideResults.push({ quads: [], tris: [] });

    this.buildFront(state,  sideResults);
    this.buildBack(state,  sideResults);
    this.buildTop(state,  sideResults);
    this.buildBottom(state,  sideResults);
    this.buildRight(state,  sideResults);
    this.buildLeft(state,  sideResults);

    const colors = [
      [1.0,  1.0,  1.0,  1.0],// front white
      [1.0,  0.0,  0.0,  1.0], // back red
      [0.0,  1.0,  0.0,  1.0], // green top
      [0.0,  0.0,  1.0,  1.0], // bot: blue
      [1.0,  1.0,  0.0,  1.0], // r: yellow.
      [1.0,  0.0,  1.0,  1.0], // l: pink
      [1.0,  0.4,  0.1,  1.0] // testing
    ];
    sideResults.forEach((r, i) => {
      // Calculate the texture map here...
      const textC = this.textureMap[i];
      //if (i !== 5) return;
      // if (i === 0 ) return;
      r.quads.forEach(q => q.appendTo(this.quads, colors[i], textC));
      r.tris.forEach(q => q.appendTo(this.tris, colors[i], textC));
    });
  }

  createBevel1Border(ul, ur, bl, br) {
    const s = this.inset;
    const botQuad = new Quad(this.unitSize);
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
    const u = this.unitSize;
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
    const u = this.unitSize;
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
    const u = this.unitSize;
    // const bl = new LVec([-u, -u, u]); // front bottom left.
    // [ -u + s, -u + s, u]
    const blTri = new Triangle(
      [-u + s, -u, u],
      [-u, -u + s, u],
      [-u, -u, u -s]);
    return blTri;
  }

  buildQuads(flag, side, tbrl, state) {
    const s = this.inset;
    const u = this.unitSize;
    const r = new BuildResult(side);
    const middle = new Quad(u);
    let rotation = 0;
    let botQuad;
    if (this.mode === 0) {
      r.quad(middle);

      return r;
    }
    if (this.mode === 1) {

      const genTris = side === 0 || side === 1;
      // do we need to draw the bot corners..
      switch(flag) {
        case 0: // No neighbours. All outer corners..
          middle.ul.add(s, -s);
          middle.ur.add(-s, -s);
          middle.bl.add(s, s);
          middle.br.add(-s, s);
          r.quad(middle.rotateZ(rotation).calcUv(0, 1, u));
          if (genTris) // bottom left, right and topleft: right corners.
          {
            r.tri(this.createBevel1Triangle().calcUv(0, 1, u));
            r.tri(this.createBevel1Triangle().rotateZ(90).calcUv(0, 1, u));
            r.tri(this.createBevel1Triangle().rotateZ(-90).calcUv(0, 1, u));
            r.tri(this.createBevel1Triangle().rotateZ(180).calcUv(0, 1, u));
          }
          r.quad(this.createBevel1Border(0, 0, 1, 1).calcUv(0, 1, u));
          r.quad(this.createBevel1Border(0, 0, 1, 1).rotateZ(180).calcUv(0, 1, u));

          r.quad(this.createBevel1Border(1, 1, 1, 1).rotateZ(-90).calcUv(0, 1, u));
          r.quad(this.createBevel1Border(1, 1, 1, 1).rotateZ(90).calcUv(0, 1, u));
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
          r.quad(middle.rotateZ(rotation).calcUv(0, 1, u));


          botQuad = this.createBevel1Border(0, 0, 1, 1);
          r.quad(this.createBevel1Border(1, 1, 1, 1).rotateZ(rotation).calcUv(0, 1, u));
          // one side must be extended: right
          r.quad(botQuad.clone(c => c.br.add(s)).rotateZ(90 + rotation).calcUv(0, 1, u));
          // one side must be extended: left
          r.quad(botQuad.clone(c => c.bl.add(-s)).rotateZ(-90 + rotation).calcUv(0, 1, u));

          if (genTris) {
            const blTri = this.createBevel1Triangle();
            r.tri(blTri.clone().rotateZ(rotation).calcUv(0, 1, u));
            r.tri(blTri.clone().rotateZ(90 + rotation).calcUv(0, 1, u));
          }
          break;
        case 5: // top & right
        case 10:// left + bot
        // Adjacent outer corners
          if (flag === 10) rotation = -180;
          middle.ul.add(s);
          middle.bl.add(s, s);
          middle.br.add(0, s);
          r.quad(middle.rotateZ(rotation).calcUv(0, 1, u));
          r.quad(this.createBevel1Border(0, 0, 1, 0).rotateZ(rotation).calcUv(0, 1, u));
          r.quad(this.createBevel1Border(0, 1, 0, 1).rotateZ(-90 + rotation).calcUv(0, 1, u));
          if (genTris) { r.tri(this.createBevel1Triangle().rotateZ(rotation).calcUv(0, 1, u)); }
          break;
          //console.log('bottom and right');
        case 9: // top & left
        case 6: // bot & right
        // Adjacent outer corners
          if (flag === 6) rotation = 180;
          middle.ur.add(-s);
          middle.br.add(-s, s);
          middle.bl.add(0, s);
          r.quad(middle.rotateZ(rotation).calcUv(0, 1, u));
          r.quad(this.createBevel1Border(0, 0, 0, 1).rotateZ(rotation).calcUv(0, 1, u));
          r.quad(this.createBevel1Border(1, 0, 1, 0).rotateZ(90 + rotation).calcUv(0, 1, u));
          if (genTris) { r.tri(this.createBevel1Triangle().rotateZ(90 + rotation).calcUv(0, 1, u)); }
          break;
        // The next cases require no rounding (no outer corners)
        case 3: // Top and bottom
        case 12: // left & right
        // opposing: build plain cubes
          // if(flag === 12) rotation = 90;
          r.quad(middle.rotateZ(rotation).calcUv(0, 1, u));
          break;
        case 7: // bot & right & top
        case 11: // left & bot & top
        case 13: // left & right & top
        case 14: // left & right & bot
          //console.log('bottom and right & top');
          r.quad(middle.rotateZ(rotation).calcUv(0, 1, u));
          break;
        case 15: // all corners: cube it..
          r.quad(middle.rotateZ(rotation).calcUv(0, 1, u));
          break;
      }
      return r;
    }
    if (this.mode === 2) {
      //r.enabled = false;
      // r.quad(middle);
      // This mode has considerably more triangles....
      const genTris = side === 0 || side === 1;
      let tCol = 0, bCol = 0, sCol = 0;
      let innerCorner = false;
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
        //r.enabled = false;
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

        case 5: // top & right // base
        case 10:// left + bot
        // Adjacent outer corners
          // if (flag === 10) r.enabled = false;
          if (flag === 10){
             rotation = -180;
             tCol = 1; sCol = 3;
            innerCorner = state.diagonal(tbrl[3], tbrl[1], true) === undefined;
          } else {
            tCol = 0; sCol = 2;
            innerCorner = state.diagonal(tbrl[0], tbrl[2], true) === undefined;
          }
          middle.ul.add(s);
          middle.bl.add(s, s);
          middle.br.add(0, s);
          if (innerCorner) {
            middle.br.add(-s);
            middle.ur.add(-s, s);
          }
          r.quad(middle.rotateZ(rotation));
          r.quad(this.createBevel2Border(1, 0, 1, 0).rotateZ(rotation));
          r.quad(this.createBevel2Border(0, 1, 0, 1).rotateZ(rotation -90));
          r.tri(this.createBevel2Triangle().rotateZ(rotation));
          if (innerCorner) {

            const right = new Quad(u); // its possible this quad is overlapping
            right.ul.x(middle.ur.x());
            right.bl.x(middle.br.x());
            right.ul.add(0, -s);
            right.ur.add(0, -s);
            right.bl.add(0, s);
            right.br.add(0, s);
            r.quad(right.rotateZ(rotation));
            const p = this.createInnerBevelBorder(false);
            p.rotateZ(90);
            const rTop = this.createInnerBevelBorder(true).rotateZ(180);
            r.tri(this.createInnerBevelTriangle(true, rTop).rotateZ(rotation), tbrl[tCol]);
            r.tri(this.createInnerBevelTriangle(true, rTop, p).rotateZ(rotation), tbrl[sCol]);
            r.quad(rTop.rotateZ(rotation));
            r.quad(p.rotateZ(rotation));
          }

          if (genTris) {
            // Fill the stretched corner = points from 3 diff tris;
            r.tri(this.createBevel2Triangle2().rotateZ(rotation));
          }

          break;

        case 9: // top & left //base
        case 6: // bot & right

        if (flag === 6){
           rotation = 180;
           bCol = 1; sCol = 2;
          innerCorner = state.diagonal(tbrl[1], tbrl[2], true) === undefined;
        } else {
          bCol = 0; sCol = 3;
          innerCorner = state.diagonal(tbrl[0], tbrl[3], true) === undefined;
        }
        // Adjacent outer corners
          middle.ur.add(-s);
          middle.br.add(-s, s);
          middle.bl.add(0, s);
          middle.rotateZ(rotation);
          if (innerCorner) {
            middle.bl.add(s);
            middle.ul.add(s, s);
          }
          r.quad(middle);
          r.quad(this.createBevel2Border(0, 1, 0, 1).rotateZ(rotation));
          r.quad(this.createBevel2Border(1, 0, 1, 0).rotateZ(rotation + 90));
          r.tri(this.createBevel2Triangle().rotateZ(rotation + 90));
          if (innerCorner) {

            const right = new Quad(u);// its possible this quad is overlapping
            right.ul.x(middle.ur.x());
            right.bl.x(middle.br.x());
            right.ul.add(0, -s);
            right.ur.add(0, -s);
            right.bl.add(0, s);
            right.br.add(0, s);
            const rBot = this.createInnerBevelBorder(false); // bevel border right block bottom

            const p2 = this.createInnerBevelBorder(true);
            p2.rotateZ(90);
            r.tri(this.createInnerBevelTriangle(false, rBot).rotateZ(rotation + 180), tbrl[bCol]);
            r.tri(this.createInnerBevelTriangle(false, rBot, p2).rotateZ(rotation + 180), tbrl[sCol]);
            r.quad(right.rotateZ(rotation + 180));
            r.quad(p2.rotateZ(rotation + 180));
            r.quad(rBot.rotateZ(rotation + 180));
          }
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
          if (flag === 7) { tCol = 0; bCol = 1; sCol = 2; }
          else if (flag === 13){  rotation = 90; tCol = 3; bCol = 2; sCol = 0;  }
          else if (flag === 11) { rotation = 180; tCol = 1; bCol = 0; sCol = 3; }
          else if (flag === 14) { rotation = -90;  tCol = 2; bCol = 3; sCol = 1; }
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


          const rBot = this.createInnerBevelBorder(false); // bevel border right block bottom
          const rTop = this.createInnerBevelBorder(true).rotateZ(180);

          //tbrl
          r.tri(this.createInnerBevelTriangle(false, rBot).rotateZ(rotation), tbrl[bCol]);
          r.tri(this.createInnerBevelTriangle(false, rBot, p2).rotateZ(rotation), tbrl[sCol]);
          r.tri(this.createInnerBevelTriangle(true, rTop).rotateZ(rotation), tbrl[tCol]);
          r.tri(this.createInnerBevelTriangle(true, rTop, p).rotateZ(rotation), tbrl[sCol]);

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
          ps.forEach((pp, i) => r.quad(pp));
          r.quad(right15);
          r.quad(left15);
          r.quad(top15);
          r.quad(bot15);
          r.quad(middle);
          const t1 = this.createInnerBevelTriangle(false, leftP);
          const t2 = this.createInnerBevelTriangle(false, leftP, ps[5]);
          r.tri(t1.rotateZ(rotation), tbrl[1] );
          r.tri(t2.rotateZ(rotation), tbrl[2]);
          r.tri(t1.clone().rotateZ(rotation + 90), tbrl[2]);
          r.tri(t2.clone().rotateZ(rotation + 90), tbrl[0]);
          r.tri(t1.clone().rotateZ(rotation + 180), tbrl[0]);
          r.tri(t2.clone().rotateZ(rotation + 180), tbrl[3]);
          r.tri(t1.clone().rotateZ(rotation -90), tbrl[3]);
          r.tri(t2.clone().rotateZ(rotation  -90), tbrl[1]);
          break;
      }
    }
    return r;
  }

  buildInnerCorners(flag, side, tbrl, state) {
    // TODO: try and integrate in usual process, generates (culled) extra triangles in the inner corners
    // which arent necessary right now...
    // Not sure how to avoid them at this point...
    // (when the other edges are also obscured)
    const s = this.inset;
    const vectors = state.vectors;
    const u = this.unitSize;
    let rotation = 0;
    const r = new BuildResult(side);
    let leftP, rightP, lp, l1, l2;
    // console.log(flag, side);
    // only ifthe corner between isnt filled as well..
    switch(flag) {
      case 5: // top & right
       if(this.testInnerCorner(tbrl[2], tbrl[0], side, state))
        this.createInnerCorner(false, 180, r, tbrl[2], tbrl[0]);
        break;
      case 6: // bot & right : base
        if(this.testInnerCorner(tbrl[1], tbrl[2], side, state))
          this.createInnerCorner(true, 0, r, tbrl[1], tbrl[2]);
        break;
      case 9: // left + top
        // console.log('TODO');
        //this.createInnerCorner(true, 180, r, 6, 6);
          if(this.testInnerCorner(tbrl[0], tbrl[3], side, state))
            this.createInnerCorner(true, 180, r, tbrl[0], tbrl[3]);
        break;
      case 10:// left + bot  : base
        if(this.testInnerCorner(tbrl[1], tbrl[3], side, state))
          this.createInnerCorner(false, 0, r, tbrl[3], tbrl[1]);
        break;
      case 14: // left & right & bot
        if(this.testInnerCorner(tbrl[1], tbrl[3], side, state))
          this.createInnerCorner(false, 0, r, tbrl[3], tbrl[1]);
        if(this.testInnerCorner(tbrl[1], tbrl[2], side, state))
          this.createInnerCorner(true, 0, r, tbrl[1], tbrl[2]);
        break;
      case 11: // left & bot & top
        //this.createInnerCorner(false, 0, r);
          if(this.testInnerCorner(tbrl[1], tbrl[3], side, state))
            this.createInnerCorner(false, 0, r, tbrl[3], tbrl[1]);

              if(this.testInnerCorner(tbrl[0], tbrl[3], side, state))
                this.createInnerCorner(true, 180, r, tbrl[0], tbrl[3]);
        break;
      case 7: // bot & right & top
        if(this.testInnerCorner(tbrl[2], tbrl[0], side, state))
        this.createInnerCorner(false, 180, r, tbrl[2], tbrl[0]);
        if(this.testInnerCorner(tbrl[2], tbrl[1], side, state))
        this.createInnerCorner(true, 0, r, tbrl[1], tbrl[2]);
        break;
      case 11: // left & bot & top

        if(this.testInnerCorner(tbrl[0], tbrl[3], side, state))
          this.createInnerCorner(true, 180, r, tbrl[0], tbrl[3]);

          if(this.testInnerCorner(tbrl[1], tbrl[3], side, state))
            this.createInnerCorner(false, 0, r, tbrl[3], tbrl[1]);
        break;
      case 13: // left & right & top

        if(this.testInnerCorner(tbrl[0], tbrl[3], side, state))
          this.createInnerCorner(true, 180, r, tbrl[0], tbrl[3]);
         if(this.testInnerCorner(tbrl[2], tbrl[0], side, state))
          this.createInnerCorner(false, 180, r, tbrl[2], tbrl[0]);
        break;

      case 3: // Top and bottom
      case 12: // left & right
      // opposing: ignore
        break;
      case 1: // 'top' is filled in..
      case 2: // only bot is filled in.
      case 4: // only right is filled in.
      case 8: // only left is filled in.
        break;
    }
    return r;
  }

  testInnerCorner(t, r, s, state) {
    const corner = state.diagonal(t, r, true);
    if (corner) return false;
    if(state.diagonal(t, s, true) &&  state.diagonal(r, s, true)) {
      return false;
    }
    return true;
  }

  createInnerCorner(botRight, rotation, r, cSide, cSide2) {
    if (botRight) {
      const leftP = this.createInnerBevelBorder(false);
      const rightP = this.createInnerBevelBorder(true);
      const lp = this.createInnerBevelBorder(false);
      const l1 = this.createInnerBevelTriangle(false, leftP);
      const l2 = this.createInnerBevelTriangle(false, leftP, rightP.clone().rotateZ(90));
      r.tri(l1.clone().rotateZ(rotation), cSide);
      r.tri(l2.clone().rotateZ(rotation), cSide2);
    } else  {
      // BOT LEFT
      const leftP = this.createInnerBevelBorder(false);
      const rightP = this.createInnerBevelBorder(true);
      const lp = this.createInnerBevelBorder(false);
      const l1 = this.createInnerBevelTriangle(false, leftP);
      const l2 = this.createInnerBevelTriangle(false, leftP, rightP.clone().rotateZ(90));

      r.tri(l1.clone().rotateZ(rotation - 90), cSide);
      r.tri(l2.clone().rotateZ(rotation - 90), cSide2);
    }
  }

  createInnerBevelTriangle(rightSide, rBot, top) {
    const u = this.unitSize;
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
    const botQuad = new Quad(this.unitSize);
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

  buildFront(state, results) {
    const flanks = [2, 3, 4, 5]; // top, bot, right, left
    const side = 0;
    let flag = 0;
    flanks.forEach((v, i) => {
      if (BitFlags.isSet(state.flag, 1 << v)) {
        flag =  BitFlags.set(flag, 1 << i);
      }
    });
    if (state.sides[side]) {
      if (flag && this.mode === 2) {
        // console.log('back', flag);
        const r = this.buildInnerCorners(flag, side, flanks, state);
        r.quads.forEach(q => results[q.t].quads.push(q.v));
        r.tris.forEach(q => results[q.t].tris.push(q.v));
      }
      return;
    }
    const r = this.buildQuads(flag, side, flanks, state);
    r.quads.forEach(q => results[q.t].quads.push(q.v));
    r.tris.forEach(q => results[q.t].tris.push(q.v));
  }

  buildBack(state, results) {
    const flanks = [2, 3, 5, 4];
    let flag = 0;
    flanks.forEach((v, i) => {
      if (BitFlags.isSet(state.flag, 1 << v)) {
        flag =  BitFlags.set(flag, 1 << i);
      }
    });
    if (state.sides[1]) {
      if (flag && this.mode === 2) {
        // console.log('back', flag);
        const r = this.buildInnerCorners(flag, 1, flanks, state);
        r.quads.forEach(q => results[q.t].quads.push(q.v.back()));
        r.tris.forEach(q => results[q.t].tris.push(q.v.back()));
      }
      return;
    }
    const r = this.buildQuads(flag, 1, flanks, state);
    r.quads.forEach(q => results[q.t].quads.push(q.v.back()));
    r.tris.forEach(q => results[q.t].tris.push(q.v.back()));
  }

  buildTop(state, results) {
    let flag = 0;
    const flanks = [1, 0, 4, 5];
    flanks.forEach((v, i) => {
      if (BitFlags.isSet(state.flag, 1 << v)) {
        flag =  BitFlags.set(flag, 1 << i);
      }
    });
    if (state.sides[2]) {
      if (flag) {
        // console.log('top', flag);
        if (flag && this.mode === 2) {
          // console.log('back', flag);
          const r = this.buildInnerCorners(flag, 2, flanks, state);
          r.quads.forEach(q => results[q.t].quads.push(q.v.top()));
          r.tris.forEach(q => results[q.t].tris.push(q.v.top()));
        }
      }
      // Top is obscured, left & right are visible... = flag 12  needs iner corners
      // console.log(flag);
      return;
    }
    const r = this.buildQuads(flag, 2, flanks, state);
    r.quads.forEach(q => results[q.t].quads.push(q.v.top()));
    r.tris.forEach(q => results[q.t].tris.push(q.v.top()));
  }

  buildBottom(state, results) {
    let flag = 0;
    const flanks = [0, 1, 4, 5];
    flanks.forEach((v, i) => {
      if (BitFlags.isSet(state.flag, 1 << v)) {
        flag =  BitFlags.set(flag, 1 << i);
      }
    });
    if (state.sides[3]) {
      if (flag && this.mode === 2) {
        // console.log('back', flag);
        const r = this.buildInnerCorners(flag, 3, flanks, state);
        r.quads.forEach(q => results[q.t].quads.push(q.v.bottom()));
        r.tris.forEach(q => results[q.t].tris.push(q.v.bottom()));
      }
      return;
    }
    const r = this.buildQuads(flag, 3, flanks, state);
    r.quads.forEach(q => results[q.t].quads.push(q.v.bottom()));
    r.tris.forEach(q => results[q.t].tris.push(q.v.bottom()));
  }

  buildRight(state, results) {
    let flag = 0;
    const flanks = [2, 3, 1, 0];
    flanks.forEach((v, i) => {
      if (BitFlags.isSet(state.flag, 1 << v)) {
        flag =  BitFlags.set(flag, 1 << i);
      }
    });
    if (state.sides[4]) {
      if (flag && this.mode === 2) {
        // console.log('back', flag);
        const r = this.buildInnerCorners(flag, 4, flanks, state);
        r.quads.forEach(q => results[q.t].quads.push(q.v.right()));
        r.tris.forEach(q => results[q.t].tris.push(q.v.right()));
      }
      return;
    }
    const r = this.buildQuads(flag, 4, flanks, state);
    r.quads.forEach(q => results[q.t].quads.push(q.v.right()));
    r.tris.forEach(q => results[q.t].tris.push(q.v.right()));
  }

  buildLeft(state, results) { // yellow
    let flag = 0;
    const flanks = [2, 3, 0, 1];
    flanks.forEach((v, i) => {
      if (BitFlags.isSet(state.flag, 1 << v)) {
        flag =  BitFlags.set(flag, 1 << i);
      }
    });
    if (state.sides[5]) {
      if (flag && this.mode === 2) {
        // console.log('back', flag);
        const r = this.buildInnerCorners(flag, 5, flanks, state);
        r.quads.forEach(q => results[q.t].quads.push(q.v.left()));
        r.tris.forEach(q => results[q.t].tris.push(q.v.left()));
      }
      return;
    }
    const r = this.buildQuads(flag, 5, flanks, state);
    r.quads.forEach(q => results[q.t].quads.push(q.v.left()));
    r.tris.forEach(q => results[q.t].tris.push(q.v.left()));
  }


}
