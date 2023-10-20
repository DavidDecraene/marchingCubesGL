import { VoxelBuilder } from './builder/voxel.builder';
import { GLCamera } from './camera';
import { GLCanvas } from './canvas';
import { GLMesh } from './data/mesh';
import { GLNode, RootNode } from './data/node';
import { Texture, TextureArray } from './data/texture';
import { VoxelModel } from './data/voxels/voxel.model';
import { GLShaderUtils } from './shader.utils';
import { defer, Observable, scheduled, asyncScheduler } from 'rxjs';
import { switchMap, mergeAll, tap } from 'rxjs/operators';
import { CubeSideMaterial } from './assets/cube.side.material';
import { Vector3 } from './data/Vector3';
import { VoxelTypes } from './data/voxels/voxel.types';
import { TextureArrayMaterial } from './assets/texture.array.material';
import { ArrayTypeBuilder as TypeBuilder } from './data/voxels/voxel.type.builder';
import { RenderLoop } from './data/render/RenderLoop';
import { Ray } from './data/raycast/ray';
import { TreeBuilder } from './data/voxels/builders/tree.builder';
import { LightCalculator } from './data/lighting/LightCalculator';
import { World } from './world/World';
import { GameManager } from './world/GameManager';


function loadShader(url: string): Observable<string> {
  return defer(() => fetch(url)).pipe(switchMap(d => d.text()));
}

export function main() {
  const shaders = {
    vertexShader: "",
    fragmentShader: "",
    arrayVertexShader: "",
    arrayFragmentShader: ""
  }


  const operations = [
    loadShader("./shaders/textured.vertex.shader.glsl").pipe(tap(t => shaders.vertexShader = t)),
    loadShader("./shaders/textured.fragment.shader.glsl").pipe(tap(t => shaders.fragmentShader = t)),
      loadShader("./shaders/textureArray.vertex.shader.glsl").pipe(tap(t => shaders.arrayVertexShader = t)),
      loadShader("./shaders/textureArray.fragment.shader.glsl").pipe(tap(t => shaders.arrayFragmentShader = t))
  ];

  scheduled(operations, asyncScheduler).pipe(mergeAll(5)).subscribe({
    error: r => console.error(r),
    complete: () => {
      // start everything

      const canvas = new GLCanvas(document.getElementById("canvas") as HTMLCanvasElement);


      const gl = canvas.gl;
      gl.enable(gl.CULL_FACE);

/**
 gl.enable(gl.DEPTH_TEST);
 gl.depthFunc(gl.LEQUAL)
 gl.depthMask(false); */
 gl.enable(gl.BLEND);
 // ONE_MINUS_SRC_ALPHA
 //gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
 gl.blendFunc(gl.SRC_ALPHA, gl.SRC_ALPHA_SATURATE);


      const typeDB = new VoxelTypes();
      const [grass, dirt, wood, leaves] = [1, 2, 3, 4];

      const textureArray = new TextureArray(gl, ['./textures/sprite_2.png',
    './textures/sprite_1.png',
  './textures/sprite_0.png',
'./textures/bark_8.png',
'./textures/leaves_8_TP.png']);
      typeDB.addType(new TypeBuilder(0).sides(2).top(1).build(grass));
      typeDB.addType(new TypeBuilder(0).build(dirt));
      typeDB.addType(new TypeBuilder(3).build(wood));
      typeDB.addType(new TypeBuilder(4).transparent().build(leaves));
      const voxelModel = new VoxelModel(Vector3.of(16, 16, 16), typeDB);

      const bounds = {
        min: Vector3.of(0, 0, 0),
        max: Vector3.of(8, 8, 8)
      }
      for( let x = bounds.min.x; x <= bounds.max.x; x++) {
          for(let z = bounds.min.z; z <= bounds.max.z; z++){
            //voxelModel.setVoxel(Vector3.of(x, -1, z), { type: 2 });
            voxelModel.setVoxel(Vector3.of(x, 0, z), { type: dirt });
            voxelModel.setVoxel(Vector3.of(x, 1, z), { type: dirt });
            voxelModel.setVoxel(Vector3.of(x, 2, z), { type: grass });
          }

      }

      const treeBuilder = new TreeBuilder(() => {
        return { type: leaves };
      }, () => {
          return { type: wood };
       });
      treeBuilder.buildAt(Vector3.of(5, 3, 5), voxelModel);

      let currentMode = 1;
      let currentInset = 0.3;


      const texture = new Texture(gl, './textures/CubeSides.png');

      const shaderPrograms = {
        cubeShader: new GLShaderUtils(canvas.gl)
          .initShaderProgram(shaders.vertexShader,
           shaders.fragmentShader),
        arrayShader: new GLShaderUtils(canvas.gl)
             .initShaderProgram(shaders.arrayVertexShader,
              shaders.arrayFragmentShader)
      }
      const materials = {
        cubeSides: new CubeSideMaterial(shaderPrograms.cubeShader, gl, texture),
        textureArray: new TextureArrayMaterial(shaderPrograms.arrayShader, gl, textureArray)
      }
      const mesh = new GLMesh(gl);
      const lightCalc =   new LightCalculator();
    //  mesh.material = materials.cubeSides;
       mesh.material = materials.textureArray;
      function updateMesh(mode: number, mesh: GLMesh) {
        const voxelBuilder2 = new VoxelBuilder(voxelModel, typeDB);
        voxelBuilder2.mode = mode;
        voxelBuilder2.inset = currentInset;
        voxelModel.getSectors().forEach(sector => {
          if (sector.voxelCount) {
            sector.lightData = lightCalc.calculate(sector);
          }

          sector.values.forEach(v => {
            voxelBuilder2.append(v.position, v.voxel);
          });
        });
        mesh.data = voxelBuilder2.data;
        mesh.createBuffers();
      }
      updateMesh(currentMode, mesh);
      const camera = new GLCamera(gl);
      const worldNode = new RootNode();
      const rotationNode = new GLNode().appendTo(worldNode);

      worldNode.onWorldMatrixChange.subscribe(mat => camera.updateWorldMatrix(mat));
      const node = new GLNode().appendTo(rotationNode);
      node.mesh = mesh;



      const scale = 1/4;
      Vector3.copyTo(Vector3.of(scale, scale, scale), worldNode.localScale);
      //worldNode.localTranslation.x = -4.0;
      worldNode.localTranslation.y = 0.5;
      worldNode.localTranslation.z = -6.0;
      worldNode.localRotation.x = Math.PI * 35/180;
        //worldNode.localTranslation.x = -4.0;
      rotationNode.localRotation.y = Math.PI * -45/180;

      const world = new World();

      GameManager.setWorld(world);

      const ray = new Ray();

      canvas.onClick.subscribe(v => {
        ray.update(canvas.toClipSpace(v), camera.inverseViewProjectionMatrix);
        console.log("ray", ray);

      });

      //console.log(sunLight, sunLight.update());


      const renderLoop = new RenderLoop(() => {

        GameManager.update();
        world.update();
        Vector3.copyTo(world.lightColor, materials.textureArray.lightColor);
        Vector3.copyTo(world.lightColor, canvas.clearColor);


        canvas.clearRect();
        worldNode.updateAll();
        worldNode.draw({
          gl, camera, world
        });

      });
      renderLoop.start();

    }
  });

}
