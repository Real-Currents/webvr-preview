import { mat4, vec4 }  from 'gl-matrix';
import { transformationBuffers} from "./transformation-buffers";
import {stringify} from "querystring";

//
// Draw the scene.
//
export default function drawScene (context: any, gl: WebGL2RenderingContext, shaderProgram, buffers, projectionMatrix, view = null, deltaTime) {

    const cameraPosition = [ 0, 0, -25 ] ; //(context.viewPosition !== null) ?
        // context.viewPosition :
        // [ 0, 0, context.worldCameraPosition[2] / 1.5 ];
    const target = context.viewTarget;
    const up = [ 0, 1, 0 ];
    // Compute the camera's matrix using look at.
    const cameraMatrix = mat4.lookAt(mat4.create(), cameraPosition, target, up);

    // Make a view matrix from the camera matrix.
    const viewMatrix = cameraMatrix; // mat4.invert(mat4.create(), cameraMatrix);

    const worldMatrix = mat4.create()

    if (view !== null) {
        // Premultiply the view matrix
        mat4.multiply(viewMatrix, view, viewMatrix);
    }

    if (buffers.length > 0) {
        let b = 0;
        for (const buffer of buffers) {
            const n = (stringify(buffer).split("") as [string])     // Need better hash function
                .filter((d, i, a) => (1 - i % 8) > 0)  // ...take every 8th char
                .map(c => c.charCodeAt(0)).join("").substr(-64)         // ...convert to int and join final 64

            // Collect all the info needed to use the shader program.
            // Look up which attributes our shader program is using
            // for aVertexPosition, aVevrtexColor and also
            // look up uniform locations.
            const program = (!!buffer['program']) ? buffer['program'] : shaderProgram
            const programInfo = {
                program: program,
                attribLocations: {
                    vertexNormal: gl.getAttribLocation(program, 'aVertexNormal'),
                    vertexPosition: gl.getAttribLocation(program, 'aVertexPosition'),
                    vertexColor: gl.getAttribLocation(program, 'aVertexColor'),
                },
                uniformLocations: {
                    projectionMatrix: gl.getUniformLocation(program, 'uProjectionMatrix'),
                    modelViewMatrix: gl.getUniformLocation(program, 'uModelViewMatrix'),
                    normalMatrix: gl.getUniformLocation(program, "uNormalMatrix"),
                    worldMatrix: gl.getUniformLocation(program, "uWorldMatrix"),
                    textureLocation: gl.getUniformLocation(program, "uTexture"),
                    worldCameraPositionLocation: gl.getUniformLocation(program, "uWorldCameraPosition")
                },
            };

            // Tell WebGL to use our program when drawing
            gl.useProgram(programInfo.program);

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
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer['position']);
                gl.vertexAttribPointer(
                    programInfo.attribLocations.vertexPosition,
                    numComponents,
                    type,
                    normalize,
                    stride,
                    offset);
            }

            // Tell WebGL how to pull out the colors from the color buffer
            // into the vertexColor attribute.
            {
                const numComponents = 4;
                const type = gl.FLOAT;
                const normalize = false;
                const stride = 0;
                const offset = 0;
                gl.enableVertexAttribArray(
                    programInfo.attribLocations.vertexColor);
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer['color']);
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
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer['normal']);
                gl.vertexAttribPointer(
                    programInfo.attribLocations.vertexNormal,
                    numComponents,
                    type,
                    normalize,
                    stride,
                    offset);
            }

            // Translation
            if (!!buffer['translation'] && buffer['translation'].length === 3) {
                if (!(n in transformationBuffers['translationBuffers'])) transformationBuffers['translationBuffers'][n] = {
                    modelXRotationRadians: 0.0,
                    modelYRotationRadians: 0.0,
                    modelZRotationRadians: 0.0
                }
                transformationBuffers['translationBuffers'][n]['modelXTranslation'] = buffer['translation'][0];
                transformationBuffers['translationBuffers'][n]['modelYTranslation'] = buffer['translation'][1];
                transformationBuffers['translationBuffers'][n]['modelZTranslation'] = buffer['translation'][2];

                mat4.translate(worldMatrix, worldMatrix, [
                    -transformationBuffers['translationBuffers'][n]['modelXTranslation'],
                    transformationBuffers['translationBuffers'][n]['modelYTranslation'],
                    transformationBuffers['translationBuffers'][n]['modelZTranslation']
                ])

            }

            // Rotation
            if (!!buffer['rotation'] && buffer['rotation'].length === 3) {
                if (!(n in transformationBuffers['rotationBuffers'])) transformationBuffers['rotationBuffers'][n] = {
                    modelXRotationRadians: 0.0,
                    modelYRotationRadians: 0.0,
                    modelZRotationRadians: 0.0
                }
                transformationBuffers['rotationBuffers'][n]['modelXRotationRadians'] = buffer['rotation'][0];
                transformationBuffers['rotationBuffers'][n]['modelYRotationRadians'] = buffer['rotation'][1];
                transformationBuffers['rotationBuffers'][n]['modelZRotationRadians'] = buffer['rotation'][2];

                // Delta
                // transformationBuffers['rotationBuffers'][n]['modelXRotationRadians'] = deltaTime * buffer['rotation'][0] + transformationBuffers['rotationBuffers'][n]['modelXRotationRadians'];
                // transformationBuffers['rotationBuffers'][n]['modelYRotationRadians'] = deltaTime * buffer['rotation'][1] + transformationBuffers['rotationBuffers'][n]['modelYRotationRadians'];
                // transformationBuffers['rotationBuffers'][n]['modelZRotationRadians'] = deltaTime * buffer['rotation'][2] + transformationBuffers['rotationBuffers'][n]['modelZRotationRadians'];

                mat4.rotateX(worldMatrix, worldMatrix, transformationBuffers['rotationBuffers'][n]['modelXRotationRadians']);
                mat4.rotateY(worldMatrix, worldMatrix, transformationBuffers['rotationBuffers'][n]['modelYRotationRadians']);
                mat4.rotateZ(worldMatrix, worldMatrix, transformationBuffers['rotationBuffers'][n]['modelZRotationRadians']);

            } else if (buffer.length > 1 && b === 1) {
                // For some reason texture(uTexture, direction) is upside-down
                mat4.rotateZ(worldMatrix, worldMatrix, Math.PI / 2);
            }

            // Set the uniforms
            gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
            gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, viewMatrix);
            gl.uniformMatrix4fv(programInfo.uniformLocations.worldMatrix, false, worldMatrix);
            // Set the drawing position to the "identity" point, which is
            // the center of the scene.
            gl.uniform3fv(programInfo.uniformLocations.worldCameraPositionLocation, context.worldCameraPosition);

            // Tell the shader to use texture unit 0 for u_texture
            gl.uniform1i(programInfo.uniformLocations.textureLocation, 0);

            // gl.drawArrays(gl.TRIANGLES, 0, buffer['positionSize'] / 3);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer['index']);
            gl.drawElements(gl.TRIANGLES, buffer['indexSize'], gl.UNSIGNED_SHORT, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        }
    }

}
