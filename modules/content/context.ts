import { gl, mat4 }  from 'gl-matrix';

let cubeRotation: number = 0.0;
let inVR = false;
let vrDisplay;

export default function createContext (canvas: HTMLCanvasElement, initBuffers: Function, initShaders: Function): WebGLRenderingContext {
    const gl: WebGLRenderingContext = (
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
        ) as any as WebGLRenderingContextStrict) as any as WebGLRenderingContext;

    // If we don't have a GL context, give up now

    if (!gl) {
        (<any>window).alert('Unable to initialize WebGL. Your browser or machine may not support it.');
        return;
    }

    // Initialize a shader program; this is where all the lighting
    // for the vertices and so forth is established.
    const shaderProgram = initShaders(gl);

    // Collect all the info needed to use the shader program.
    // Look up which attributes our shader program is using
    // for aVertexPosition, aVevrtexColor and also
    // look up uniform locations.
    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
        },
    };

    // Here's where we call the routine that builds all the
    // objects we'll be drawing.
    const buffers = initBuffers(gl);

    let then = 0;

    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque

    const nonVRCallback = (now) => {
        if (inVR) {
            return;

        } else {
            // Draw the scene repeatedly, if using normal webgl
            now *= 0.001;  // convert to seconds
            const deltaTime = now - then;
            then = now;

            render(canvas, gl, programInfo, buffers, deltaTime);

            (<any>window).requestAnimationFrame(nonVRCallback);
        }
    };

    const vrCallback = (now) => {
        if (vrDisplay == null || !inVR) {
            return;
        }

        // reregister callback if we're still in VR
        vrDisplay.requestAnimationFrame(vrCallback);

        // calculate time delta for rotation
        now *= 0.001;  // convert to seconds
        const deltaTime = now - then;
        then = now;

        // render scene
        renderVR(canvas, gl, programInfo, buffers, deltaTime);
    };
    // register callback

    // Ensure VR is all set up
    vrSetup(canvas, gl, programInfo, buffers, nonVRCallback, vrCallback);

    // Start rendering
    (<any>window).requestAnimationFrame(nonVRCallback);

    (<any>window).vrButton = document.createElement('button');
    (<any>window).vrButton.innerHTML = 'Enter VR';
    (<any>window).vrButton.onclick = function enterVR() {
        console.log('Enter VR');

        if (vrDisplay != null) {
            inVR = true;
            // hand the canvas to the WebVR API
            vrDisplay.requestPresent([{ source: canvas }]);

            // requestPresent() will request permission to enter VR mode,
            // and once the user has done this our `vrdisplaypresentchange`
            // callback will be triggered
        }
    };
    (<any>window).vrButton.style = 'position: absolute; bottom: 20px; right:50px;';

    (<any>window).document.body.append((<any>window).vrButton);

    return gl;
}

// entry point for non-WebVR rendering
// called by whatever mechanism (likely keyboard/mouse events)
// you used before to trigger redraws
function render (canvas, gl, programInfo, buffers, deltaTime) {
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

    // Clear the canvas before we start drawing on it.

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Create a perspective matrix, a special matrix that is
    // used to simulate the distortion of perspective in a camera.
    // Our field of view is 45 degrees, with a width/height
    // ratio that matches the display size of the canvas
    // and we only want to see objects between 0.1 units
    // and 100 units away from the camera.
    const fieldOfView = 45 * Math.PI / 180;   // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();

    // note: glmatrix.js always has the first argument
    // as the destination to receive the result.
    mat4.perspective(projectionMatrix,
        fieldOfView,
        aspect,
        zNear,
        zFar);

    cubeRotation += deltaTime;

    drawScene(gl, programInfo, buffers, projectionMatrix);
}

// entry point for WebVR, called by vrCallback()
function renderVR(canvas, gl, programInfo, buffers, deltaTime) {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

    // Clear the canvas before we start drawing on it.

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    cubeRotation += deltaTime;
    renderEye(canvas, gl, programInfo, buffers, true);
    renderEye(canvas, gl, programInfo, buffers, false);
    vrDisplay.submitFrame();
}

function renderEye(canvas, gl, programInfo, buffers, isLeft) {
    let width = canvas.width;
    let height = canvas.height;
    let projection, view;
    let frameData = new VRFrameData();
    vrDisplay.getFrameData(frameData);
    // choose which half of the canvas to draw on
    if (isLeft) {
        gl.viewport(0, 0, width / 2, height);
        projection = frameData.leftProjectionMatrix;
        view = frameData.leftViewMatrix;
    } else {
        gl.viewport(width / 2, 0, width / 2, height);
        projection = frameData.rightProjectionMatrix;
        view = frameData.rightViewMatrix;
    }
    // we don't want auto-rotation in VR mode, so we directly
    // use the view matrix
    drawScene(gl, programInfo, buffers, projection, view);
}

//
// Draw the scene.
//
function drawScene(gl, programInfo, buffers, projection, view = null) {

    // Set the drawing position to the "identity" point, which is
    // the center of the scene.
    const modelViewMatrix = mat4.create();

    // Now move the drawing position a bit to where we want to
    // start drawing the square.

    mat4.translate(modelViewMatrix,     // destination matrix
        modelViewMatrix,     // matrix to translate
        [-0.0, 0.0, -6.0]);  // amount to translate

    mat4.rotate(modelViewMatrix,  // destination matrix
        modelViewMatrix,  // matrix to rotate
        cubeRotation,     // amount to rotate in radians
        [0, 0, 1]);       // axis to rotate around (Z)
    mat4.rotate(modelViewMatrix,  // destination matrix
        modelViewMatrix,  // matrix to rotate
        cubeRotation * .7     ,// amount to rotate in radians
        [0, 1, 0]);       // axis to rotate around (X)

    if (view !== null) {
        // Premultiply the view matrix
        mat4.multiply(modelViewMatrix, view, modelViewMatrix);
    }

    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute
    {
        const numComponents = 3;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers['position']);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexPosition);
    }

    // Tell WebGL how to pull out the colors from the color buffer
    // into the vertexColor attribute.
    {
        const numComponents = 4;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers['color']);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexColor,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexColor);
    }

    // Tell WebGL to use our program when drawing

    gl.useProgram(programInfo.program);

    // Set the shader uniforms

    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projection);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix);

    // {
    //     const vertexCount = 3;
    //     const type = gl.UNSIGNED_SHORT;
    //     const offset = 0;
    //     gl.drawArrays(gl.TRIANGLES, offset, vertexCount);
    // }

    {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers['index']);
        gl.drawElements(gl.TRIANGLES, buffers['indexSize'], gl.UNSIGNED_SHORT, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }

}

// Set up the VR display and callbacks
function vrSetup(canvas, gl, programInfo, buffers, noVRRender, vrCallback) {
    if (typeof navigator.getVRDisplays !== 'function') {
        (<any>window).alert("Your browser does not support WebVR");
        return;
    }

    navigator.getVRDisplays().then(displays => {
        if (displays !== null && displays.length > 0) {
            // Assign last returned display to vrDisplay
            vrDisplay = displays[displays.length - 1];

            // optional, but recommended
            vrDisplay.depthNear = 0.1;
            vrDisplay.depthFar = 100.0;
        }
    });

    (<any>window).addEventListener('vrdisplaypresentchange', () => {

        // Are we entering or exiting VR?
        if (vrDisplay != null && vrDisplay.isPresenting) {
            // We should make our canvas the size expected
            // by WebVR
            const eye = vrDisplay.getEyeParameters("left");
            // multiply by two since we're rendering both eyes side
            // by side
            canvas.width = eye.renderWidth * 2;
            canvas.height = eye.renderHeight;

            vrDisplay.requestAnimationFrame(vrCallback);

        } else if (vrDisplay !== null) {
            console.log('Exit VR');

            inVR = false;
            canvas.width = 640;
            canvas.height = 480;

            (<any>window).requestAnimationFrame(noVRRender);
        }
    });
}
