
import { Observable, from } from 'rxjs';
import { mergeMap, toArray } from 'rxjs/operators';

export function isPowerOf2(value: number) {
  return (value & (value - 1)) == 0;
}

function loadImage(imagePath: string): Observable<HTMLImageElement>{
   return new Observable(function(observer){
     const img = new Image();
     img.src = imagePath;
     img.onload = () => {
       observer.next(img);
       observer.complete();
     }
     img.onerror = (err) => {
       observer.error(err);
     }
   });
}

export class TextureArray  {
  public readonly texture: WebGLTexture;


  constructor(public readonly gl: WebGL2RenderingContext, src: Array<string>){
    const texture = this.texture = gl.createTexture() as WebGLTexture;
    // Fill the texture with a 1x1 blue pixel.
  /**  gl.texImage3D(
        gl.TEXTURE_2D_ARRAY,
        0,
        gl.RGBA,
        1,
        1,
        src.length,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
                  new Uint8Array([0, 0, 255, 255])); */
    from(src).pipe(mergeMap(s => loadImage(s)), toArray()).subscribe(images => {
      const width = images[0].width, height = images[0].height, imageCount = images.length;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D_ARRAY, texture);


      gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texImage3D(
          gl.TEXTURE_2D_ARRAY,
          0,
          gl.RGBA,
          width,
          height,
          imageCount,
          0,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          null
      );
      images.forEach((s, i) => {
        gl.texSubImage3D(gl.TEXTURE_2D_ARRAY,
          0, 0, 0, i, width, height, 1, gl.RGBA, gl.UNSIGNED_BYTE, s);
      });

    });

  }
}

export class Texture  {
  public readonly texture: WebGLTexture;
  constructor(public readonly gl: WebGLRenderingContext, src: string) {
    const texture = this.texture = gl.createTexture() as WebGLTexture;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // Fill the texture with a 1x1 blue pixel.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                  new Uint8Array([0, 0, 255, 255]));
    loadImage(src).subscribe(img => {
      // Now that the image has loaded make copy it to the texture.
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, img);
      // Check if the image is a power of 2 in both dimensions.
       if (isPowerOf2(img.width) && isPowerOf2(img.height)) {
          // Yes, it's a power of 2. Generate mips.
          gl.generateMipmap(gl.TEXTURE_2D);
       } else {
          // No, it's not a power of 2. Turn off mips and set wrapping to clamp to edge
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
       }
    });

  }
}
