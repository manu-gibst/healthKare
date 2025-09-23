<template>
  <q-page class="flex flex-center">
    <div class="row full-width">
      <div class="col text-center">{{ data.state }}</div>
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
  });

  const toggleSleep = () => {
    console.log('toggleSleep called');
    switch (data.state) {
      case 'initial':
        data.state = 'sleeping';
        break;
      case 'sleeping':
        data.state = 'finished';
        break;
      default:
        data.state = 'initial';
        break;
    }
  };

  const iconName = computed(() => {
    return data.state === 'sleeping'? 'pause' : 'play_arrow'
  });
</script>
