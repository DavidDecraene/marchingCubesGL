export function isPowerOf2(value: number) {
  return (value & (value - 1)) == 0;
}

export class Texture {
  public readonly texture: WebGLTexture;
  public readonly image: HTMLImageElement;
  constructor(public readonly gl: WebGLRenderingContext, src: string) {
    const texture = this.texture = gl.createTexture() as WebGLTexture;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // Fill the texture with a 1x1 blue pixel.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                  new Uint8Array([0, 0, 255, 255]));
    const image = this.image = new Image();
    image.crossOrigin = "";
    image.addEventListener('load', () => {
      // Now that the image has loaded make copy it to the texture.
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);
      // Check if the image is a power of 2 in both dimensions.
       if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
          // Yes, it's a power of 2. Generate mips.
          gl.generateMipmap(gl.TEXTURE_2D);
       } else {
          // No, it's not a power of 2. Turn off mips and set wrapping to clamp to edge
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
       }
    });
    image.src = src;

  }

  public bind(): void {
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
  }
}
