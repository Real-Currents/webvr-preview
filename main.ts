import createContext from './modules/basic/webvr-context';
import backgroundUpdater from "./modules/basic/background-update";

const canvas: HTMLCanvasElement = window.document.createElement('canvas');

main();

//
// Start here
//
function main () {
    // Attach canvas to window
    canvas.id = 'canvas';
    canvas.width = window.innerWidth / 2;
    canvas.height = window.innerHeight / 2;
    canvas.style.marginLeft = 'auto';
    canvas.style.marginRight = 'auto';
    canvas.style.width = window.outerWidth + 'px';
    if (window.outerWidth * 0.99 * canvas.height / canvas.width < window.innerHeight) {
        canvas.style.height = window.outerWidth * canvas.height / canvas.width + 'px';
    } else {
        canvas.style.height = window.outerHeight * 0.99 + 'px';
        canvas.style.width = window.outerHeight * canvas.width / canvas.height + 'px';
    }
    window.document.body.append(canvas);
    window.document.body.style.margin = '0px';
    window.document.body.style.overflow = 'hidden';

    const gl: WebGLRenderingContext = createContext(canvas);

    (<any>window).onkeydown = function checkKey (event) {
        switch (event['keyCode']) {
            case 49: { // #1 => black
                backgroundUpdater(gl, 0.0, 0.0, 0.0, 1.0);
                break;
            }
            case 50: { // #2 => green
                backgroundUpdater(gl, 0.2, 0.8, 0.2, 1.0);
                break;
            }
            case 51: { // #3 => blue
                backgroundUpdater(gl, 0.2, 0.2, 0.8, 1.0);
                break;
            }
            case 52: { // #4 => random color
                backgroundUpdater(gl, Math.random(), Math.random(), Math.random(), 1.0);
                break;
            }
        }

    }
}
