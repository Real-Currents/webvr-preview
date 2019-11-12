// import createContext from './modules/basic/webvr-context';
import backgroundUpdater from "./modules/basic/background-update";
import createContext from './modules/content/context';
import initBuffers from "./modules/content/basic-buffers";
import initShaderProgram from "./modules/content/basic-shaders";
import generateFace from "./modules/content/face-generator";


const canvas: HTMLCanvasElement = window.document.createElement('canvas');

main();

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

    initBuffers(gl);

    // Get A 2D context
    /** @type {Canvas2DRenderingContext} */
    const ctx = document.createElement("canvas").getContext("2d");
    ctx.canvas.width = 128;
    ctx.canvas.height = 128;

    // Use 2d face generator to generate 6 images
    const faceInfos = [
        { faceColor: '#F00', textColor: '#0FF', text: '+X' },
        { faceColor: '#FF0', textColor: '#00F', text: '-X' },
        { faceColor: '#0F0', textColor: '#F0F', text: '+Y' },
        { faceColor: '#0FF', textColor: '#F00', text: '-Y' },
        { faceColor: '#00F', textColor: '#FF0', text: '+Z' },
        { faceColor: '#F0F', textColor: '#0F0', text: '-Z' },
    ];
    faceInfos.forEach((faceInfo, i, a) => {
        const {faceColor, textColor, text} = faceInfo;
        generateFace(ctx, faceColor, textColor, text);

        // show the result
        ctx.canvas.toBlob((blob) => {
            const img = new Image();
            img.src = URL.createObjectURL(blob);
            img.style.margin = 'auto';
            img.style.position = 'fixed';
            img.style.top = '0px';
            img.style.left = i * ctx.canvas.width + 'px';
            document.body.appendChild(img);
        });
    });

}
