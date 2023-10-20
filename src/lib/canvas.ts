import { vec3 } from "gl-matrix";
import { Subject } from "rxjs";
import { IVector2 } from "./data/Vector2";


export class GLCanvas {
  public clearColor = {x: 0, y: 0, z: 0};
  public get height() {
    return this.canvas.height;
  }

  public get width() {
    return this.canvas.width;
  }

  public onClick = new Subject<IVector2>();

  public readonly gl: WebGL2RenderingContext;

  constructor(public readonly canvas: HTMLCanvasElement) {
    this.gl = canvas.getContext("webgl2") as WebGL2RenderingContext;
    if(!!this.gl) {
      //  document.getElementById('info').innerHTML = 'WebGL 2 is not available.  See <a href="https://www.khronos.org/webgl/wiki/Getting_a_WebGL_Implementation">How to get a WebGL 2 implementation</a>';
        //return;
          console.log(this.gl.getParameter(this.gl.SHADING_LANGUAGE_VERSION));
          console.log(this.gl.getParameter(this.gl.VERSION));

          canvas.addEventListener("click", e => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.onClick.next({x, y});
          });
    } else {
    }
  }

  public clearRect() {
    // Set clear color to black, fully opaque
    this.gl.clearColor(this.clearColor.x, this.clearColor.y, this.clearColor.z, 1.0);
    this.gl.clearDepth(1.0);                 // Clear everything
    this.gl.enable(this.gl.DEPTH_TEST);           // Enable depth testing
    this.gl.depthFunc(this.gl.LEQUAL);            // Near things obscure far things
    // Clear the color buffer with specified clear color
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    //gl.enable(gl.CULL_FACE);
  }

  public to2D(v: vec3): IVector2 {
    // http://webglfactory.blogspot.com/2011/05/how-to-convert-world-to-screen.html
    // let z = v[2] ? v[2] : 1;
    const x = Math.round((( v[0] + 1  ) / 2.0) * this.width );
    //we calculate -point3D.getY() because the screen Y axis is
    //oriented top->down
    const  y = Math.round((( 1 - v[1] ) / 2.0) * this.height );
    return { x, y };
  }

  public toClipSpace(screenPos: IVector2): IVector2 {
    //https://webglfundamentals.org/webgl/lessons/webgl-qna-how-to-get-the-3d-coordinates-of-a-mouse-click.html

      const x = 2 * screenPos.x / this.width - 1;
      const y = -2 * screenPos.y / this.height + 1;
      return { x, y};
  }

  public to3D(x: number, y: number, z = 0): vec3 {
    // this is clip space..
    // see toclipspace
    x = 2.0 * x / this.width - 1;
    y = -2.0 * y / this.height + 1;
    return vec3.fromValues(x, y, 0);
  }



}
