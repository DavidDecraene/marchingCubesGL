import { TexCoords } from "./TexCoords";
import { Texture } from "./texture";

export class VoxelType {

  public readonly colors = [
    [1.0,  1.0,  1.0,  1.0],// front white
    [1.0,  0.0,  0.0,  1.0], // back red
    [0.0,  1.0,  0.0,  1.0], // green top
    [0.0,  0.0,  1.0,  1.0], // bot: blue
    [1.0,  1.0,  0.0,  1.0], // r: yellow.
    [1.0,  0.0,  1.0,  1.0], // l: pink
    [1.0,  0.4,  0.1,  1.0] // testing
  ];

  constructor(public readonly type: number,
    public readonly texture: Texture,
    public readonly texCoords: Array<TexCoords>) {
    // front, back, top, bot, right, left
  }
}
