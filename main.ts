// import createContext from './modules/basic/webvr-context';
import backgroundUpdater from "./modules/basic/background-update";
import createContext from './modules/content/context';
import initBuffers from "./modules/content/cube-buffers";
import innerBuffers from "./modules/content/inner-cube-buffers";
import initShaderProgram from "./modules/content/cubemap-shaders";
import generateFace from "./modules/content/face-generator";

const canvas: HTMLCanvasElement = (window.document.querySelector('canvas#cv') !== null) ?
    window.document.querySelector('canvas#cv') :
    window.document.createElement('canvas');

//
// Start here
//
function main () {

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

    const { gl, updateContext } = createContext(canvas, initBuffers, initShaderProgram);

    backgroundUpdater(gl);

    // Get A 2D context
    /** @type {Canvas2DRenderingContext} */
    const ctx = document.createElement("canvas").getContext("2d");
    ctx.canvas.width = 128;
    ctx.canvas.height = 128;

    // Create a texture.
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

    /*
    <video id="aud1" preload="auto" muted ="true" controls="true">
      <source src="https://s3-us-west-1.amazonaws.com/real-currents/js-demos/video/fathers.mp4" />
      <source src="https://s3-us-west-1.amazonaws.com/real-currents/js-demos/video/fathers.ogv" />
    </video>
     */
    const video = document.createElement('video');
    const source1 = document.createElement('source');
    const source2 = document.createElement('source');
    source1.src = "data/fathers.mp4";
    source2.src = "data/fathers.ogv";
    let videoLoad = false;
    let videoReady = false;
    let videoName = source1.src.match(/[\/|\\]*([\w|\-|]+)\.\w\w\w$/)[1];
    video.append(source1);
    video.append(source2);

    window['aud1'] = video;

    console.log(videoName);

    let frame = 0;
    let timeout = null;
    let lastKeyPress = (new Date()).getTime();
    let startVideo = false;
    let stopVideo = false;
    window['userTriggered'] = false;

    const aCanvas = document.createElement('canvas');
    const bCanvas = document.createElement('canvas');
    aCanvas.width = bCanvas.width = ctx.canvas.width;
    aCanvas.height = bCanvas.height = ctx.canvas.height;

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
        const img = new Image();

        img.id = '' + (i + 1);

        // Use 2d face generator to generate 6 images
        generateFace(ctx, faceColor, textColor, text);

        // Upload the canvas to the cubemap face.
        const level = 0;
        const internalFormat = gl.RGBA;
        const format = gl.RGBA;
        const type = gl.UNSIGNED_BYTE;
        const width = 512;
        const height = 512;
        // gl.texImage2D(target, level, internalFormat, format, type, ctx.canvas);

        // Setup each face so it's immediately renderable
        gl.texImage2D(target, level, internalFormat, width, height, 0, format, type, null);

        // Asynchronously load an image
        // const img = new Image();
        // img.src = url;
        img.addEventListener('load', function() {
            // Now that the image has loaded make copy it to the texture.
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
            gl.texImage2D(target, level, internalFormat, format, type, img);
            gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        });

        // show the result
        ctx.canvas.toBlob((blob) => {
            console.log(`Loading ${img.id} ...`);
            img.src = URL.createObjectURL(blob);
            img.style.margin = 'auto';
            img.style.position = 'fixed';
            img.style.top = '0px';
            img.style.left = i * ctx.canvas.width + 'px';
            // document.body.appendChild(img);
        });

        setInterval(d => {
            if (frame > 0) {
                if ((+img.id) % 2) ctx.drawImage(aCanvas, 0, 0, aCanvas.width, aCanvas.height);
                else ctx.drawImage(bCanvas, 0, 0, bCanvas.width, bCanvas.height);

                // show the result
                ctx.canvas.toBlob((blob) => {
                    img.src = URL.createObjectURL(blob);
                });
            }
        }, 66);
    });
    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

    const videoPlayer = function () {
        if (!stopVideo && (startVideo || video.paused || !window['userTriggered'])) {
            startVideo = true;

            lastKeyPress = (new Date()).getTime();

            console.log("Play video");

            video.play();

            /*! Avoid any references to ctx (final buffer) within this routine !*/

            const actx = aCanvas.getContext('2d');
            actx.globalAlpha = 1.0;
            const bctx = bCanvas.getContext('2d');
            bctx.globalAlpha = 1.0;

            const vh = aCanvas.height;
            const vw = video.videoHeight * (aCanvas.width / aCanvas.height) / 2;
            const vax = 0;
            const vbx = -(vw - aCanvas.width) / 1.75;

            timeout = setInterval(d => { // requestAnimationFrame(d => {
                if ((video != null) && (video.readyState > 2) && (!video.paused)) {
                    if (++frame % 2) {
                        actx.drawImage(video, vax, 0, vw, vh);
                    } else {
                        bctx.drawImage(video, vbx, 0, vw, vh);
                    }
                }

                if (video.currentTime > 5 && !video.muted) {
                    updateContext(gl, {
                        'buffers': innerBuffers,
                        'worldCameraDelta': [ 0, 0, +0.05 ],
                        'worldCameraPosition': [ 0, 0, -1 ]
                    });
                } else if (video.currentTime > 1 && !video.muted) {
                    updateContext(gl, {
                        'worldCameraDelta': [ 0, 0, +0.025 ],
                        'worldCameraPosition': [ 0, 0, -1 ]
                    });
                }
            }, 33);

            setTimeout(s => startVideo = false, 1000);

        } else if (!startVideo) {
            console.log("Pause video!");
            video.pause();

            stopVideo = true;

            if (timeout != null) {
                // cancelAnimationFrame(timeout);
                clearTimeout(timeout);
                timeout = null;
            }

            setTimeout(s => stopVideo = false, 1000);
        }
    };

    window.addEventListener('keydown', function (event: (any | KeyboardEvent)) {
        const kbEvent = (event || window['event']); // cross-browser shenanigans
        // console.log(lastKeyPress, ((new Date()).getTime() - lastKeyPress));
        // console.log(startVideo);

        if (kbEvent['keyCode'] === 32 && ((new Date()).getTime() - lastKeyPress) > 500) { // this is the spacebar
            videoPlayer();

            if (!window['userTriggered']) {
                video.currentTime = 0;
                video.muted = false;
                window['userTriggered'] = true;
            }

            setTimeout( d => {
                if (kbEvent == KeyboardEvent) video.muted = false;
            }, 33);

            kbEvent.preventDefault();

            return true; // treat all other keys normally;

        } else return false;
    });

    window['playVideo'] = videoPlayer();

    setTimeout(() => {
        if (!!video.paused) {
            video.muted = true;
            videoPlayer();
        }
    }, 500);

}

main();
