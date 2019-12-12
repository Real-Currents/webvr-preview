// import createContext from './modules/basic/webvr-context';
import backgroundUpdater from "./modules/basic/background-update";
import createContext from './modules/content/context';
import initBuffers from "./modules/content/cube-buffers";
import innerBuffers from "./modules/content/inner-cube-buffers";
import initShaderProgram from "./modules/content/cubemap-shaders";
import generateFace from "./modules/content/grid-generator";

const canvas: HTMLCanvasElement = (window.document.querySelector('canvas#cv') !== null) ?
    window.document.querySelector('canvas#cv') :
    window.document.createElement('canvas');

//
// Start here
//
function main () {
    // Attach canvas to window
    if (canvas.id !== 'cv') {
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
    }

    window.document.body.style.backgroundColor = "#000000";
    window.document.body.style.margin = '0px';
    window.document.body.style.overflow = 'hidden';

    const { gl, updateContext } = createContext(canvas, initBuffers, initShaderProgram);

    backgroundUpdater(gl);

    // Get A 2D context for dynamic textures
    /** @type {Canvas2DRenderingContext} */
    const ctx = document.createElement("canvas").getContext("2d");
    ctx.canvas.width = 512;
    ctx.canvas.height = 512;

    // Create a texture.
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

    let frame = 0;
    let timeout = null;
    let lastKeyPress = (new Date()).getTime();
    window['userTriggered'] = false;

    const aCanvas = document.createElement('canvas');
    const bCanvas = document.createElement('canvas');
    const cCanvas = document.createElement('canvas');
    const dCanvas = document.createElement('canvas');
    const eCanvas = document.createElement('canvas');
    const fCanvas = document.createElement('canvas');
    aCanvas.width =
        bCanvas.width =
            cCanvas.width =
                dCanvas.width =
                    eCanvas.width =
                        fCanvas.width = ctx.canvas.width;
    aCanvas.height =
        bCanvas.height =
            cCanvas.height =
                dCanvas.height =
                    eCanvas.height =
                        fCanvas.height = ctx.canvas.height;

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
        // Asynchronously load an image
        const img = new Image();
        img.crossOrigin = '';

        img.id = '' + (i + 1);

        // Initialize offscreen canvases with face generator to generate 6 images
        const offscreen_ctx = (+img.id === 1) ? aCanvas.getContext('2d') :
            (+img.id === 2) ? bCanvas.getContext('2d') :
                (+img.id === 3) ? cCanvas.getContext('2d') :
                    (+img.id === 4) ? dCanvas.getContext('2d') :
                        (+img.id === 5) ? eCanvas.getContext('2d') :
                            fCanvas.getContext('2d');
        offscreen_ctx.globalAlpha = 1.0;
        // Use 2d face generator to generate 6 images
        generateFace(ctx, faceColor, 32);

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
        // document.body.appendChild(img);

        ctx.canvas.toBlob((blob) => {
            img.src = URL.createObjectURL(blob);
        });

        // setInterval(d => {
        //     // Update texture from off-screen canvases
        //     switch ((+img.id)) {
        //         case 1:
        //             ctx.drawImage(aCanvas, 0, 0, aCanvas.width, aCanvas.height);
        //             break;
        //         case 2:
        //             ctx.drawImage(bCanvas, 0, 0, bCanvas.width, bCanvas.height);
        //             break;
        //         case 3:
        //             ctx.drawImage(cCanvas, 0, 0, cCanvas.width, cCanvas.height);
        //             break;
        //         case 4:
        //             ctx.drawImage(dCanvas, 0, 0, dCanvas.width, dCanvas.height);
        //             break;
        //         case 5:
        //             ctx.drawImage(eCanvas, 0, 0, eCanvas.width, eCanvas.height);
        //             break;
        //         default:
        //             ctx.drawImage(fCanvas, 0, 0, fCanvas.width, fCanvas.height);
        //     }
        //
        //     // show the result
        //     ctx.canvas.toBlob((blob) => {
        //         img.src = URL.createObjectURL(blob);
        //     });
        //
        // }, 66);

        // Setup each face so it's immediately renderable
        gl.texImage2D(target, level, internalFormat, width, height, 0, format, type, null);
    });
    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

    window.addEventListener('keydown', function (event: (any | KeyboardEvent)) {
        const kbEvent = (event || window['event']); // cross-browser shenanigans
        // console.log(lastKeyPress, ((new Date()).getTime() - lastKeyPress));
        // console.log(startVideo);

        if (kbEvent['keyCode'] === 32 && ((new Date()).getTime() - lastKeyPress) > 500) { // this is the spacebar
            if (!window['userTriggered']) {
                timeout = setInterval(() => {
                        window['userTriggered'] = true;

                        if (++frame > 100) {
                            updateContext(gl, {
                                'buffers': innerBuffers,
                                'cameraDelta': [0, 0, +0.05],
                                'viewPosition': null,
                                'worldCameraPosition': [0, 0, -2.5]
                            });
                        } else {
                            updateContext(gl, {
                                'cameraDelta': [0, 0, +0.035],
                                'viewPosition': [0, 0, -1],
                                'worldCameraPosition': [0, 0, -1]
                            });
                        }
                    }, 33);
            } else {
                window['userTriggered'] = false;
                clearInterval(timeout);
            }

            kbEvent.preventDefault();

            return true; // treat all other keys normally;

        } else return false;
    });
}

main();
