// import createContext from './modules/basic/webvr-context';
import backgroundUpdater from "./modules/basic/background-update";
import createContext from './modules/content/context';
import initBuffers from "./modules/content/basic-buffers";
import initShaderProgram from "./modules/content/basic-shaders";


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

    const gl: WebGLRenderingContext = createContext(canvas, initBuffers, initShaderProgram);

    backgroundUpdater(gl);

    initBuffers(gl);
}
