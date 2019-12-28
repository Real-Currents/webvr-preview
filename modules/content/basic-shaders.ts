export default function initShaderProgram(gl) {

    // Vertex shader program

    const vertexShader = loadShader(gl, gl.VERTEX_SHADER,`#version 300 es
precision mediump float;

in vec4 aVertexColor;
in vec3 aVertexNormal;
in vec3 aVertexPosition;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

out vec4 vVertexColor;

void main(void) {
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
  vVertexColor = aVertexColor;
}
`);

    // Fragment shader program

    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, `#version 300 es
precision mediump float;

in vec4 vVertexColor;

out mediump vec4 fragColor;

void main(void) {
  fragColor = vVertexColor;
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
