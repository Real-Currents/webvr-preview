// import createContext from './modules/basic/webvr-context';
import createContext from './modules/content/context';
// import initShaderProgram from "./modules/basic/basic-shaders";
// import initShaderProgram from "./modules/content/cubemap-shaders";
import initShaderProgram from "./modules/content/normal-shaders";
// import initBuffers from "./modules/content/cube-buffers";
import initBuffers from "./modules/content/firewood-buffers";
import innerBuffers from "./modules/content/inner-cube-buffers";
import outerBuffers from "./modules/content/outer-cube-buffers";

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
            'viewPosition': [ 0, 0, 15 ],
            'viewTarget': [ 0, 0, 0 ]
        });

        camera.viewPoints.push({
            'viewPosition': [ 0.5, 0, -15 ],
            'viewTarget': [ 5.0, 0, 0 ]
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
            [
                outerBuffers,
                initBuffers
            ],
            initShaderProgram);

        let frame = 0;
        let timeout = null;
        let lastKeyPress = (new Date()).getTime();
        window['userTriggered'] = false;

        const triggerMovement = function (event) {
            // console.log(lastKeyPress, ((new Date()).getTime() - lastKeyPress));
            // console.log(startVideo);

            if (((new Date()).getTime() - lastKeyPress) > 500) {
                if (!window['userTriggered']) {
                    timeout = setInterval(() => {
                        window['userTriggered'] = true;

                        if (++frame > 90) {
                            updateContext(gl, {
                                'cameraDelta': [0, 0, -0.25],
                                'viewPosition': [
                                    camera.viewPoint.viewPosition[0],
                                    camera.viewPoint.viewPosition[1],
                                    camera.viewPoint.viewPosition[2]
                                ],
                                'worldCameraPosition': [0, 0, -2.5]
                            });
                        } else if (89 < ++frame && frame >= 90) {
                            // Only update buffers for one ~ two frames...
                            updateContext(gl, {
                                'buffers': [
                                    outerBuffers,
                                    innerBuffers
                                ],
                                'cameraDelta': [0, 0, -0.25],
                                'viewPosition': [
                                    camera.viewPoint.viewPosition[0],
                                    camera.viewPoint.viewPosition[1],
                                    camera.viewPoint.viewPosition[2]
                                ],
                                'worldCameraPosition': [0, 0, -2.5]
                            });
                        } else {
                            updateContext(gl, {
                                'cameraDelta': [0, 0, -0.15],
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
