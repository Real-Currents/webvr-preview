export default function initShaderProgram(gl) {

    // Vertex shader program

    const vertexShader = loadShader(gl, gl.VERTEX_SHADER,`#version 300 es
precision mediump float;

in vec4 aVertexColor;
in vec3 aVertexNormal;
in vec3 aVertexPosition;

uniform mat4 uModelViewMatrix;
uniform mat4 uNormalMatrix;
uniform vec3 uLightDirection;
uniform vec3 uLightDiffuse;
uniform vec3 uMaterialDiffuse;
uniform mat4 uProjectionMatrix;
uniform mat4 uWorldMatrix;

out vec3 v_normal;
out vec3 v_worldNormal;
out vec3 v_worldPosition;

out vec4 vVertexColor;

void main() {
  
  vVertexColor = aVertexColor;
  
  // gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition; // vec4 aVertexPosition
  
  // Calculate the normal vector
  vec3 N = normalize(vec3(uNormalMatrix * vec4(aVertexNormal, 1.0)));

  // Normalized light direction
  vec3 L = normalize(uLightDirection);

  // Dot product of the normal product and negative light direction vector
  float lambertTerm = dot(N, -L);

  // Calculating the diffuse color based on the Lambertian reflection model
  // vec3 Id = uMaterialDiffuse * uLightDiffuse * lambertTerm;
  vec3 Id = aVertexColor.rgb * uLightDiffuse * lambertTerm;

  // Set the varying to be used inside of the fragment shader
  vVertexColor = vec4(Id, 1.0);

  // Setting the vertex position
  // gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);

  // Pass a normal. Since the positions
  // centered around the origin we can just 
  // pass the position
  v_normal = normalize(aVertexPosition.xyz);
  
  // Multiply the position by the matrix.
  gl_Position = uProjectionMatrix * uModelViewMatrix * uWorldMatrix * vec4(aVertexPosition, 1.0);
   
  // send the view position to the fragment shader
  // v_worldPosition = (uWorldMatrix * aVertexPosition).xyz;
 
  // orient the normals and pass to the fragment shader
  // v_worldNormal = mat3(uWorldMatrix) * aVertexNormal;
}
`);

    // Fragment shader program

    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, `#version 300 es
precision mediump float;

// The texture.
uniform samplerCube uTexture;

// The position of the camera
uniform vec3 uWorldCameraPosition;

// Passed in from the vertex shader.
in vec3 v_normal;
in vec3 v_worldNormal;
in vec3 v_worldPosition;

in lowp vec4 vVertexColor;

out vec4 fragColor;

void main() {
  // fragColor = vVertexColor;
  fragColor = texture(uTexture, normalize(v_normal)) * vVertexColor;
  
  // vec3 worldNormal = normalize(v_worldNormal);
  // vec3 eyeToSurfaceDir = normalize(v_worldPosition - uWorldCameraPosition);
  // vec3 direction = reflect(eyeToSurfaceDir, worldNormal);
 
  // fragColor = texture(uTexture, direction);
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
