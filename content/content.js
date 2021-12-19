"use strict";

var vertexShaderSource = `#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec2 a_position;
in vec2 a_texCoord;

// Used to pass in the resolution of the canvas
uniform vec2 u_resolution;

// Used to pass the texture coordinates to the fragment shader
out vec2 v_texCoord;
out vec2 v_posPix;

// all shaders have a main function
void main() {

  // convert the position from pixels to 0.0 to 1.0
  vec2 zeroToOne = a_position / u_resolution;

  // convert from 0->1 to 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;

  // convert from 0->2 to -1->+1 (clipspace)
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

  // pass the texCoord to the fragment shader
  // The GPU will interpolate this value between points.
  v_texCoord = a_texCoord;
  v_posPix=a_position;
}
`;

var fragmentShaderSource = `#version 300 es

// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;

// our textures
uniform sampler2D u_image0;
uniform sampler2D u_image1;
uniform sampler2D u_image2;
uniform sampler2D u_image3;
uniform sampler2D u_image4;


// the texCoords passed in from the vertex shader.
in vec2 v_texCoord;
in vec2 v_posPix;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  vec2 onePixel = vec2(1) / vec2(textureSize(u_image0, 0));
  
  // if (mod(v_posPix[0]*1.0,5.0) < 1.0 )
  //   outColor = texture(u_image0, v_texCoord);
  // else if (mod(v_posPix[0]*1.0,5.0) < 2.0 )
  //   outColor = texture(u_image1, v_texCoord);
  // else if (mod(v_posPix[0]*1.0,5.0) < 3.0 )
  //   outColor = texture(u_image2, v_texCoord);
  // else if (mod(v_posPix[0]*1.0,5.0) < 4.0 )
  //   outColor = texture(u_image3, v_texCoord);
  // else if (mod(v_posPix[0]*1.0,5.0) < 5.0 )
  //   outColor = texture(u_image4, v_texCoord);
  // else
  //   outColor = vec4(0.2,1.0,1.0,1.0);
  
  
  // if (mod(v_posPix[0]*1.0,5.0) < 1.0 && mod(v_posPix[1]*1.0,5.0) < 1.0 )
  //   outColor = vec4(1.0,0.0,1.0,1.0);
  // else if (mod(v_posPix[0]*1.0,5.0) < 2.0 && mod(v_posPix[1]*1.0,5.0) < 2.0 )
  //   outColor = vec4(0.2,1.0,0.0,1.0);
  // else if (mod(v_posPix[0]*1.0,5.0) < 3.0 && mod(v_posPix[1]*1.0,5.0) < 3.0  )
  //   outColor = vec4(0.2,0.0,1.0,1.0);
  // else if (mod(v_posPix[0]*1.0,5.0) < 4.0 && mod(v_posPix[1]*1.0,5.0) < 4.0 )
  //   outColor = vec4(0.0,0.0,0.0,1.0);
  // else if (mod(v_posPix[0]*1.0,5.0) < 5.0 && mod(v_posPix[1]*1.0,5.0) < 5.0 )
  //   outColor = vec4(1.0,1.0,1.0,1.0);
  // else
  //   outColor = vec4(0.2,1.0,1.0,1.0);
  
  
  if (mod(v_posPix[0]*1.0,9.0) < 1.0 && mod(v_posPix[1]*1.0,9.0) < 1.0 )
    outColor = vec4(1.0,1.0,1.0,1.0);
  else
    outColor = vec4(0.0,0.0,0.0,1.0);
}
`;


function loadImage(url, callback) {
    var image = new Image();
    image.src = url;
    image.onload = callback;
    return image;
}

function loadImages(urls, callback) {
    var images = [];
    var imagesToLoad = urls.length;

    // Called each time an image finished loading.
    var onImageLoad = function() {
        --imagesToLoad;
        // If all the images are loaded call the callback.
        if (imagesToLoad == 0) {
            callback(images);
        }
    };

    for (let ii = 0; ii < imagesToLoad; ++ii) {
        var image = loadImage(urls[ii], onImageLoad);
        images.push(image);
    }
}

function main() {
    loadImages([
        "pics/b-001.png",
        "pics/b-002.png",
        "pics/b-003.png",
        "pics/b-004.png",
        "pics/b-005.png"
    ], render);
}

const defaultShaderType = [
    "VERTEX_SHADER",
    "FRAGMENT_SHADER",
];

var error = function(msg) {
    if (window.console) {
        if (window.console.error) {
            window.console.error(msg);
        }
        else if (window.console.log) {
            window.console.log(msg);
        }
    }
};

function createProgram(
    gl, shaders, opt_attribs, opt_locations, opt_errorCallback) {
    const errFn = opt_errorCallback || error;
    const program = gl.createProgram();
    shaders.forEach(function(shader) {
        gl.attachShader(program, shader);
    });
    if (opt_attribs) {
        opt_attribs.forEach(function(attrib, ndx) {
            gl.bindAttribLocation(
                program,
                opt_locations ? opt_locations[ndx] : ndx,
                attrib);
        });
    }
    gl.linkProgram(program);

    // Check the link status
    const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked) {
        // something went wrong with the link
        const lastError = gl.getProgramInfoLog(program);
        errFn(`Error in program linking: ${lastError}\n${
            shaders.map(shader => {
                const src = addLineNumbersWithError(gl.getShaderSource(shader));
                const type = gl.getShaderParameter(shader, gl.SHADER_TYPE);
                return `${glEnumToString(gl, type)}:\n${src}`;
            }).join('\n')
        }`);

        gl.deleteProgram(program);
        return null;
    }
    return program;
}

function loadShader(gl, shaderSource, shaderType, opt_errorCallback) {
    const errFn = opt_errorCallback || error;
    // Create the shader object
    const shader = gl.createShader(shaderType);

    // Load the shader source
    gl.shaderSource(shader, shaderSource);

    // Compile the shader
    gl.compileShader(shader);

    // Check the compile status
    const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled) {
        // Something went wrong during compilation; get the error
        const lastError = gl.getShaderInfoLog(shader);
        errFn(`Error compiling shader: ${lastError}\n${addLineNumbersWithError(shaderSource, lastError)}`);
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function createProgramFromSources(
    gl, shaderSources, opt_attribs, opt_locations, opt_errorCallback) {
    const shaders = [];
    for (let ii = 0; ii < shaderSources.length; ++ii) {
        shaders.push(loadShader(
            gl, shaderSources[ii], gl[defaultShaderType[ii]], opt_errorCallback));
    }
    return createProgram(gl, shaders, opt_attribs, opt_locations, opt_errorCallback);
}

function resizeCanvasToDisplaySize(canvas, multiplier) {
    multiplier = multiplier || 1;
    const width  = canvas.clientWidth  * multiplier | 0;
    const height = canvas.clientHeight * multiplier | 0;
    if (canvas.width !== width ||  canvas.height !== height) {
        canvas.width  = width;
        canvas.height = height;
        return true;
    }
    return false;
}




function render(images) {
    // Get A WebGL context
    /** @type {HTMLCanvasElement} */
    var canvas = document.querySelector("#canvas");
    var gl = canvas.getContext("webgl2");
    if (!gl) {
        return;
    }

    // setup GLSL program
    var program = createProgramFromSources(gl,
        [vertexShaderSource, fragmentShaderSource]);


    // look up where the vertex data needs to go.
    var positionLocation = gl.getAttribLocation(program, "a_position");
    var texcoordLocation = gl.getAttribLocation(program, "a_texCoord");

    // Create a buffer to put three 2d clip space points in
    var positionBuffer = gl.createBuffer();

    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // Set a rectangle the same size as the image.
    setRectangle(gl, 0, 0, images[0].width, images[0].height);

    // provide texture coordinates for the rectangle.
    var texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0.0,  0.0,
        1.0,  0.0,
        0.0,  1.0,
        0.0,  1.0,
        1.0,  0.0,
        1.0,  1.0,
    ]), gl.STATIC_DRAW);

    // create 2 textures
    var textures = [];
    for (var ii = 0; ii < 5; ++ii) {
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Set the parameters so we can render any size image.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        // Upload the image into the texture.
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[ii]);

        // add the texture to the array of textures.
        textures.push(texture);
    }

    // lookup uniforms
    var resolutionLocation = gl.getUniformLocation(program, "u_resolution");

    // lookup the sampler locations.
    var u_image0Location = gl.getUniformLocation(program, "u_image0");
    var u_image1Location = gl.getUniformLocation(program, "u_image1");
    var u_image2Location = gl.getUniformLocation(program, "u_image2");
    var u_image3Location = gl.getUniformLocation(program, "u_image3");
    var u_image4Location = gl.getUniformLocation(program, "u_image4");


    resizeCanvasToDisplaySize(gl.canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Turn on the position attribute
    gl.enableVertexAttribArray(positionLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        positionLocation, size, type, normalize, stride, offset);

    // Turn on the texcoord attribute
    gl.enableVertexAttribArray(texcoordLocation);

    // bind the texcoord buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);

    // Tell the texcoord attribute how to get data out of texcoordBuffer (ARRAY_BUFFER)
    var size = 2;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        texcoordLocation, size, type, normalize, stride, offset);

    // set the resolution
    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

    // set which texture units to render with.
    gl.uniform1i(u_image0Location, 0);  // texture unit 0
    gl.uniform1i(u_image1Location, 1);  // texture unit 1
    gl.uniform1i(u_image2Location, 2);  // texture unit 2
    gl.uniform1i(u_image3Location, 3);  // texture unit 3
    gl.uniform1i(u_image4Location, 4);  // texture unit 4

    // Set each texture unit to use a particular texture.
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[0]);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, textures[1]);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, textures[2]);
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, textures[3]);
    gl.activeTexture(gl.TEXTURE4);
    gl.bindTexture(gl.TEXTURE_2D, textures[4]);

    // Draw the rectangle.
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function setRectangle(gl, x, y, width, height) {
    var x1 = x;
    var x2 = x + width;
    var y1 = y;
    var y2 = y + height;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        x1, y1,
        x2, y1,
        x1, y2,
        x1, y2,
        x2, y1,
        x2, y2,
    ]), gl.STATIC_DRAW);
}

main();