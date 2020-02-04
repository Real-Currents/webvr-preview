import {Fire} from "three/examples/jsm/objects/Fire";
import { mat4, vec3 }  from 'gl-matrix';

export default function initBuffers (gl: WebGL2RenderingContext):
    Promise<{
        position: WebGLBuffer, positionSize: number,
        normal: WebGLBuffer, normalSize: number,
        index: WebGLBuffer, indexSize: number,
        color: WebGLBuffer , colorSize: number,
        texture: WebGLBuffer , textureSize: number,
        rotation: Array<number>,
        scale: Array<number>,
        translation: Array<number>,
        textureSource: string
    }> {

    return (fetch('data/world/super-mario-galaxy-the-library/json/part1.json'))
        .then(async (FirewoodResponse) => {
            console.log("Fetching FirewoodObj", FirewoodResponse);

            const FirewoodObj = await FirewoodResponse.json()

            // Define vertex (position) buffer and vertex values
            const vertexBuffer: WebGLBuffer = gl.createBuffer();
            // const vertices = [-6.9975,0.15875,-1.84125,-7.015,0.24375,-1.86125,-6.33625,0.2775,-2.31,-6.31875,0.1925,-2.28875,-7.033751,-0.1025,-1.915,-7.0075,-0.02875,-1.87,-6.32875,0.00375,-2.31875,-6.355,-0.06875,-2.36375,-6.993751,0.06125,-1.8425,-6.31625,0.095,-2.29125,-6.48625,0.145,-2.54625,-6.345,0.185,-2.33,-6.345,0.185,-2.33,-6.36125,0.2625,-2.34875,-6.36125,0.2625,-2.34875,-6.3775,-0.03875,-2.39625,-6.3775,-0.03875,-2.39625,-6.35375,0.025,-2.355,-6.35375,0.025,-2.355,-6.3425,0.10375,-2.33125,-6.3425,0.10375,-2.33125,-7.165,0.11125,-2.0975,-7.04,0.22875,-1.9,-7.04,0.22875,-1.9,-7.02375,0.15125,-1.88125,-7.02375,0.15125,-1.88125,-7.0325,-0.0075,-1.90625,-7.0325,-0.0075,-1.90625,-7.056251,-0.0725,-1.9475,-7.056251,-0.0725,-1.9475,-7.02125,0.07,-1.8825,-7.02125,0.07,-1.8825,-6.81875,0.57125,-2.25,-6.766251,0.51875,-2.30125,-6.516251,0.1225,-1.635,-6.56875,0.175,-1.585,-7.0675,0.6025,-2.13875,-6.9825,0.61625,-2.16125,-6.7325,0.22,-1.49625,-6.8175,0.205,-1.4725,-6.893751,0.60625,-2.20125,-6.645,0.21,-1.535,-6.77375,-0.05,-1.64125,-6.601251,0.13875,-1.59375,-6.601251,0.13875,-1.59375,-6.553751,0.09,-1.64,-6.553751,0.09,-1.64,-6.8175,0.16375,-1.4975,-6.8175,0.16375,-1.4975,-6.73875,0.1775,-1.51875,-6.73875,0.1775,-1.51875,-6.665,0.16875,-1.55125,-6.665,0.16875,-1.55125,-7.02375,0.34625,-2.3075,-6.803751,0.4875,-2.305,-6.803751,0.4875,-2.305,-6.851251,0.53625,-2.25875,-6.851251,0.53625,-2.25875,-6.98875,0.57375,-2.185,-6.98875,0.57375,-2.185,-7.0675,0.56,-2.16375,-7.0675,0.56,-2.16375,-6.915,0.56625,-2.2175,-6.915,0.56625,-2.2175,-6.715,-0.0625,-2.74375,-6.78,-0.10375,-2.6975,-6.5475,0.28625,-2.0225,-6.48125,0.32625,-2.06875,-6.64625,0.155,-2.89375,-6.641251,0.0775,-2.85,-6.40875,0.4675,-2.175,-6.4125,0.545,-2.21875,-6.665,0.0,-2.7975,-6.431251,0.39,-2.1225,-6.705,0.5375,-2.11375,-6.516251,0.35875,-2.075,-6.516251,0.35875,-2.075,-6.5775,0.3225,-2.03375,-6.5775,0.3225,-2.03375,-6.46,0.55,-2.205,-6.46,0.55,-2.205,-6.455,0.47875,-2.165,-6.455,0.47875,-2.165,-6.475,0.4125,-2.12125,-6.475,0.4125,-2.12125,-6.9375,0.1475,-2.78875,-6.81,-0.06625,-2.70875,-6.81,-0.06625,-2.70875,-6.75,-0.03,-2.75125,-6.75,-0.03,-2.75125,-6.6875,0.0875,-2.84125,-6.6875,0.0875,-2.84125,-6.6925,0.16,-2.88,-6.6925,0.16,-2.88,-6.7075,0.0225,-2.79625,-6.7075,0.0225,-2.79625];
            const vertices = FirewoodObj['vertices'];

            // Define index buffer and index values
            const indexBuffer: WebGLBuffer = gl.createBuffer();
            // const indices = [4,26,28,26,4,5,7,5,4,5,7,6,15,6,7,6,15,17,5,30,26,30,5,8,6,8,5,8,6,9,17,9,6,9,17,19,8,24,30,24,8,0,9,0,8,0,9,3,19,3,9,3,19,11,0,22,24,22,0,1,3,1,0,1,3,2,11,2,3,2,11,13,10,18,16,18,10,20,12,20,10,27,21,29,21,27,31,25,21,31,21,25,23,7,28,15,28,7,4,1,13,22,13,1,2,10,29,21,29,10,16,14,21,23,21,14,10,14,12,10,36,58,60,58,36,37,39,37,36,37,39,38,47,38,39,38,47,49,37,62,58,62,37,40,38,40,37,40,38,41,49,41,38,41,49,51,40,56,62,56,40,32,41,32,40,32,41,35,51,35,41,35,51,43,32,54,56,54,32,33,35,33,32,33,35,34,43,34,35,34,43,45,42,50,48,50,42,52,44,52,42,59,53,61,53,59,63,57,53,63,53,57,55,39,60,47,60,39,36,33,45,54,45,33,34,42,61,53,61,42,48,46,53,55,53,46,42,46,44,42,68,90,92,90,68,69,71,69,68,69,71,70,79,70,71,70,79,81,69,94,90,94,69,72,70,72,69,72,70,73,81,73,70,73,81,83,72,88,94,88,72,64,73,64,72,64,73,67,83,67,73,67,83,75,64,86,88,86,64,65,67,65,64,65,67,66,75,66,67,66,75,77,74,82,80,82,74,84,76,84,74,91,85,93,85,91,95,89,85,95,85,89,87,71,92,79,92,71,68,65,77,86,77,65,66,74,93,85,93,74,80,78,85,87,85,78,74,78,76,74];
            const indices = FirewoodObj['indices'];

            // Create a buffer to put normals in
            var normalBuffer = gl.createBuffer();
            var normals = FirewoodObj['normals'];

            // Define diffuse color buffer and color values (per vertex)
            const colorBuffer: WebGLBuffer = gl.createBuffer();
            const colors = [];
            try {
                const diffuseColor = [FirewoodObj['Kd'][0], FirewoodObj['Kd'][1], FirewoodObj['Kd'][2], 1.0];
                console.log(diffuseColor);
                vertices.forEach(v => diffuseColor.forEach(dc => colors.push(dc)));
            } catch(e) {
                console.log(e, FirewoodObj['Kd']);
            }

            const textureBuffer = gl.createBuffer();
            const textureCoords = FirewoodObj['texture_coords'];

            // Load vertex value into bound buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

            // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = normalBuffer)
            gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
            // Put normals data into buffer
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

            // Load color value into bound buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

            // Load index values into bound buffer
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

            gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);

            // Un-bind buffers
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

            return {
                position: vertexBuffer, positionSize: vertices.length,
                normal: normalBuffer, normalSize: normals.length,
                index: indexBuffer, indexSize: indices.length,
                color: colorBuffer, colorSize: colors.length,
                texture: textureBuffer, textureSize: textureCoords.length,
                rotation: [ 0.0, 0.0, 0.0 ],
                scale: [ 1.0, 1.0, 1.0 ],
                translation: [ -0.5, 0.0, 5.0 ],
                textureSource: 'data/world/super-mario-galaxy-the-library/Yellow Brown Mix.png'
            };

        });
}
