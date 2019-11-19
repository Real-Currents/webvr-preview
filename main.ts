// import createContext from './modules/basic/webvr-context';
import backgroundUpdater from "./modules/basic/background-update";
import createContext from './modules/content/context';
import initBuffers from "./modules/content/cube-buffers";
import initShaderProgram from "./modules/content/cubemap-shaders";
import generateFace from "./modules/content/face-generator";

const canvas: HTMLCanvasElement = window.document.createElement('canvas');
//
// Start here
//
function main () {
    // Attach canvas to window
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.display = 'block';
    canvas.style.margin = 'auto';
    canvas.style.width = window.outerWidth + 'px';
    if (window.outerWidth * 0.99 * canvas.height / canvas.width < window.innerHeight) {
        canvas.style.height = window.outerWidth * canvas.height / canvas.width + 'px';
    } else {
        canvas.style.height = window.outerHeight * 0.99 + 'px';
        canvas.style.width = window.outerHeight * canvas.width / canvas.height + 'px';
    }

    window.document.body.append(canvas);

    window.document.body.style.backgroundColor = "#000000";
    window.document.body.style.margin = '0px';
    window.document.body.style.overflow = 'hidden';

    const gl = createContext(canvas, initBuffers, initShaderProgram);

    backgroundUpdater(gl);

    // Get A 2D context
    /** @type {Canvas2DRenderingContext} */
    const ctx = document.createElement("canvas").getContext("2d");
    ctx.canvas.width = 128;
    ctx.canvas.height = 128;

    // Create a texture.
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

    const faceInfos = [
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, faceColor: '#F00', textColor: '#0FF', text: '+X' },
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, faceColor: '#FF0', textColor: '#00F', text: '-X' },
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, faceColor: '#0F0', textColor: '#F0F', text: '+Y' },
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, faceColor: '#0FF', textColor: '#F00', text: '-Y' },
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, faceColor: '#00F', textColor: '#FF0', text: '+Z' },
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, faceColor: '#F0F', textColor: '#0F0', text: '-Z' },
    ];

    faceInfos.forEach((faceInfo, i, a) => {
        const { target, faceColor, textColor, text } = faceInfo;
        const img = new Image();

        img.id = 'image-' + (i + 1);

        // Use 2d face generator to generate 6 images
        generateFace(ctx, faceColor, textColor, text);

        // Upload the canvas to the cubemap face.
        const level = 0;
        const internalFormat = gl.RGBA;
        const format = gl.RGBA;
        const type = gl.UNSIGNED_BYTE;
        const width = 512;
        const height = 512;
        // gl.texImage2D(target, level, internalFormat, format, type, ctx.canvas);

        // Setup each face so it's immediately renderable
        gl.texImage2D(target, level, internalFormat, width, height, 0, format, type, null);

        // Asynchronously load an image
        // const img = new Image();
        // img.src = url;
        img.addEventListener('load', function() {
            console.log(`Image ${img.id} loaded!`);

            // Now that the image has loaded make copy it to the texture.
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
            gl.texImage2D(target, level, internalFormat, format, type, img);
            gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        });

        // show the result
        ctx.canvas.toBlob((blob) => {
            console.log(`Loading ${img.id} ...`);
            img.src = URL.createObjectURL(blob);
            img.style.margin = 'auto';
            img.style.position = 'fixed';
            img.style.top = '0px';
            img.style.left = i * ctx.canvas.width + 'px';
            // document.body.appendChild(img);
        });
    });
    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

}

main();
