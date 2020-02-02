// import createContext from './modules/basic/webvr-context';
import backgroundUpdater from "./modules/basic/background-update";
import createContext from './modules/content/context';
// import initShaderProgram from "./modules/basic/basic-shaders";
// import initShaderProgram from "./modules/content/cubemap-shaders";
import initShaderProgram from "./modules/content/normal-shaders";
// import initBuffers from "./modules/content/cube-buffers";
import initBuffers from "./modules/content/firewood-buffers";
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

        let camera = {
            current: 0,
            viewPoints: [],
            get viewPoint() {
                return this.viewPoints[this.current]
            },
            nextViewPoint: function (event) {
                const viewPoints = this.viewPoints;
                this.current = (++this.current < viewPoints.length) ? this.current : 0;
                console.log(this.current, this.viewPoints);
                const x = this.viewPoint.viewPosition[0]
                const y = this.viewPoint.viewPosition[1]
                const z = this.viewPoint.viewPosition[2]
                updateContext(gl, {
                    viewPosition: [
                        this.viewPoint.viewPosition[0],
                        this.viewPoint.viewPosition[1],
                        this.viewPoint.viewPosition[2]
                    ]
                });
            },
            prevViewPoint: function (event) {
                const viewPoints = this.viewPoints;
                this.current = (--this.current > -1) ? this.current : viewPoints.length - 1;
                console.log(this.current, this.viewPoints);
                updateContext(gl, {
                    viewPosition: [
                        this.viewPoint.viewPosition[0],
                        this.viewPoint.viewPosition[1],
                        this.viewPoint.viewPosition[2]
                    ]
                });
            }
        };

        camera.viewPoints.push({
            'viewPosition': [ 0, 0, 25 ],
            'viewTarget': [ 0, 0, 0 ]
        });

        camera.viewPoints.push({
            'viewPosition': [ 0.5, 0, 2.5 ],
            'viewTarget': [ 0, 0, 0 ]
        });

        console.log(camera.viewPoints);

        const { gl, updateContext } = await createContext(
            {
                canvas,
                viewPosition: [
                    camera.viewPoint.viewPosition[0],
                    camera.viewPoint.viewPosition[1],
                    camera.viewPoint.viewPosition[2]
                ],
                viewTarget: [
                    camera.viewPoint.viewTarget[0],
                    camera.viewPoint.viewTarget[1],
                    camera.viewPoint.viewTarget[2]
                ]
            },
            initBuffers,
            initShaderProgram);

        backgroundUpdater(gl);

        // Create a texture.
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

        let frame = 0;
        let timeout = null;
        let lastKeyPress = (new Date()).getTime();
        window['userTriggered'] = false;

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
                                'cameraDelta': [0, 0, -0.5],
                                'viewPosition': [
                                    camera.viewPoint.viewPosition[0],
                                    camera.viewPoint.viewPosition[1],
                                    camera.viewPoint.viewPosition[2]
                                ],
                                'worldCameraPosition': [0, 0, -2.5]
                            });
                        } else {
                            updateContext(gl, {
                                'cameraDelta': [0, 0, -0.2],
                                'viewPosition': [0, 0, 5],
                                'worldCameraPosition': [0, 0, 2.5]
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

                return true;

            } else if (kbEvent['keyCode'] === 61) { // this is +/=
                camera.nextViewPoint(event);

                kbEvent.preventDefault();

                return true;

            }  else if (kbEvent['keyCode'] === 173) { // this is +/=
                camera.prevViewPoint(event);

                kbEvent.preventDefault();

                return true;

            } else {
                console.log('Keyboard Event: ', kbEvent['keyCode']);
                return false;
            }
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
                if (camera.current === 0) triggerMovement(e);
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
                if (camera.current === 0) triggerMovement(e);
                e.preventDefault();
            });
        }
    })();

    window['userTriggered'] = false;
}

main();
