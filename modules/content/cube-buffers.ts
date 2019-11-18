export default function initBuffers (gl: WebGLRenderingContext):
    {
        index: WebGLBuffer, indexSize: number,
        normal: WebGLBuffer, normalSize: number,
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
    const cubePositions = [
        -0.5, -0.5,  -0.5,
        -0.5,  0.5,  -0.5,
        0.5,  0.5,  -0.5,
        0.5, -0.5,  -0.5,

        -0.5, -0.5, 0.5,
        0.5, -0.5, 0.5,
        0.5, 0.5, 0.5,
        -0.5, 0.5, 0.5
    ];

    // Create a buffer to put normals in
    var normalBuffer = gl.createBuffer();
    var normals =
        [
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

    // Define index buffer and index values
    const indexBuffer: WebGLBuffer = gl.createBuffer();
    const indices = [
        0, 1, 2,
        0, 2, 3
    ];
    const cubeIndices = [
        0, 1, 2,
        0, 2, 3,

        4, 5, 7,
        7, 5, 6,

        1, 4, 7,
        1, 0, 4,

        6, 3, 2,
        6, 5, 3,

        1, 7, 2,
        7, 6, 2,

        0, 5, 4,
        5, 0, 3

    ];

    // Load vertex value into bound buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubePositions), gl.STATIC_DRAW);

    // Load color value into bound buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    // Load index values into bound buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);

    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = normalBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    // Put normals data into buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    // Un-bind buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    return {
        index: indexBuffer, indexSize: cubeIndices.length,
        normal: normalBuffer, normalSize: normals.length,
        position: vertexBuffer, positionSize: cubePositions.length,
        color: colorBuffer, colorSize: colors.length
    }
}
