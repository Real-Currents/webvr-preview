export default function initShaderProgram(gl) {

    // Vertex shader program

    const vertexShader = loadShader(gl, gl.VERTEX_SHADER,`
attribute vec4 aVertexPosition;
attribute vec4 aVertexColor;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying lowp vec4 vColor;

varying vec3 v_normal;

void main() {
  //gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
  // Multiply the position by the matrix.
  gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;

  // Pass a normal. Since the positions
  // centered around the origin we can just 
  // pass the position
  v_normal = normalize(aVertexPosition.xyz);
  
  vColor = aVertexColor;
}
`);

    // Fragment shader program

    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, `
varying lowp vec4 vColor;

precision mediump float;

// Passed in from the vertex shader.
varying vec3 v_normal;

// The texture.
uniform samplerCube u_texture;

void main() {
  //gl_FragColor = vColor;
  gl_FragColor = textureCube(u_texture, normalize(v_normal));
}
`);

    // Create the shader program

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        window.alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);

    // Send the source to the shader object

    gl.shaderSource(shader, source);

    // Compile the shader program

    gl.compileShader(shader);

    // See if it compiled successfully

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        window.alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}
