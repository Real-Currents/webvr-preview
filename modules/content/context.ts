import { gl, mat4 }  from 'gl-matrix';

let cubeRotation: number = 0.0;
let inVR = false;
let vrDisplay;

export default function createContext (canvas: HTMLCanvasElement): WebGLRenderingContext {
    const gl: WebGLRenderingContext = (
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
        ) as any as WebGLRenderingContextStrict) as any as WebGLRenderingContext;

    // If we don't have a GL context, give up now

    if (!gl) {
        window.alert('Unable to initialize WebGL. Your browser or machine may not support it.');
        return;
    }

    return gl;
}
