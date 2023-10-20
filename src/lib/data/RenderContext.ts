import { GLCamera } from "../camera";
import { World } from "../world/World";

export interface RenderContext {
  camera: GLCamera;
  gl: WebGL2RenderingContext;
  world: World;
}
