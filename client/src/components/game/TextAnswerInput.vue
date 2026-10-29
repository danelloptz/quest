<template>
  <div class="my-6 space-y-2">
    <input
      type="text"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      placeholder="Введите ваш ответ..."
      class="w-full bg-white/80 backdrop-blur-md border border-[#2D5A42]/20 focus:border-[#2D5A42] focus:ring-2 focus:ring-[#80E8DD]/40 rounded-2xl p-4 text-[#1E3326] font-semibold placeholder-[#516b5d]/50 outline-none transition shadow-inner"
      maxlength="200"
    />
    <p class="text-xs font-medium text-[#516b5d] px-1">Регистр букв и лишние пробелы не учитываются при проверке.</p>
  </div>
</template>

<script setup>
defineProps({
  modelValue: String,
});
defineEmits(['update:modelValue']);
</script>
