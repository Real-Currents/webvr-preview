import initShaderProgram from './cubemap-shaders';
import generateFace from "./face-generator";

export default function initBuffers (gl: WebGL2RenderingContext):
    {
        program: Function, // init gl shader program
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
    const vertices = [
        -1.0, -1.0, -1.0,
        -1.0, 1.0, -1.0,
        1.0, -1.0, -1.0,
        -1.0, 1.0, -1.0,
        1.0, 1.0, -1.0,
        1.0, -1.0, -1.0,

        -1.0, -1.0, 1.0,
        1.0, -1.0, 1.0,
        -1.0, 1.0, 1.0,
        -1.0, 1.0, 1.0,
        1.0, -1.0, 1.0,
        1.0, 1.0, 1.0,

        -1.0, 1.0, -1.0,
        -1.0, 1.0, 1.0,
        1.0, 1.0, -1.0,
        -1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, -1.0,

        -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,
        -1.0, -1.0, 1.0,
        -1.0, -1.0, 1.0,
        1.0, -1.0, -1.0,
        1.0, -1.0, 1.0,

        -1.0, -1.0, -1.0,
        -1.0, -1.0, 1.0,
        -1.0, 1.0, -1.0,
        -1.0, -1.0, 1.0,
        -1.0, 1.0, 1.0,
        -1.0, 1.0, -1.0,

        1.0, -1.0, -1.0,
        1.0, 1.0, -1.0,
        1.0, -1.0, 1.0,
        1.0, -1.0, 1.0,
        1.0, 1.0, -1.0,
        1.0, 1.0, 1.0
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
        33, 34, 35
    ];

    // Create a buffer to put normals in
    var normalBuffer = gl.createBuffer();
    const normals = [
    //     0, 0, -1,
    //     0, 0, -1,
    //     0, 0, -1,
    //     0, 0, -1,
    //     0, 0, -1,
    //     0, 0, -1,
    //
    //     0, 1, 0,
    //     0, 1, 0,
    //     0, 1, 0,
    //     0, 1, 0,
    //     0, 1, 0,
    //     0, 1, 0,
    //
    //     0, 0, 1,
    //     0, 0, 1,
    //     0, 0, 1,
    //     0, 0, 1,
    //     0, 0, 1,
    //     0, 0, 1,
    //
    //     0, -1, 0,
    //     0, -1, 0,
    //     0, -1, 0,
    //     0, -1, 0,
    //     0, -1, 0,
    //     0, -1, 0,
    //
    //     -1, 0, 0,
    //     -1, 0, 0,
    //     -1, 0, 0,
    //     -1, 0, 0,
    //     -1, 0, 0,
    //     -1, 0, 0,
    //
    //     1, 0, 0,
    //     1, 0, 0,
    //     1, 0, 0,
    //     1, 0, 0,
    //     1, 0, 0,
    //     1, 0, 0
    // ];
    // var innerNormals = [
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
        program: (s => {
            // Get A 2D context for dynamic textures
            /** @type {Canvas2DRenderingContext} */
            const ctx = document.createElement("canvas").getContext("2d");
            ctx.canvas.width = 128;
            ctx.canvas.height = 128;

            // Create a texture.
            const texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

            const faceInfos = [
                { src: 'data/world/skybox-volume-2/DeepSpaceBlue/leftImage-small.png', target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, faceColor: '#F00', textColor: '#0FF', text: '+X' },
                { src: 'data/world/skybox-volume-2/DeepSpaceBlue/rightImage-small.png', target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, faceColor: '#FF0', textColor: '#00F', text: '-X' },
                { src: 'data/world/skybox-volume-2/DeepSpaceBlue/upImage-small.png', target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, faceColor: '#0F0', textColor: '#F0F', text: '+Y' },
                { src: 'data/world/skybox-volume-2/DeepSpaceBlue/downImage-small.png', target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, faceColor: '#0FF', textColor: '#F00', text: '-Y' },
                { src: 'data/world/skybox-volume-2/DeepSpaceBlue/frontImage-small.png', target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, faceColor: '#00F', textColor: '#FF0', text: '+Z' },
                { src: 'data/world/skybox-volume-2/DeepSpaceBlue/backImage-small.png', target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, faceColor: '#F0F', textColor: '#0F0', text: '-Z' },
            ];

            faceInfos.forEach((faceInfo, i, a) => {
                const { src, target, faceColor, textColor, text } = faceInfo;
                // Asynchronously load an image
                const img = new Image();
                img.crossOrigin = '';

                img.id = '' + (i + 1);

                // Use 2d face generator to generate 6 images
                generateFace(ctx, faceColor, textColor, text);
                // generateFace(ctx, faceColor, 16);

                // Upload the canvas to the cubemap face.
                const level = 0;
                const internalFormat = gl.RGBA;
                const format = gl.RGBA;
                const type = gl.UNSIGNED_BYTE;
                const width = 512;
                const height = 512;

                img.style.margin = 'auto';
                img.style.position = 'fixed';
                img.style.top = '0px';
                img.style.left = i * ctx.canvas.width + 'px';
                img.addEventListener('load', function() {
                    // Now that the image has loaded make copy it to the texture.
                    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
                    gl.texImage2D(target, level, internalFormat, format, type, img);
                    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
                });
                img.src = src;
                // ctx.canvas.toBlob((blob) => {
                //     img.src = URL.createObjectURL(blob);
                // });
                // document.body.appendChild(img);

                // Setup each face so it's immediately renderable
                gl.texImage2D(target, level, internalFormat, width, height, 0, format, type, null);
            });
            gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

            return initShaderProgram;
        })(),
        position: vertexBuffer, positionSize: vertices.length,
        normal: normalBuffer, normalSize: normals.length,
        index: indexBuffer, indexSize: indices.length,
        color: colorBuffer, colorSize: colors.length,
        rotation: [ 0.4, 0.7, 0.0 ],
        scale: [ 1.0, 1.0, 1.0 ],
        translation: [ 0.0, 0.0, 0.0 ]
    }
}
