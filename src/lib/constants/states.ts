import { IVector3, Vector3 } from "../data/Vector3";

export const States = {
    front: 0,
    back: 1,
    top: 2,
    bottom: 3,
    right: 4,
    left: 5

};

export const Layers = {
  solid: 0,
  transparent: 1
}

export const StateFlag = {
  FRONT: 1 << States.front,
  BACK: 1 << States.back,
  TOP: 1 << States.top,
  BOTTOM: 1 << States.bottom,
  RIGHT: 1 << States.right,
  LEFT: 1 << States.left
};


export const Vertices = {
  FUL: {
    flag: StateFlag.FRONT | StateFlag.TOP | StateFlag.LEFT
  },
  FUR: {
    flag: StateFlag.FRONT | StateFlag.TOP | StateFlag.RIGHT
  },
  BUL: {
    flag: StateFlag.BACK| StateFlag.TOP| StateFlag.LEFT
  },
  BUR: {
    flag: StateFlag.BACK | StateFlag.TOP | StateFlag.RIGHT
  },
  FDL: {
    flag: StateFlag.FRONT | StateFlag.BOTTOM | StateFlag.LEFT
  },
  FDR: {
    flag: StateFlag.FRONT | StateFlag.BOTTOM | StateFlag.RIGHT
  },
  BDL: {
    flag: StateFlag.BACK | StateFlag.BOTTOM | StateFlag.LEFT
  },
  BDR: {
    flag: StateFlag.BACK | StateFlag.BOTTOM | StateFlag.RIGHT
  }
};

export interface SideType {
  side: number;
  flag: number;
  vector: IVector3;

}

export interface FaceType extends SideType {
  flanks: Array<number>;
}

export const Faces = {
  FRONT: {
    side: States.front,
    flag: StateFlag.FRONT,
    vector: Vector3.of(0, 0, 1),
    flanks: [States.top, States.bottom, States.right, States.left],
  },
  BACK: {
    side: States.back,
    flag: StateFlag.BACK,
    vector: Vector3.of(0, 0, -1),
    flanks: [States.top, States.bottom, States.left, States.right],
  },
  TOP: {
    side: States.top,
    flag: StateFlag.TOP,
    vector: Vector3.of(0, 1, 0),
    flanks: [States.back, States.front, States.right, States.left],
  },
  BOTTOM: {
    side: States.bottom,
    flag: StateFlag.BOTTOM,
    vector: Vector3.of(0, -1, 0),
    flanks: [States.front, States.back, States.right, States.left],
  },
  RIGHT: {
    side: States.right,
    flag: StateFlag.RIGHT,
    vector: Vector3.of(1, 0, 0),
    flanks: [States.top, States.bottom, States.back, States.front],
  },
  LEFT: {
    side: States.left,
    flag: StateFlag.LEFT,
    vector: Vector3.of(-1, 0, 0),
    flanks: [States.top, States.bottom, States.front, States.back],
  }
}
export const ExtendedStates = {
  UR: {
    side : 6,
    flag: StateFlag.TOP | StateFlag.RIGHT,
    vector: Vector3.of(1, 1, 0)
  },
  URB: {
    side :7,
    flag: StateFlag.TOP | StateFlag.RIGHT | StateFlag.BACK,
    vector: Vector3.of(1, 1, -1)
  },
  UB: {
    side : 8,
    flag: StateFlag.TOP | StateFlag.BACK,
    vector: Vector3.of(0, 1, -1)
  },
  ULB: {
    side : 9,
    flag: StateFlag.TOP | StateFlag.LEFT | StateFlag.BACK,
    vector: Vector3.of(-1, 1, -1)
  },
  UL: {
    side : 10,
    flag: StateFlag.TOP | StateFlag.LEFT,
    vector: Vector3.of(-1, 1, 0)
  },
  ULF: {
    side : 11,
    flag: StateFlag.TOP | StateFlag.LEFT| StateFlag.FRONT,
    vector: Vector3.of(-1, 1, 1)
  },
  UF: {
    side : 12,
    flag: StateFlag.TOP | StateFlag.FRONT,
    vector: Vector3.of(0, 1, 1)
  },
  URF: {
    side : 13,
    flag: StateFlag.TOP | StateFlag.RIGHT | StateFlag.FRONT,
    vector: Vector3.of(1, 1, 1)
  },
  LB: {
    side : 14,
    flag: StateFlag.LEFT | StateFlag.BACK,
    vector: Vector3.of(-1, 0, -1)
  },
  RB: {
    side : 15,
    flag: StateFlag.RIGHT | StateFlag.BACK,
    vector: Vector3.of(1, 0, -1)
  },
  RF: {
    side : 16,
    flag: StateFlag.RIGHT | StateFlag.FRONT,
    vector: Vector3.of(1, 0, 1)
  },
  LF: {
    side : 17,
    flag: StateFlag.LEFT | StateFlag.FRONT,
    vector: Vector3.of(-1, 0, 1)
  },
  DR: {
    side : 18,
    flag: StateFlag.BOTTOM| StateFlag.RIGHT,
    vector: Vector3.of(1, -1, 0)
  },
  DRB: {
    side : 19,
    flag: StateFlag.BOTTOM | StateFlag.RIGHT | StateFlag.BACK,
    vector: Vector3.of(1, -1, -1)
  },
  DB: {
    side : 20,
    flag: StateFlag.BOTTOM | StateFlag.BACK,
    vector: Vector3.of(0, -1, -1)
  },
  DLB: {
    side : 21,
    flag: StateFlag.BOTTOM | StateFlag.LEFT | StateFlag.BACK,
    vector: Vector3.of(-1, -1, -1)
  },
  DL: {
    side : 22,
    flag: StateFlag.BOTTOM | StateFlag.LEFT,
    vector: Vector3.of(-1, -1, 0)
  },
  DLF: {
    side : 23,
    flag: StateFlag.BOTTOM | StateFlag.LEFT | StateFlag.FRONT,
    vector: Vector3.of(-1, -1, 1)
  },
  DF: {
    side : 24,
    flag: StateFlag.BOTTOM | StateFlag.FRONT,
    vector: Vector3.of(0, -1, 1)
  },
  DRF: {
    side : 25,
    flag: StateFlag.BOTTOM | StateFlag.RIGHT | StateFlag.FRONT,
    vector: Vector3.of(1, -1, 1)
  }
};

/**
function indexSides() {
  const sides: Array<SideType> = [];
  Object.entries(Faces).forEach(([key, value]) => {
    sides[value.side] = value;
  });
  Object.entries(ExtendedStates).forEach(([key, value]) => {
    sides[value.side] = value;
  });
  return sides;
}
*/
