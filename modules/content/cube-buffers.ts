export default function initBuffers (gl: WebGLRenderingContext):
    {
        position: WebGLBuffer, positionSize: number,
        normal: WebGLBuffer, normalSize: number,
        index: WebGLBuffer, indexSize: number,
        color: WebGLBuffer , colorSize: number,
        rotation: Array<number>,
        scale: Array<number>,
        translation: Array<number>
    } {
    // Define vertex (position) buffer and vertex values
    const vertexBuffer: WebGLBuffer = gl.createBuffer();
    const vertices = [-8.392287, -1.0, -1.570847, -8.392287, 1.0, -1.570847, -7.96828, -1.0, -3.525385, -7.96828, 1.0, -3.525385, -6.437749, -1.0, -1.14684, -6.437749, 1.0, -1.14684, -6.013742, -1.0, -3.101378, -6.013742, 1.0, -3.101378];

    // Define index buffer and index values
    const indexBuffer: WebGLBuffer = gl.createBuffer();
    const indices = [1, 2, 0, 3, 6, 2, 7, 4, 6, 5, 0, 4, 6, 0, 2, 3, 5, 7, 1, 3, 2, 3, 7, 6, 7, 5, 4, 5, 1, 0, 6, 4, 0, 3, 1, 5];

    // Create a buffer to put normals in
    const normalBuffer = gl.createBuffer();
    const normals = [
            -1, -1, -1,
            -1, 1, -1,
            1, 1, -1,
            1, -1, -1,

            -1, -1, 1,
            1, -1, 1,
            1, 1, 1,
            -1, 1, 1
        ];

    // Define color buffer and color values (per vertex)
    const colorBuffer: WebGLBuffer = gl.createBuffer();
    const colors = [
        0, 0, 1, 1,
        0, 1, 0, 1,
        0, 0, 1, 1,
        1, 0, 0, 1,

        0, 0, 1, 1,
        0, 1, 0, 1,
        0, 0, 1, 1,
        1, 0, 0, 1
    ];

    // Load vertex value into bound buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = normalBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    // Put normals data into buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

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
        position: vertexBuffer, positionSize: vertices.length,
        normal: normalBuffer, normalSize: normals.length,
        index: indexBuffer, indexSize: indices.length,
        color: colorBuffer, colorSize: colors.length,
        rotation: [ 0.4, 0.7, 0.0 ],
        scale: [ 1.0, 1.0, 1.0 ],
        translation: [ -10.0, 0.0, 0.0 ]
    }
}
