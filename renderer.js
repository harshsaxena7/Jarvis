// Since we are in Electron with nodeIntegration: false, we rely on the script tags in index.html or bundlers. 
// However, for this simple setup without a bundler like Webpack/Vite, we can try to use the global objects if imported via script tags, 
// OR we can use CommonJS if we enable nodeIntegration (not recommended but easier for prototypes) 
// or use a bundler.
// Given the prompt asked for "setup Electron boilerplate", I will assume we might need to adjust how we import MediaPipe.
// The easiest way for a "Tony Stark" style NUI without complex build steps is to use the CDN links or require them if nodeIntegration is enabled.
// BUT, my main.js has nodeIntegration: false and contextIsolation: true. 
// So I should probably use the "script src" approach in index.html for MediaPipe or use a simple bundler.
// Let's stick to standard node requires if we can, but since contextIsolation is true, require won't work in renderer.
// Actually, I should update index.html to include MediaPipe via CDN for simplicity, OR use a bundler.
// Let's try the CDN approach in index.html first as it's fastest for prototyping.
// WAIT, I installed them via NPM. So I should probably require them if I can.
// To use npm packages in renderer with contextIsolation: true, we usually need a bundler (Parcel/Vite).
// To keep it simple and "raw", I will change main.js to allow nodeIntegration: true for this specific "prototype" phase 
// so I can `require` stuff in renderer.js directly. It's less secure but faster to build.
// OR, I can use the new `importmap` or just reference the node_modules paths in script tags? No, electron blocks that.

// REVISION: I will update main.js to enable nodeIntegration for now to simplify requiring modules in renderer.
// This is acceptable for a local amateur project (Tony Stark MVP).

const { Hands, HAND_CONNECTIONS } = require('@mediapipe/hands');
const { Camera } = require('@mediapipe/camera_utils');
const { drawConnectors, drawLandmarks } = require('@mediapipe/drawing_utils');

const videoElement = document.getElementById('input_video');
const canvasElement = document.getElementById('output_canvas');
const canvasCtx = canvasElement.getContext('2d');
const statusElement = document.getElementById('status');

console.log("Renderer script loaded");

let lastX = 0.5;
let lastY = 0.5;
const smoothing = 0.3; // 1.0 = no smoothing, lower = more smooth/latency

async function onResults(results) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 5 });
        drawLandmarks(canvasCtx, landmarks, { color: '#FF0000', lineWidth: 2 });

        const indexTip = landmarks[8];
        const thumbTip = landmarks[4];

        if (indexTip && thumbTip) {
            // FIX: Invert X coordinate for natural "mirror" movement
            // Also apply Exponential Moving Average (EMA) for smoothing
            
            // AMPLIFIED MAPPING: 
            // We use a 10% margin on each side of the camera view to represent the screen edges.
            // This means we don't have to reach the physical edge of the camera to hit the screen edge.
            const margin = 0.1;
            const targetXRaw = 1 - indexTip.x;
            const targetYRaw = indexTip.y;

            // Map [margin, 1-margin] to [0, 1]
            const targetX = Math.max(0, Math.min(1, (targetXRaw - margin) / (1 - 2 * margin)));
            const targetY = Math.max(0, Math.min(1, (targetYRaw - margin) / (1 - 2 * margin)));

            lastX = (targetX * smoothing) + (lastX * (1 - smoothing));
            lastY = (targetY * smoothing) + (lastY * (1 - smoothing));

            window.electronAPI.moveMouse({ x: lastX, y: lastY });

            // Click Logic
            const dx = indexTip.x - thumbTip.x;
            const dy = indexTip.y - thumbTip.y;
            const distance = Math.sqrt(dx*dx + dy*dy);

            if (distance < 0.05) {
                statusElement.innerText = "Click!";
                statusElement.style.color = "red";
                window.electronAPI.clickMouse();
            } else {
                const middleTip = landmarks[12];
                const ringTip = landmarks[16];
                
                if (middleTip.y < landmarks[10].y && indexTip.y < landmarks[6].y && ringTip.y > landmarks[14].y) {
                     statusElement.innerText = "Agent Active!";
                     statusElement.style.color = "purple";
                     if (!window.agentTriggered) {
                         window.agentTriggered = true;
                         window.electronAPI.triggerAgent('Victory Sign').then(res => {
                             window.agentTriggered = false;
                         });
                     }
                } else {
                    statusElement.innerText = "Tracking...";
                    statusElement.style.color = "#00ffcc";
                }
            }
        }
    }
    canvasCtx.restore();
}

const hands = new Hands({locateFile: (file) => {
    return `./node_modules/@mediapipe/hands/${file}`;
}});

hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 0, // Lower complexity for faster processing
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

hands.onResults(onResults);

const camera = new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({image: videoElement});
    },
    width: 640,
    height: 480
});

camera.start()
    .then(() => console.log("Camera started at 640x480"))
    .catch(e => console.error("Camera start error:", e));

