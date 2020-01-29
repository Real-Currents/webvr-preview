// import createContext from './modules/basic/webvr-context';
import backgroundUpdater from "./modules/basic/background-update";
import createContext from './modules/content/context';
import initShaderProgram from "./modules/content/basic-shaders";
// import initShaderProgram from "./modules/content/cubemap-shaders";
// import initShaderProgram from "./modules/content/normal-shaders";
import initBuffers from "./modules/content/cube-buffers";
// import initBuffers from "./modules/content/inner-cube-buffers";
// import initBuffers from "./modules/content/firewood-buffers";
import innerBuffers from "./modules/content/inner-cube-buffers";
import outerBuffers from "./modules/content/outer-cube-buffers";
import generateFace from "./modules/content/face-generator";
// import generateFace from "./modules/content/grid-generator";

const canvas: HTMLCanvasElement = (window.document.querySelector('canvas#cv') !== null) ?
    window.document.querySelector('canvas#cv') :
    window.document.createElement('canvas');

//
// Start here
//
function main () {
    console.log("Loading...");

    (async () => {

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

        // Get A 2D context for dynamic textures
        /** @type {Canvas2DRenderingContext} */
        const ctx = document.createElement("canvas").getContext("2d");
        ctx.canvas.width = 128;
        ctx.canvas.height = 128;

        let frame = 0;
        let timeout = null;
        let lastKeyPress = (new Date()).getTime();

        const { gl, updateContext } = await createContext({ canvas }, initBuffers, initShaderProgram);

        backgroundUpdater(gl);

        // Create a texture.
        const texture = gl.createTexture();
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
            // Asynchronously load an image
            const img = new Image();
            img.crossOrigin = '';

            img.id = '' + (i + 1);

            // Use 2d face generator to generate 6 images
            generateFace(ctx, faceColor, textColor, text);
            // generateFace(ctx, faceColor, 16);

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

            // Setup each face so it's immediately renderable
            gl.texImage2D(target, level, internalFormat, width, height, 0, format, type, null);
        });
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

        const cameras = [
            {
                'viewPosition': [ 0, 0, -5 ],
                'viewTarget': [ 0, 0, 0 ]
            },
            {
                'viewPosition': [ 0.5, 0, 2.5 ],
                'viewTarget': [ 0, 0, 0 ]
            }
        ]
        let camera = 0;
        const changeCamera = function (event) {
            updateContext(gl, cameras[camera]);
        }

        const triggerMovement = function (event) {
            // console.log(lastKeyPress, ((new Date()).getTime() - lastKeyPress));
            // console.log(startVideo);

            if (((new Date()).getTime() - lastKeyPress) > 500) {
                if (!window['userTriggered']) {
                    timeout = setInterval(() => {
                        window['userTriggered'] = true;

                        if (++frame > 90) {
                            updateContext(gl, {
                                'buffers': [
                                    outerBuffers,
                                    innerBuffers
                                ],
                                'cameraDelta': [0, 0, +0.05],
                                'viewPosition': cameras[camera]['viewPosition'],
                                'worldCameraPosition': [0, 0, -2.5]
                            });
                        } else {
                            updateContext(gl, {
                                'cameraDelta': [0, 0, +0.0375],
                                'viewPosition': [0, 0, -1],
                                'worldCameraPosition': [0, 0, -1]
                            });
                        }
                    }, 33);
                } else {
                    window['userTriggered'] = false;
                    clearInterval(timeout);
                }

            }
        };

        window.addEventListener('keydown', function (event: (any | KeyboardEvent)) {
            const kbEvent = (event || window['event']); // cross-browser shenanigans
            // console.log(lastKeyPress, ((new Date()).getTime() - lastKeyPress));
            // console.log(startVideo);

            if (kbEvent['keyCode'] === 32) { // this is the spacebar
                triggerMovement(event)

                kbEvent.preventDefault();

                return true; // treat all other keys normally;

            } else return false;
        });

        const touchHit = function touchHit(event) {
            console.log(event.touches);
            // mouse_x = (event.touches[0].clientX - cv_pos.left + doc.scrollLeft()) * cv_w;
            // mouse_y = (event.touches[0].clientY - cv_pos.top + doc.scrollTop()) * cv_h;
        };

        const mouseHit = function mouseHit(event) {
            console.log('mouse coords captured', event.clientX, ',', event.clientY);
            // mouse_x = (event.clientX - cv_pos.left + doc.scrollLeft()) * cv_w;
            // mouse_y = (event.clientY - cv_pos.top + doc.scrollTop()) * cv_h;
        };

        if ('ontouchmove' in document.createElement('div'))  {
            canvas.addEventListener('touchstart', function(e){
                console.log('MouseDown');
                // mouse_down = true;
                // mouse_up = false;
                touchHit(e);
                e.preventDefault();
            });
            canvas.addEventListener('touchmove', function(e){
                touchHit(e);
                e.preventDefault();
            });
            canvas.addEventListener('touchend', function(e){
                console.log('MouseUp');
                // mouse_down = false;
                // mouse_up = true;
                triggerMovement(e);
                e.preventDefault();
            });
            console.log('touch is present');

        } else {
            canvas.addEventListener('mousedown', function(e) {
                console.log('MouseDown');
                // mouse_down = true;
                // mouse_up = false;
                mouseHit(e);
                e.preventDefault();
            });
            canvas.addEventListener('mousemove', mouseHit);
            canvas.addEventListener('mouseup', function (e) {
                console.log('MouseUp');
                // mouse_down = false;
                // mouse_up = true;
                triggerMovement(e);
                e.preventDefault();
            });
        }
    })();

    window['userTriggered'] = false;
}

main();

    // // DRAW
    // // Set the drawing position to the "identity" point, which is
    // // the center of the scene.
    // const modelViewMatrix = mat4.create();
    //
    // cubeRotation += deltaTime;
    //
    // // Animate the rotation
    // const modelXRotationRadians = cubeRotation * 0.4;
    // const modelYRotationRadians = cubeRotation * 0.7;
    //
    // // Now move the drawing position a bit to where we want to
    // // start drawing the square.
    //
    // mat4.translate(modelViewMatrix,     // destination matrix
    //     modelViewMatrix,     // matrix to translate
    //     [0.0, 0.0, -25]);  // amount to translate
    //
    // mat4.rotate(modelViewMatrix,  // destination matrix
    //     modelViewMatrix,  // matrix to rotate
    //     modelXRotationRadians, // amount to rotate in radians
    //     [1, 0, 0]);       // axis to rotate around (X)
    // mat4.rotate(modelViewMatrix,  // destination matrix
    //     modelViewMatrix,  // matrix to rotate
    //     modelYRotationRadians, // amount to rotate in radians
    //     [0, 1, 0]);       // axis to rotate around (Y)
    //
    // if (view !== null) {
    //     // Premultiply the view matrix
    //     mat4.multiply(modelViewMatrix, view, modelViewMatrix);
    // }
    //
    // const lightDiffuseColor = [ 1, 1, 1 ];
    // const lightDirection = [ -1.0, -0.5, 0.0 ] ;
    // const materialColor = [ 0.5, 0.75, 0.25 ];
    // const normalMatrix = mat4.create();
    //
    // mat4.copy(normalMatrix, modelViewMatrix);
    // // Exclude light direction from modelview rotations
    // mat4.rotate(normalMatrix,  // destination matrix
    //     normalMatrix,  // matrix to rotate
    //     -modelYRotationRadians, // amount to rotate in radians
    //     [0, 1, 0]);       // axis to rotate around (Y)
    // mat4.rotate(normalMatrix,  // destination matrix
    //     normalMatrix,  // matrix to rotate
    //     -modelXRotationRadians, // amount to rotate in radians
    //     [1, 0, 0]);       // axis to rotate around (X)
    // mat4.invert(normalMatrix, normalMatrix);
    // mat4.transpose(normalMatrix, normalMatrix);
    //
    // // Tell WebGL how to pull out the positions from the position
    // // buffer into the vertexPosition attribute
    // {
    //     const numComponents = 3;
    //     const type = gl.FLOAT;
    //     const normalize = false;
    //     const stride = 0;
    //     const offset = 0;
    //     gl.enableVertexAttribArray(
    //         programInfo.attribLocations.vertexPosition);
    //     gl.bindBuffer(gl.ARRAY_BUFFER, buffers['position']);
    //     gl.vertexAttribPointer(
    //         programInfo.attribLocations.vertexPosition,
    //         numComponents,
    //         type,
    //         normalize,
    //         stride,
    //         offset);
    // }
    //
    // // Tell WebGL how to pull out the colors from the color buffer
    // // into the vertexColor attribute.
    // {
    //     const numComponents = 4;
    //     const type = gl.FLOAT;
    //     const normalize = false;
    //     const stride = 0;
    //     const offset = 0;
    //     gl.enableVertexAttribArray(
    //         programInfo.attribLocations.vertexColor);
    //     gl.bindBuffer(gl.ARRAY_BUFFER, buffers['color']);
    //     gl.vertexAttribPointer(
    //         programInfo.attribLocations.vertexColor,
    //         numComponents,
    //         type,
    //         normalize,
    //         stride,
    //         offset);
    // }
    //
    // // Tell WebGL how to pull normals out of normalBuffer (ARRAY_BUFFER)
    // {
    //     const numComponents = 3; // 3 components per iteration
    //     const type = gl.FLOAT;   // the data is 32bit floating point values
    //     const normalize = false; // normalize the data (convert from 0-255 to 0-1)
    //     const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    //     const offset = 0;        // start at the beginning of the buffer
    //     gl.enableVertexAttribArray(
    //         programInfo.attribLocations.vertexNormal);
    //     // Bind the normal buffer.
    //     gl.bindBuffer(gl.ARRAY_BUFFER, buffers['normal']);
    //     gl.vertexAttribPointer(
    //         programInfo.attribLocations.vertexNormal,
    //         numComponents,
    //         type,
    //         normalize,
    //         stride,
    //         offset);
    // }
    //
    // // Tell WebGL to use our program when drawing
    // gl.useProgram(programInfo.program);
    //
    // gl.uniformMatrix4fv(
    //     programInfo.uniformLocations.projectionMatrix,
    //     false,
    //     projection);
    //
    // gl.uniformMatrix4fv(
    //     programInfo.uniformLocations.modelViewMatrix,
    //     false,
    //     modelViewMatrix);
    //
    // gl.uniformMatrix4fv(programInfo.uniformLocations.normalMatrix, false, normalMatrix);
    //
    // gl.uniform3fv(programInfo.uniformLocations.lightDirection, lightDirection);
    // gl.uniform3fv(programInfo.uniformLocations.lightDiffuse, lightDiffuseColor);
    // gl.uniform3fv(programInfo.uniformLocations.materialDiffuse, materialColor);
    //
    // {
    //     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers['index']);
    //     gl.drawElements(gl.TRIANGLES, buffers['indexSize'], gl.UNSIGNED_SHORT, 0);
    //     gl.bindBuffer(gl.ARRAY_BUFFER, null);
    //     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    // }
