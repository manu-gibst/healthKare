// /*
//     Data Layer
//   */

// let minuteBatching = null;

// let samples = [];
// let batchedSamples = [];

// export async function newStartTracking() {
//     if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
//         const res = await DeviceMotionEvent.requestPermission();
//         if (res !== 'granted') return;
//     }
//     window.addEventListener('devicemotion', throttledOnMotion, { passive: true });
//     minuteBatching = setInterval(batching, 5000);
//     // TODO: Don't forget to raise it back to 60sec
// }

// export async function newStopTracking() {
//     // Removing listeners
//     window.removeEventListener('devicemotion', throttledOnMotion);
//     clearInterval(minuteBatching);
//     batching(); // last batching
//     minuteBatching = null;

//     await sendSamples(); // send samples to the server
//     batchedSamples = []; // empty samples
// }

// function onMotion(ev) {
//     const a = ev.acceleration || ev.accelerationIncludingGravity;
//     if (!a) return;
//     const x = a.x || 0, y = a.y || 0, z = a.z || 0;
//     const timestamp = Date.now();
//     // Units may be m/s^2. Optionally convert to g: divide by 9.80665.
//     samples.push({ timestamp, x, y, z });
// }

// function batching() {
//     const sumRms = samples.reduce((acc, sample) => acc + getRms(sample), 0);
//     const rms = sumRms / samples.length; // average RMS

//     samples = []; // clear samples
//     batchedSamples.push(rms);
//     data.log = `Batched Samples Length: ${batchedSamples.length}`;
// }

// const getRms = (sample) => Math.sqrt((sample.x * sample.x + sample.y * sample.y + sample.z * sample.z) / 3);

// function throttle(func, delay) {
//     let timerFlag = null;

//     return (...args) => {
//         if (timerFlag === null) {
//             func(...args);
//             timerFlag = setTimeout(() => {
//                 timerFlag = null;
//             }, delay);
//         }
//     }
// }

// const throttledOnMotion = throttle(onMotion, 1000) // 1hz Sampling Rate

// /*
//     Service Layer
//   */

// import axios from 'axios';

// const instance = axios.create({
//     baseURL: 'https://f666c06d3b51.ngrok-free.app/',
//     timeout: 5000,
// });

// async function sendSamples() {
//     await instance({
//         url: '/analyze',
//         method: 'post',
//         data: {
//             samples: batchedSamples.join(','),
//         },
//     }).then(function (res) {
//         data.log = `${res.data.message}`;
//     }).catch(function (err) {
//         console.log(err);
//         data.log = err;
//     });
// }