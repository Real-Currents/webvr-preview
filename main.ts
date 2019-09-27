import createContext from './modules/basic/webvr';

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

    createContext(canvas);
}
