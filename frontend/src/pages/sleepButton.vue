<template>
	<div class="col text-center">
		<q-btn
			round unelevated 
			color="primaryVariant"
			class="glow-5 glow-2"
			:icon="props.iconName"
			@click="props.toggleSleep"
			size="32px"
		/>
	</div>
</template>

<script setup lang>
	const props = defineProps({
		iconName: {
			type: String, 
			required: true,
		},
		toggleSleep: Function,
	});
</script>
