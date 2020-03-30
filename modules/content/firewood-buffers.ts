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

            const FirewoodObj = await FirewoodResponse.json();

            // Define vertex (position) buffer and vertex values
            const vertexBuffer: WebGLBuffer = gl.createBuffer();
            const vertices = FirewoodObj['vertices'];

            // Define index buffer and index values
            const indexBuffer: WebGLBuffer = gl.createBuffer();
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
                translation: [ -0.5, 0.0, 2.5 ],
                textureSource: 'data/world/super-mario-galaxy-the-library/Yellow Brown Mix.png'
            };

        });
}
