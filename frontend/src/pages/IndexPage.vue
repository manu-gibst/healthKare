<template>
  <q-page class="flex column montserrat">
    <div class="col-1 q-mt-xl text-center">
      <q-title class="text-h6 letter-spacing-10 text-weight-light text-surfaceSubtitleText">
        HEALTH KARE
      </q-title>
    </div>

    <div class="col-grow flex justify-center items-center relative-position">
      <div class="circle container-high  flex justify-center items-center depth" style="width:300px; height:300px">
        <div class="circle container-highest flex justify-center items-center shadow" style="width:200px; height:200px">
          <div style="font-size: 40px; font-weight: 200;" class="text-primary">
            <div class="letter-spacing-4">
              {{ getStringTime }}
            </div>
          </div>
        </div>
        <!-- <svg v-if="data.sleeping" width="520" height="520" class="absolute-center"> -->
        <svg width="520" height="520" class="absolute-center">
          <circle 
            cx="260"
            cy="260"
            r="126"
            class="stroke"
            :style="{'stroke-dashoffset': getProgress}"
            fill="none"
          />
        </svg>
        <div class="circle absolute-center" id="current-time">
        </div>
      </div>
    </div>

    <div class="col-1">
      <div class="text-center text-surfaceSubtitleText letter-spacing-7 text-weight-medium">
        <div>{{ data.log }}</div>
        <div>{{ data.sleeping ? "Sleeping" : "Not Sleeping" }}</div>
        <span v-if="sleeping">STOP SLEEP</span>
        <span v-else>START SLEEP</span>
      </div>
      <Button 
        class="q-mt-lg"
        style="padding-bottom: 30%;"
        :iconName="iconName" 
        :toggleSleep="toggleSleep" 
      />
    </div>
  </q-page>
</template>

<script setup>
  import {reactive, computed, onMounted, onUnmounted} from 'vue';
  import axios from 'axios';
  import Button from './sleepButton.vue'
  /*
    Business Logic Layer
  */

  const data = reactive({
    sleeping: false,
    log: '',
    time: {
      hours: 0,
      minutes: 0,
    },
    timer: null,
  });

  const RADIUS = 126;


  async function toggleSleep () {
    switch (data.sleeping) {
      case false:
        await startTracking();
        data.sleeping = true;
        break;
      case true:
        await stopTracking();
        data.sleeping= false;
        break;
    }
  };

  const iconName = computed(() => {
    return data.sleeping? 'pause' : 'play_arrow'
  });

  const getStringTime = computed(() => {
    return `${data.time.hours.toString().padStart(2, '0')}:${data.time.minutes.toString().padStart(2, '0')}`;
  });

  const getProgress = computed(() => {
    if(samples.length === 0) return 2 * Math.PI * RADIUS;

    const diff = samples.at(-1).timestamp - samples[0].timestamp;
    const hours = diff / 1000 / 3600;
    const ratio = hours / 12;
    return 2 * Math.PI * (1-ratio) * RADIUS;
  });

  const updateTime = () => {
    const now = new Date();
    data.time.hours = now.getHours();
    data.time.minutes = now.getMinutes();
  }

  onMounted(() => {
    data.timer = setInterval(updateTime, 1000);
  });
  
  onUnmounted(()=>{
    clearInterval(updateTime);
    data.timer = null;
  });
  /* 
    Service Logic Layer
  */

  let minuteBatching = null;

  let samples = [];
  let batchedSamples = [];

  async function startTracking() {
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      const res = await DeviceMotionEvent.requestPermission();
      if (res !== 'granted') return;
    }
    window.addEventListener('devicemotion', throttledOnMotion, { passive: true });
    minuteBatching = setInterval(batching, 5000);
    // TODO: Don't forget to raise it back to 60sec
  }

  async function stopTracking() {
    // Removing listeners    
    window.removeEventListener('devicemotion', throttledOnMotion);
    clearInterval(minuteBatching);
    batching(); // last batching
    minuteBatching = null;

    await sendSamples(); // send samples to the server
    batchedSamples = []; // empty samples
  }

  async function onMotion(ev) {
    const a = ev.acceleration || ev.accelerationIncludingGravity;
    if (!a) return;
    const x = a.x || 0, y = a.y || 0, z = a.z || 0;
    const timestamp = Date.now();
    // Units may be m/s^2. Optionally convert to g: divide by 9.80665.
    samples.push({ timestamp, x, y, z });
  }

  function batching() {
    const sumRms =  samples.reduce((acc, sample) => acc + getRms(sample), 0);
    const rms = sumRms / samples.length; // average RMS

    batchedSamples.push({
      timestamp: samples[0].timestamp,
      rms: rms,
    });

    samples = []; // clear samples
    data.log = `Batched Samples Length: ${batchedSamples.length}`;
  }

  const  getRms = (sample) => Math.sqrt((sample.x * sample.x + sample.y * sample.y + sample.z * sample.z) / 3);

  function throttle(func, delay) {
    let timerFlag = null;

    return (...args) => {
      if(timerFlag === null) {
        func(...args);
        timerFlag = setTimeout(() => {
          timerFlag = null;
        }, delay);
      }
    }
  }

  const throttledOnMotion = throttle(onMotion, 1000) // 1hz Sampling Rate


  /*
    Service Layer
  */


  const baseUrl = 'https://e6931b7e0181.ngrok-free.app/';

  const instance = axios.create({
    baseURL: baseUrl,
    timeout: 5000, 
  });

  async function sendSamples() {
    await instance({
      url: '/analyze',
      method: 'post',
      data: {
        samples: batchedSamples,
      },
    }).then(function(res) {
      data.log = `Duration: ${res.data.duration}, Efficiency: ${res.data.efficiency}, Quality: ${res.data.quality}`;
    }).catch(function(err) {
      console.log(err);
    }); 
  }
  

</script>
