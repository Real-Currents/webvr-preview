export default function initShaderProgram(gl) {

    // Vertex shader program

    const vertexShader = loadShader(gl, gl.VERTEX_SHADER,`
attribute vec4 aVertexColor;
attribute vec3 aVertexNormal;
attribute vec4 aVertexPosition;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uWorldMatrix;

varying vec3 v_normal;
varying vec3 v_worldNormal;
varying vec3 v_worldPosition;

varying lowp vec4 vColor;

void main() {
  //gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
  // Multiply the position by the matrix.
  gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;

  // Pass a normal. Since the positions
  // centered around the origin we can just 
  // pass the position
  v_normal = normalize(aVertexPosition.xyz);
   
  // send the view position to the fragment shader
  v_worldPosition = (uWorldMatrix * aVertexPosition).xyz;
 
  // orient the normals and pass to the fragment shader
  v_worldNormal = mat3(uWorldMatrix) * aVertexNormal;
  
  vColor = aVertexColor;
}
`);

    // Fragment shader program

    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, `
precision highp float;

// The texture.
uniform samplerCube uTexture;

// The position of the camera
uniform vec3 uWorldCameraPosition;

// Passed in from the vertex shader.
varying vec3 v_normal;
varying vec3 v_worldNormal;
varying vec3 v_worldPosition;

varying lowp vec4 vColor;

void main() {
  //gl_FragColor = vColor;
  //gl_FragColor = textureCube(uTexture, normalize(v_normal));
  
  vec3 worldNormal = normalize(v_worldNormal);
  vec3 eyeToSurfaceDir = normalize(v_worldPosition - uWorldCameraPosition);
  vec3 direction = reflect(eyeToSurfaceDir, worldNormal);
 
  gl_FragColor = textureCube(uTexture, direction);
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
