<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
    <button
      v-for="team in teams"
      :key="team.id"
      @click="$emit('select', team.id)"
      :class="[
        'p-4 rounded-2xl font-bold text-left transition-all duration-300 flex justify-between items-center border shadow-xs',
        selectedId === team.id
          ? 'bg-[#2D5A42] border-[#2D5A42] text-white shadow-lg shadow-[#2D5A42]/20 scale-[1.02]'
          : 'bg-white/80 backdrop-blur-md border-white/90 hover:border-[#2D5A42]/40 text-[#1E3326]'
      ]"
    >
      <span>{{ team.name }}</span>
      <span v-if="selectedId === team.id" class="text-[#80E8DD] text-lg">✓</span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  teams: Array,
  selectedId: String,
});
defineEmits(['select']);
</script>
