export default function initBuffers (gl: WebGLRenderingContext): { index: WebGLBuffer, position: WebGLBuffer, color: WebGLBuffer } {
    // Define vertex (position) buffer and vertex values
    const vertexBuffer: WebGLBuffer = gl.createBuffer();
    const vertices = new Float32Array([
        -0.5, 0.5, 0,
        -0.5, -0.5, 0,
        0.5, -0.5, 0,
        0.5, 0.5, 0
    ]);

    // Define color buffer and color values (per vertex)
    const colorBuffer: WebGLBuffer = gl.createBuffer();
    const colors = new Float32Array([
        0, 0, 1, 1,
        0, 1, 0, 1,
        1, 0, 0, 1,
        0, 0, 0, 1
    ]);

    // Define index buffer and index values
    const indexBuffer: WebGLBuffer = gl.createBuffer();
    const indices = new Uint16Array([
        0, 1, 2,
        // 0, 2, 3
    ]);

    // Load vertex value into bound buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // Load color value into bound buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    // Load index values into bound buffer
    // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    // gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    // Un-bind buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    return {
        index: indexBuffer,
        position: vertexBuffer,
        color: colorBuffer,
    }
}

//
// initBuffers
//
// Initialize the buffers we'll need. For this demo, we just
// have one object -- a simple three-dimensional cube.
//
// export default function initBuffers(gl) {
//
//     // Create a buffer for the cube's vertex positions.
//
//     const positionBuffer = gl.createBuffer();
//
//     // Select the positionBuffer as the one to apply buffer
//     // operations to from here out.
//
//     gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
//
//     // Now create an array of positions for the triangle.
//
//     const positions = [
//         -1.0, -0.57, -0.5,
//         1.0, -0.57, -0.5,
//         0,    0.86, -0.5,
//     ];
//
//     // Now pass the list of positions into WebGL to build the
//     // shape. We do this by creating a Float32Array from the
//     // JavaScript array, then use it to fill the current buffer.
//
//     gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
//
//     // Convert the array of colors into a table for all the vertices.
//
//     let colors = [
//         0, 0, 1, 1,
//         0, 1, 0, 1,
//         0, 0, 0, 1,
//     ];
//
//     const colorBuffer = gl.createBuffer();
//     gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
//     gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
//
//
//     return {
//         position: positionBuffer,
//         color: colorBuffer,
//     };
// }
