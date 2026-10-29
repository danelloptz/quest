<template>
  <div class="space-y-3 my-4">
    <button
      v-for="option in options"
      :key="option.id"
      @click="$emit('select', option.id)"
      :class="[
        'w-full p-4 rounded-2xl font-bold text-left transition-all duration-300 flex justify-between items-center border shadow-xs',
        selectedId === option.id
          ? 'bg-[#2D5A42] border-[#2D5A42] text-white shadow-lg shadow-[#5960b3]/20 scale-[1.01]'
          : 'bg-white/80 backdrop-blur-md border-white/90 hover:border-[#5960b3]/40 text-[#1E3326]'
      ]"
    >
      <span>{{ option.text }}</span>
      <span v-if="selectedId === option.id" class="text-[#80E8DD] text-lg">✓</span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  options: Array,
  selectedId: String,
});
defineEmits(['select']);
</script>
