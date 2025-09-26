<template>
	<div class="col text-center">
		<q-btn
			round unelevated 
			color="primaryVariant"
			class="glow-5 glow-2"
			:icon="iconName"
			@click="toggleSleep"
			size="32px"
		/>
	</div>
</template>

<script setup lang>
	defineProps({
		iconName: {
			type: String, 
			required: true,
		},
		toggleSleep: Function,
	});
</script>
