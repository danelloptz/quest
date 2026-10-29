<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-black text-[#1E3326]">Настройки конкурса</h1>
      <router-link to="/admin" class="text-xs font-bold text-[#516b5d] hover:underline">← Назад</router-link>
    </div>

    <div class="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white space-y-4 max-w-md shadow-xs">
      <div class="space-y-2">
        <label class="text-xs font-bold text-[#2D5A42]">Количество вопросов в одной попытке</label>
        <input
          v-model.number="questionCount"
          type="number"
          min="3"
          max="60"
          class="w-full bg-white border border-[#2D5A42]/20 rounded-2xl p-3 text-[#1E3326] font-bold outline-none"
        />
      </div>

      <div v-if="activeCounts" class="text-xs text-[#516b5d] space-y-1 bg-[#F7F9F6] p-3 rounded-2xl border border-[#2D5A42]/10 font-medium">
        <p class="font-bold text-[#1E3326]">Доступно активных вопросов:</p>
        <p>• Выбор команды: {{ activeCounts.teamQs }}</p>
        <p>• Текстовый ответ: {{ activeCounts.textQs }}</p>
        <p>• 4 варианта: {{ activeCounts.mcQs }}</p>
      </div>

      <button @click="saveSettings" class="w-full bg-[#2D5A42] hover:bg-[#1E3326] text-white font-extrabold py-3.5 rounded-2xl shadow-md">
        Сохранить настройки
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../../services/api';

const questionCount = ref(12);
const activeCounts = ref(null);

onMounted(async () => {
  const res = await api.get('/admin/settings');
  questionCount.value = res.data.settings.questionCount;
  activeCounts.value = res.data.activeCounts;
});

async function saveSettings() {
  try {
    await api.put('/admin/settings', { questionCount: questionCount.value });
    alert('Настройки успешно сохранены');
  } catch (err) {
    alert(err.response?.data?.error?.message || 'Ошибка');
  }
}
</script>