export default function initBuffers (gl: WebGLRenderingContext):
    {
        position: WebGLBuffer, positionSize: number,
        normal: WebGLBuffer, normalSize: number,
        index: WebGLBuffer, indexSize: number,
        color: WebGLBuffer , colorSize: number
    } {
    // Define vertex (position) buffer and vertex values
    const vertexBuffer: WebGLBuffer = gl.createBuffer();
    const vertices = [
        -0.05, -0.05, -0.05,
        -0.05, 0.05, -0.05,
        0.05, -0.05, -0.05,
        -0.05, 0.05, -0.05,
        0.05, 0.05, -0.05,
        0.05, -0.05, -0.05,

        -0.05, -0.05, 0.05,
        0.05, -0.05, 0.05,
        -0.05, 0.05, 0.05,
        -0.05, 0.05, 0.05,
        0.05, -0.05, 0.05,
        0.05, 0.05, 0.05,

        -0.05, 0.05, -0.05,
        -0.05, 0.05, 0.05,
        0.05, 0.05, -0.05,
        -0.05, 0.05, 0.05,
        0.05, 0.05, 0.05,
        0.05, 0.05, -0.05,

        -0.05, -0.05, -0.05,
        0.05, -0.05, -0.05,
        -0.05, -0.05, 0.05,
        -0.05, -0.05, 0.05,
        0.05, -0.05, -0.05,
        0.05, -0.05, 0.05,

        -0.05, -0.05, -0.05,
        -0.05, -0.05, 0.05,
        -0.05, 0.05, -0.05,
        -0.05, -0.05, 0.05,
        -0.05, 0.05, 0.05,
        -0.05, 0.05, -0.05,

        0.05, -0.05, -0.05,
        0.05, 0.05, -0.05,
        0.05, -0.05, 0.05,
        0.05, -0.05, 0.05,
        0.05, 0.05, -0.05,
        0.05, 0.05, 0.05,

        -1.0, 1.0, -1.0,
        -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,
        1.0, 1.0, -1.0,
        -1.0, 1.0, -1.0,
        1.0, -1.0, -1.0,

        -1.0, 1.0, 1.0,
        -1.0, 1.0, -1.0,
        1.0, 1.0, -1.0,
        1.0, 1.0, 1.0,
        -1.0, 1.0, 1.0,
        1.0, 1.0, -1.0,

        1.0, -1.0, 1.0,
        -1.0, -1.0, 1.0,
        -1.0, 1.0, 1.0,
        1.0, -1.0, 1.0,
        -1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,

        1.0, -1.0, -1.0,
        -1.0, -1.0, -1.0,
        -1.0, -1.0, 1.0,
        1.0, -1.0, -1.0,
        -1.0, -1.0, 1.0,
        1.0, -1.0, 1.0,

        -1.0, -1.0, 1.0,
        -1.0, -1.0, -1.0,
        -1.0, 1.0, -1.0,
        -1.0, 1.0, 1.0,
        -1.0, -1.0, 1.0,
        -1.0, 1.0, -1.0,

        1.0, 1.0, -1.0,
        1.0, -1.0, -1.0,
        1.0, -1.0, 1.0,
        1.0, 1.0, -1.0,
        1.0, -1.0, 1.0,
        1.0, 1.0, 1.0
    ];

    // Create a buffer to put normals in
    var normalBuffer = gl.createBuffer();
    const normals = [
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,

        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,

        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,

        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,

        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,

        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,

        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,

        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,

        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,

        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,

        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,

        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0
    ];
    var innerNormals = [
        -1, 1, -1,
        -1, -1, -1,
        1, -1, -1,
        1, 1, -1,
        -1, 1, -1,
        1, -1, -1,

        -1, 1, 1,
        -1, 1, -1,
        1, 1, -1,
        1, 1, 1,
        -1, 1, 1,
        1, 1, -1,

        1, -1, 1,
        -1, -1, 1,
        -1, 1, 1,
        1, -1, 1,
        -1, 1, 1,
        1, 1, 1,

        1, -1, -1,
        -1, -1, -1,
        -1, -1, 1,
        1, -1, -1,
        -1, -1, 1,
        1, -1, 1,

        -1, -1, 1,
        -1, -1, -1,
        -1, 1, -1,
        -1, 1, 1,
        -1, -1, 1,
        -1, 1, -1,

        1, 1, -1,
        1, -1, -1,
        1, -1, 1,
        1, 1, -1,
        1, -1, 1,
        1, 1, 1
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
        1, 0, 0, 1,

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
        3, 4, 5,

        6, 7, 8,
        9, 10, 11,

        12, 13, 14,
        15, 16, 17,

        18, 19, 20,
        21, 22, 23,

        24, 25, 26,
        27, 28, 29,

        30, 31, 32,
        33, 34, 35,

        36, 37, 38,
        39, 40, 41,

        42, 43, 44,
        45, 46, 47,

        48, 49, 50,
        51, 52, 53,

        54, 55, 56,
        57, 58, 59,

        60, 61, 62,
        63, 64, 65,

        66, 67, 68,
        69, 70, 71
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
        color: colorBuffer, colorSize: colors.length
    }
}
