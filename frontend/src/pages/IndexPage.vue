<template>
  <q-page class="flex flex-center">
    <div class="row full-width">
      <div class="col text-center">{{ data.state }}</div>
      <div class="col text-center">{{ data.log }}</div>
    </div>
    <div class="row">
      <div class="col text-center">
        <q-btn
          round color="primary"
          :icon="iconName"
          @click="toggleSleep"
          size="32px"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
  import {reactive, computed} from 'vue';

  const data = reactive({
    state: 'initial',
    log: '',
  });

  async function toggleSleep () {
    switch (data.state) {
      case 'not sleeping':
        await startTracking();
        data.state = 'sleeping';
        break;
      case 'sleeping':
      default:
        await stopTracking();
        data.state = 'not sleeping';
        break;
    }
  };

  const iconName = computed(() => {
    return data.state === 'sleeping'? 'pause' : 'play_arrow'
  });

  async function startTracking() {
    data.log = 'startTracking() called';
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      const res = await DeviceMotionEvent.requestPermission();
      if (res !== 'granted') return;
    }
    window.addEventListener('devicemotion', onMotion, { passive: true });
  }

  async function stopTracking() {
    window.removeEventListener('devicemotion', onMotion);
  }

  function onMotion(ev) {
    const a = ev.acceleration || ev.accelerationIncludingGravity;
    if (!a) return;
    const x = a.x || 0, y = a.y || 0, z = a.z || 0;
    const timestamp = Date.now();
    // Units may be m/s^2. Optionally convert to g: divide by 9.80665.
    console.log(`{ timestamp=${timestamp}, x=${x}, y=${y}, z=${z} }`);
    data.log = `{ timestamp=${timestamp}, x=${x}, y=${y}, z=${z} }`;
    // samples.push({ timestamp, x, y, z });
  }
</script>
