import { gl, inverse$1, mat4, vec4 }  from 'gl-matrix';
import { lookAt } from 'gl-matrix/mat4';

let cubeRotation: number = 0.0;
let inVR = false;
let vrDisplay;
let positionLocation: number;
let normalLocation: number;
let projectionLocation: WebGLUniformLocation;
let viewLocation: WebGLUniformLocation;
let worldLocation: WebGLUniformLocation;
let textureLocation: WebGLUniformLocation;
let worldCameraPositionLocation: WebGLUniformLocation;

export default function createContext (canvas: HTMLCanvasElement, initBuffers: Function, initShaders: Function): WebGL2RenderingContext {
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

// look up where the vertex data needs to go.
    positionLocation = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    normalLocation = gl.getAttribLocation(shaderProgram, "aVertexNormal");

// lookup uniforms
    projectionLocation = gl.getUniformLocation(shaderProgram, "uProjectionMatrix");
    viewLocation = gl.getUniformLocation(shaderProgram, "uModelViewMatrix");
    worldLocation = gl.getUniformLocation(shaderProgram, "uWorldMatrix");
    textureLocation = gl.getUniformLocation(shaderProgram, "uTexture");
    worldCameraPositionLocation = gl.getUniformLocation(shaderProgram, "uWorldCameraPosition");

    // Collect all the info needed to use the shader program.
    // Look up which attributes our shader program is using
    // for aVertexPosition, aVevrtexColor and also
    // look up uniform locations.
    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
            normalMatrix: gl.getUniformLocation(shaderProgram, "uNormalMatrix"),
            worldMatrix: gl.getUniformLocation(shaderProgram, "uWorldMatrix"),
            textureLocation: gl.getUniformLocation(shaderProgram, "uTexture"),
            worldCameraPositionLocation: gl.getUniformLocation(shaderProgram, "uWorldCameraPosition")
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
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;

    // note: glmatrix.js always has the first argument
    // as the destination to receive the result.
    const projectionMatrix = mat4.perspective(mat4.create(),
        fieldOfView,
        aspect,
        zNear,
        zFar);

    drawScene(gl, programInfo, buffers, projectionMatrix, null, deltaTime);
}

// entry point for WebVR, called by vrCallback()
function renderVR(canvas, gl, programInfo, buffers, deltaTime) {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);                               // Enable depth testing
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);    // Clear everything
    gl.depthFunc(gl.LEQUAL);                                // Near things obscure far things

    renderEye(canvas, gl, programInfo, buffers, true, deltaTime);
    renderEye(canvas, gl, programInfo, buffers, false, deltaTime);
    vrDisplay.submitFrame();
}

function renderEye(canvas, gl, programInfo, buffers, isLeft, deltaTime) {
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
    drawScene(gl, programInfo, buffers, projection, view, deltaTime);
}

//
// Draw the scene.
//
function drawScene(gl, programInfo, buffers, projectionMatrix, view = null, deltaTime) {

    // Set the drawing position to the "identity" point, which is
    // the center of the scene.
    const modelViewMatrix = mat4.create();

    cubeRotation += deltaTime;

    // Animate the rotation
    const modelXRotationRadians = cubeRotation * 0.4;
    const modelYRotationRadians = cubeRotation * 0.7;

    // Tell WebGL to use our program when drawing
    gl.useProgram(programInfo.program);

    // const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    // const fieldOfViewRadians = 0.5236;
    // const projectionMatrix =
    //     mat4.perspective(mat4.create(), fieldOfViewRadians, aspect, 1, 2000);
    gl.uniformMatrix4fv(projectionLocation, false, projectionMatrix);


    const worldCameraPosition = [0, 0, -.25];
    const cameraPosition = [0, 0, worldCameraPosition[2] * 1.5];
    const target = [0, 0, 0];
    const up = [0, 1, 0];
    // Compute the camera's matrix using look at.
    const cameraMatrix = mat4.lookAt(mat4.create(), cameraPosition, target, up);

    // Make a view matrix from the camera matrix.
    const viewMatrix = mat4.invert(mat4.create(), cameraMatrix);

    const worldMatrix = mat4.rotateX(mat4.create(), mat4.create(), modelXRotationRadians);
    mat4.rotateY(worldMatrix, worldMatrix, modelYRotationRadians);
    mat4.rotateZ(worldMatrix, worldMatrix, Math.PI / 2);

    if (view !== null) {
        // Premultiply the view matrix
        mat4.multiply(viewMatrix, view, viewMatrix);
    }

    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute
    {
        const numComponents = 3;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexPosition);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers['position']);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset);
    }

    // Tell WebGL how to pull normals out of normalBuffer (ARRAY_BUFFER)
    {
        const numComponents = 3; // 3 components per iteration
        const type = gl.FLOAT;   // the data is 32bit floating point values
        const normalize = false; // normalize the data (convert from 0-255 to 0-1)
        const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        const offset = 0;        // start at the beginning of the buffer
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexNormal);
        // Bind the normal buffer.
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers['normal']);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexNormal,
            numComponents,
            type,
            normalize,
            stride,
            offset);
    }

    // Set the uniforms
    gl.uniformMatrix4fv(projectionLocation, false, projectionMatrix);
    gl.uniformMatrix4fv(viewLocation, false, viewMatrix);
    gl.uniformMatrix4fv(worldLocation, false, worldMatrix);
    gl.uniform3fv(worldCameraPositionLocation, worldCameraPosition);

    // Tell the shader to use texture unit 0 for u_texture
    gl.uniform1i(textureLocation, 0);

    gl.drawArrays(gl.TRIANGLES, 0, buffers['positionSize'] / 3);

    // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers['index']);
    // gl.drawElements(gl.TRIANGLES, buffers['indexSize'], gl.UNSIGNED_SHORT, 0);
    // gl.bindBuffer(gl.ARRAY_BUFFER, null);
    // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

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
