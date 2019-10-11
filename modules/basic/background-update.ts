
export default function backgroundUpdater (gl: WebGLRenderingContext) {

    (<any>window).onkeydown = function checkKey (event) {
        switch (event['keyCode']) {
            case 49: { // #1 => black
                update(gl, 0.0, 0.0, 0.0, 1.0);
                break;
            }
            case 50: { // #2 => green
                update(gl, 0.2, 0.8, 0.2, 1.0);
                break;
            }
            case 51: { // #3 => blue
                update(gl, 0.2, 0.2, 0.8, 1.0);
                break;
            }
            case 52: { // #4 => random color
                update(gl, Math.random(), Math.random(), Math.random(), 1.0);
                break;
            }
        }

    }
}

function update ( gl: WebGLRenderingContext, r, g, b, a) {
    gl.clearColor(r, g, b, a);
    gl.clear(gl.COLOR_BUFFER_BIT);
}
