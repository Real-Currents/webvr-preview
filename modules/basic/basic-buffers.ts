export default function initBuffers (gl: WebGL2RenderingContext):
    {
        index: WebGLBuffer, indexSize: number,
        position: WebGLBuffer, positionSize: number,
        color: WebGLBuffer , colorSize: number
    } {
    // Define vertex (position) buffer and vertex values
    const vertexBuffer: WebGLBuffer = gl.createBuffer();
    const vertices = [
        -0.5, 0.5, 0,
        -0.5, -0.5, 0,
        0.5, -0.5, 0,
        0.5, 0.5, 0
    ];

    // Define color buffer and color values (per vertex)
    const colorBuffer: WebGLBuffer = gl.createBuffer();
    const colors = [
        0, 0, 1, 1,
        0, 1, 0, 1,
        0, 0, 1, 1,
        1, 0, 0, 1
    ];

    // Define index buffer and index values
    const indexBuffer: WebGLBuffer = gl.createBuffer();
    const indices = [
        0, 1, 2,
        0, 2, 3
    ];

    // Load vertex value into bound buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    // Load color value into bound buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    // Load index values into bound buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    // Un-bind buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    return {
        index: indexBuffer, indexSize: indices.length,
        position: vertexBuffer, positionSize: vertices.length,
        color: colorBuffer, colorSize: colors.length
    }
}
