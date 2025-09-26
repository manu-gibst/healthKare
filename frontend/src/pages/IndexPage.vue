<template>
  <q-page class="flex column montserrat">
    <div class="col-1 q-mt-xl text-center z-max">
      <q-title class="text-h6 letter-spacing-10 text-weight-light text-surfaceSubtitleText">
        HEALTH KARE
      </q-title>
    </div>
    
    <!-- Clock -->
    <div class="col-grow flex justify-center items-center relative-position">
      <div class="circle container-high  flex justify-center items-center depth" style="width:300px; height:300px">
        <div class="circle container-highest flex justify-center items-center shadow" style="width:200px; height:200px">
          <div style="font-size: 40px; font-weight: 200;" class="text-primary">
            <div class="letter-spacing-4">
              {{ getStringTime }}
            </div>
          </div>
        </div>
        <svg width="520" height="520" class="absolute-center">
          <circle 
            cx="260"
            cy="260"
            r="126"
            class="stroke"
            :style="{
              'stroke-dashoffset': getProgress,
              transform: `rotate(${currentTimeDegree + 90}deg) scale(-1, 1)`
            }"
            fill="none"
          />
        </svg>
        <div
          class="circle absolute"
          id="current-time"
          :style="{ transform: `translate(${currentTimeCoordinates.x}px, ${currentTimeCoordinates.y}px)` }"
        >
        </div>
      </div>
    </div>

    <div v-if="data.haveResponse" class="col-1 q-pa-md">
      <div class="text-weight-light text-h6 text-surfaceSubtitleText">Duration:</div>
      <div class="text-weight-regular text-h5 text-primary">{{ data.response.duration }}</div>
      <hr class="text-surfaceHighest"/>

      <div class="text-weight-light text-h6 text-surfaceSubtitleText">Efficiency:</div>
      <div class="text-weight-regular text-h5 text-primary">{{ data.response.efficiency }}</div>
      <hr class="text-surfaceHighest"/>

      <div class="text-weight-light text-h6 text-surfaceSubtitleText">Quality:</div>
      <div class="text-weight-regular text-h5 text-primary">{{ data.response.quality }}</div>
      <hr class="text-surfaceHighest"/>
    </div>

    <div class="col-1">
      <div class="text-center text-surfaceSubtitleText letter-spacing-7 text-weight-medium">
        <div>{{ data.log }}</div>
        {{ data.sleeping ? "STOP SLEEP" : "START SLEEP" }}
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
  import {reactive, ref, computed, onMounted, onUnmounted} from 'vue';
  import axios from 'axios';
  import Button from './sleepButton.vue'
  /*
    Business Logic Layer
  */

  const data = reactive({
    sleeping: false,
    log: '',
    haveResponse: false,
    response: {
        duration: null,
        efficiency: null,
        quality: null,
      },
    time: {
      hours: 0,
      minutes: 0,
    },
    timer: null,
  });

  // Constants for the circle
  const RADIUS = 126;


  async function toggleSleep () { 
    if(!data.sleeping){
      data.sleeping = !data.sleeping;
      await startTracking();
    }
    else {
      data.sleeping = !data.sleeping;
      await stopTracking();
    }
  };

  const iconName = computed(() => {
    return data.sleeping? 'pause' : 'play_arrow'
  });

  const getStringTime = computed(() => {
    return `${data.time.hours.toString().padStart(2, '0')}:${data.time.minutes.toString().padStart(2, '0')}`;
  });

  const getProgress = computed(() => {
    if(!data.sleeping || samples.value.length === 0) return 2 * Math.PI * RADIUS;

    const firstTime = batchedSamples.length === 0 ? samples.value[0].timestamp : batchedSamples[0].timestamp;
    const lastTime = samples.value.at(-1).timestamp;

    const diff = lastTime - firstTime;
    const hours = diff / 1000 / 3600;
    const ratio = hours / 12;
    return 2 * Math.PI * (1-ratio) * RADIUS;
  });

  const currentTimeCoordinates = computed(()=> {
    return getTimeCoordinates(data.time.hours, data.time.minutes);
  });

  const getTimeDegrees = (hours, mins) => {
    return (hours % 12) * 30 + mins * 0.5;
  };

  const currentTimeDegree = computed(() => {
    return getTimeDegrees(data.time.hours, data.time.minutes);
  });

  const getTimeCoordinates = (hours, mins) => {
    const rad = getTimeDegrees(hours, mins) * Math.PI / 180;
    const x = RADIUS * Math.sin(rad);
    const y = -(RADIUS * Math.cos(rad));
    return {x,y};
  }

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

  let samples = ref([]);
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
    samples.value.push({ timestamp, x, y, z });
  }

  function batching() {
    const sumRms =  samples.value.reduce((acc, sample) => acc + getRms(sample), 0);
    const rms = sumRms / samples.value.length; // average RMS

    batchedSamples.push({
      timestamp: samples.value[0].timestamp,
      rms: rms,
    });

    samples.value = []; // clear samples
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


  // const baseUrl = 'https://184.72.82.156:3000';
  const baseUrl = 'https://172.20.10.3:3000';

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
      data.response = {
        duration: res.data.duration,
        efficiency: res.data.efficiency,
        quality: res.data.quality,
      };
      data.haveResponse = true;
    }).catch(function(err) {
      console.log(err);
    }); 
  }
  

</script>
