import { mat4, vec4 }  from 'gl-matrix';
import drawScene from "./draw-scene";

const context = {
    buffers: [],
    inVR: false,
    vrDisplay:  null,
    viewPosition:  [0, 0, 5],
    viewTarget: [0, 0, 0],
    worldCameraPosition: [0, 0, 5]
};

let theta = 0, phi = 0, psi = 0;

export default function createContext (
    initContext: any = {
        canvas: window.document.createElement('canvas'),
        viewPosition: context.viewPosition,
        viewTarget: context.viewTarget,
        worldCameraPosition: context.worldCameraPosition
    },
    initBuffers: Array<(gl: WebGL2RenderingContext) => any>,
    initShaders: (gl: WebGL2RenderingContext) => any
): { gl: WebGL2RenderingContext, updateContext: Function } {
    const canvas: HTMLCanvasElement = (initContext.canvas) as any as HTMLCanvasElement;
    const gl: WebGL2RenderingContext = (
        (canvas.getContext('webgl2') || canvas.getContext('experimental-webgl')
        ) as any as WebGLRenderingContextStrict) as any as WebGL2RenderingContext;

    // If we don't have a GL context, give up now

    if (!gl) {
        (<any>window).alert('Unable to initialize WebGL. Your browser or machine may not support it.');
        return;
    }

    // Initialize a shader program; this is where all the lighting
    // for the vertices and so forth is established.
    const shaderProgram = initShaders(gl);

    // Here's where we call the routine that builds all the
    // objects we'll be drawing.
    initBuffers.forEach(b => context.buffers.push(b(gl)));
    context.viewPosition = initContext.viewPosition || context.viewPosition;
    context.viewTarget = initContext.viewTarget || context.viewTarget;
    context.worldCameraPosition = initContext.worldCameraPosition || context.worldCameraPosition;

    let then = 0;

    gl.clearColor(1.0, 1.0, 1.0, 1.0);  // Clear to white, fully opaque

    const nonVRCallback = (now) => {
        if (context.inVR) {
            return;

        } else {
            // Draw the scene repeatedly, if using normal webgl
            now *= 0.001;  // convert to seconds
            const deltaTime = now - then;
            then = now;

            render(canvas, gl, shaderProgram, context.buffers, deltaTime);

            (<any>window).requestAnimationFrame(nonVRCallback);
        }
    };

    const vrCallback = (now) => {
        if (context.vrDisplay == null || !context.inVR) {
            return;
        }

        // reregister callback if we're still in VR
        context.vrDisplay.requestAnimationFrame(vrCallback);

        // calculate time delta for rotation
        now *= 0.001;  // convert to seconds
        const deltaTime = now - then;
        then = now;

        // render scene
        renderVR(canvas, gl, shaderProgram, context.buffers, deltaTime);
    };
    // register callback

    // Ensure VR is all set up
    vrSetup(canvas, gl, shaderProgram, context.buffers, nonVRCallback, vrCallback);

    // Start rendering
    (<any>window).requestAnimationFrame(nonVRCallback);

    (<any>window).vrButton = document.createElement('button');
    (<any>window).vrButton.innerHTML = 'Enter VR';
    (<any>window).vrButton.onclick = function enterVR() {
        console.log('Enter VR');

        if (context.vrDisplay != null) {
            context.inVR = true;
            // hand the canvas to the WebVR API
            context.vrDisplay.requestPresent([{ source: canvas }]);

            // requestPresent() will request permission to enter VR mode,
            // and once the user has done this our `vrdisplaypresentchange`
            // callback will be triggered
        }
    };
    (<any>window).vrButton.style = 'position: absolute; bottom: 20px; right:50px;';

    (<any>window).document.body.append((<any>window).vrButton);

    return { gl, updateContext };
}

function updateContext (gl: WebGL2RenderingContext, contextProperties: any) {
    for (const prop in contextProperties) {
        if (prop === 'buffers' && contextProperties['buffers'].length > 0) {
            context.buffers = [];
            for (const buffer of contextProperties['buffers']) {
                context.buffers.push(buffer(gl));
            }
        }

        if (prop === 'viewTarget' && !!Array.isArray(contextProperties['viewTarget'])) {
            const wct: [number] = contextProperties['viewTarget'] as [number];

            wct.forEach((v, i, a) => context.viewTarget[i] = v);
        }

        if (prop === 'viewPosition' && !!Array.isArray(contextProperties['viewPosition'])) {
            const vp: [number] = contextProperties['viewPosition'] as [number];

            if ('cameraDelta' in contextProperties && !!Array.isArray(contextProperties['cameraDelta'])) {
                const wcd: [number] = contextProperties['cameraDelta'] as [number];

                wcd.forEach((v, i, a) => {
                    if (!!vp[i]) {
                        if ((Math.abs(context.viewPosition[i] - context.viewTarget[i])) > (Math.abs(vp[i] - context.viewTarget[i]))) { // Don't go closer than specified viewPosition to viewTarget
                            context.viewPosition[i] = (context.viewPosition[i] + v);
                        } else {
                            context.viewPosition[i] = vp[i];
                        }
                    } else {
                        context.viewPosition[i] = (context.viewPosition[i] + v);
                    }
                });

                // console.log("Move view", viewPosition);
                saveOrbitState();

            } else {
                vp.forEach((v, i, a) => context.viewPosition[i] = v);
                saveOrbitState();
            }

        } else if (prop === 'viewPosition' ) {
            context.viewPosition = contextProperties['viewPosition'];
            // console.log("Hold position");
            saveOrbitState();
        }

        if (prop === 'worldCameraPosition' && !!Array.isArray(contextProperties['worldCameraPosition'])) {
            const wcp: [number] = contextProperties['worldCameraPosition'] as [number];

            if ('cameraDelta' in contextProperties && !!Array.isArray(contextProperties['cameraDelta'])) {
                const wcd: [number] = contextProperties['cameraDelta'] as [number];
                wcd.forEach((v, i, a) => {
                    if (!!wcp[i]) {
                        if (context.worldCameraPosition[i] < wcp[i]) { // Don't go closer than specified worldCameraPosition
                            context.worldCameraPosition[i] = (context.worldCameraPosition[i] + v);
                        } else {
                            context.worldCameraPosition[i] = wcp[i];
                        }
                    } else {
                        context.worldCameraPosition[i] = (context.worldCameraPosition[i] + v);
                    }
                });

                // console.log("Move camera", worldCameraPosition);
                saveOrbitState()

            } else {
                wcp.forEach((v, i, a) => context.worldCameraPosition[i] = v);
            }
        }



        if (prop === 'viewOrbitDelta' && !!Array.isArray(contextProperties['viewOrbitDelta'])) {
            const vod: [number, number] = contextProperties['viewOrbitDelta'] as [number, number];

            const round = function (number, decimals) {
                return parseFloat(
                    Number((Math.round(parseFloat(number + "e" + decimals))  + "e-" + decimals)).toFixed(decimals)
                );
            };

            if (vod[0] !== 0 && vod[1] !== 0) {
                const delta_xz = (vod[0] > 0) ? (3 * Math.PI/180) : (vod[0] < 0) ? -(3 * Math.PI/180) : 0;
                const delta_y = (vod[1] > 0) ? (3 * Math.PI/180) : (vod[1] < 0) ? -(3 * Math.PI/180) : 0;

                // Multiply all by 1000000 to perform the trig with rounded figures
                const dx = (context.viewPosition[0] - context.viewTarget[0]) * 1000000,
                    dy = (context.viewPosition[1] - context.viewTarget[1]) * 1000000,
                    dz = (context.viewPosition[2] - context.viewTarget[2]) * 1000000;
                const radius = Math.sqrt((
                    Math.pow(dx, 2) +
                    Math.pow(dy, 2) +
                    Math.pow(dz, 2)
                ));

                theta = (theta + delta_xz) < (-Math.PI * 2) ?
                    (Math.PI * 2) + (theta + delta_xz) :
                    (Math.PI * 2) < (theta + delta_xz) ?
                        (theta + delta_xz) - (Math.PI * 2) :
                        theta + delta_xz; // Math.acos((1.0 > (dx / radius) || (dx / radius) < -1.0) ? (dx / radius) : Math.round(dx / radius));
                phi = (phi + delta_y) < (-Math.PI * 2) ?
                    (Math.PI * 2) + (phi + delta_y) :
                    (Math.PI * 2) < (phi + delta_y) ?
                        (phi + delta_y) - (Math.PI * 2) :
                        phi + delta_y; // Math.asin((1.0 > (dz / radius) || (dz / radius) < -1.0) ? (dz / radius) : Math.round(dz / radius));

                // console.log(
                //     'radius: ', radius / 1000000,
                //     ' theta: ', theta,
                //     ' phi: ', phi
                // );

                if (radius === radius && theta === theta && phi === phi) {
                    context.viewPosition[0] = context.viewTarget[0] + (Math.cos(theta) * (radius / 1000000)); // + (delta_xz * Math.PI / 180)
                    // context.viewPosition[1] = context.viewTarget[1] + (Math.tan(phi) * (radius / 1000000)); // + (delta_xz * Math.PI / 180)
                    context.viewPosition[2] = context.viewTarget[2] + (Math.sin(theta) * (radius / 1000000)); // + (delta_xz * Math.PI / 180)
                }
            }
        }
    }
}

function saveOrbitState () {
    // Multiply all by 1000000 to perform the trig with rounded figures
    const dx = (context.viewPosition[0] - context.viewTarget[0]) * 1000000,
        dy = (context.viewPosition[1] - context.viewTarget[1]) * 1000000,
        dz = (context.viewPosition[2] - context.viewTarget[2]) * 1000000,
        radius = Math.sqrt((
            Math.pow(dx, 2) +
            Math.pow(dy, 2) +
            Math.pow(dz, 2)
        ));

    theta = Math.acos((1.0 > (dx / radius) || (dx / radius) < -1.0) ? (dx / radius) : Math.round(dx / radius));
    // phi = Math.asin((1.0 > (dz / radius) || (dz / radius) < -1.0) ? (dz / radius) : Math.round(dz / radius));

    // console.log(
    //     'radius: ', radius / 1000000,
    //     ' theta: ', theta,
    //     ' phi: ', phi
    // );

    // console.log('target: ', [
    //     context.viewTarget[0],
    //     context.viewTarget[1],
    //     context.viewTarget[2]
    // ]);

    // console.log('old position: ', [
    //     context.viewPosition[0],
    //     context.viewPosition[1],
    //     context.viewPosition[2]
    // ]);

    // console.log('new position: ', [
    //     context.viewTarget[0] + (Math.cos(theta) * (radius / 1000000)),
    //     context.viewPosition[1],
    //     context.viewTarget[2] + (Math.sin(phi) * (radius / 1000000))
    // ]);
}

// entry point for non-WebVR rendering
// called by whatever mechanism (likely keyboard/mouse events)
// you used before to trigger redraws
function render (canvas: HTMLCanvasElement, gl: WebGL2RenderingContext, shaderProgram, buffers, deltaTime) {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);                               // Enable depth testing
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);    // Clear everything
    gl.depthFunc(gl.LEQUAL);                                // Near things obscure far things

    // Clear the canvas before we start drawing on it.

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Create a perspective matrix, a special matrix that is
    // used to simulate the distortion of perspective in a camera.
    // Our field of view is 45 degrees, with a width/height
    // ratio that matches the display size of the canvas
    // and we only want to see objects between 0.1 units
    // and 100 units away from the camera.
    const fieldOfView = 45 * Math.PI / 180;   // in radians
    const aspect = canvas.width / canvas.height;
    const zNear = 1; // 0.1;
    const zFar = 2000; // 100.0;

    // note: glmatrix.js always has the first argument
    // as the destination to receive the result.
    const projectionMatrix = mat4.perspective(mat4.create(),
        fieldOfView,
        aspect,
        zNear,
        zFar);

    drawScene(context, gl, shaderProgram, buffers, projectionMatrix, null, deltaTime);
}

// entry point for WebVR, called by vrCallback()
function renderVR(canvas: HTMLCanvasElement, gl: WebGL2RenderingContext, shaderProgram, buffers, deltaTime) {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);                               // Enable depth testing
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);    // Clear everything
    gl.depthFunc(gl.LEQUAL);                                // Near things obscure far things

    renderEye(canvas, gl, shaderProgram, buffers, true, deltaTime);
    renderEye(canvas, gl, shaderProgram, buffers, false, deltaTime);
    context.vrDisplay.submitFrame();
}

function renderEye(canvas: HTMLCanvasElement, gl: WebGL2RenderingContext, shaderProgram, buffers, isLeft, deltaTime) {
    let width = canvas.width;
    let wD2 = canvas.width / 2;
    let height = canvas.height;
    let projection, view;
    let frameData = new VRFrameData();
    context.vrDisplay.getFrameData(frameData);
    // choose which half of the canvas to draw on
    if (isLeft) {
        gl.viewport(0, 0, wD2, height);
        projection = frameData.leftProjectionMatrix;
        view = frameData.leftViewMatrix;
    } else {
        gl.viewport(wD2, 0, wD2, height);
        projection = frameData.rightProjectionMatrix;
        view = frameData.rightViewMatrix;
    }
    // we don't want auto-rotation in VR mode, so we directly
    // use the view matrix
    drawScene(context, gl, shaderProgram, buffers, projection, view, deltaTime);
}

// Set up the VR display and callbacks
function vrSetup(canvas, gl, programInfo, buffers, noVRRender, vrCallback) {
    if (typeof navigator.getVRDisplays !== 'function') {
        console.error("Your browser does not support WebVR");
        return;
    }

    navigator.getVRDisplays().then(displays => {
        if (displays !== null && displays.length > 0) {
            // Assign last returned display to vrDisplay
            context.vrDisplay = displays[displays.length - 1] as VRDisplay;

            // optional, but recommended
            context.vrDisplay.depthNear = 0.1;
            context.vrDisplay.depthFar = 100.0;
        }
    });

    (<any>window).addEventListener('vrdisplaypresentchange', () => {

        // Are we entering or exiting VR?
        if (context.vrDisplay != null && context.vrDisplay.isPresenting) {
            // We should make our canvas the size expected
            // by WebVR
            const eye = context.vrDisplay.getEyeParameters("left");
            // multiply by two since we're rendering both eyes side
            // by side
            canvas.width = eye.renderWidth * 2;
            canvas.height = eye.renderHeight;

            context.vrDisplay.requestAnimationFrame(vrCallback);

        } else if (context.vrDisplay !== null) {
            console.log('Exit VR');

            context.inVR = false;
            canvas.width = 640;
            canvas.height = 480;

            (<any>window).requestAnimationFrame(noVRRender);
        }
    });
}
