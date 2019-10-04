
export default function backgroundUpdater ( gl: WebGLRenderingContext, r, g, b, a) {
    gl.clearColor(r, g, b, a);
    gl.clear(gl.COLOR_BUFFER_BIT);
}
