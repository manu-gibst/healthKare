<template>
  <Line :data="dataset" :options="options" />
</template>

<script setup>
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Line } from 'vue-chartjs'
import {computed, defineProps, onMounted, ref} from 'vue';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const props = defineProps({
  samples: {
    type: Array,
    required: true,
  },
});

onMounted(() => {
  const data = [...props.samples];
  log.value = data.map((e) => e.rms);;
});

let log = ref('');

const dataset = computed(() => {
  const labels = props.samples.map((e) => {
    const time = new Date(e.timestamp);
    return `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
  });

  const data = props.samples.map((e) => e.rms);
  return {
    labels: labels,
    datasets: [{
      label: 'Activity during Sleep',
      data: data
    }],
  };
});

const options = {
  responsive: true,
  legend: {
    display: false,
  },
  plugins: {
      legend: {
          display: false,
      }
  },
  scales: {
            x: { // For the X-axis
                ticks: {
                    display: false // Set to false to hide X-axis tick labels
                }
            },
        }
}
</script>