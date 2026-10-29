<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-black text-[#1E3326]">Результаты участников</h1>
      <router-link to="/admin" class="text-xs font-bold text-[#516b5d] hover:underline">← Назад</router-link>
    </div>

    <div class="bg-white/80 backdrop-blur-xl rounded-2xl border border-white overflow-hidden shadow-xs">
      <table class="w-full text-left text-sm text-[#1E3326]">
        <thead class="bg-[#F7F9F6] text-[#516b5d] uppercase text-[10px] font-black tracking-wider border-b border-[#2D5A42]/10">
          <tr>
            <th class="p-4">Место</th>
            <th class="p-4">Участник</th>
            <th class="p-4">Статус</th>
            <th class="p-4">Результат</th>
            <th class="p-4">Время</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#2D5A42]/10 font-semibold">
          <tr v-for="(r, idx) in results" :key="r.id">
            <td class="p-4 font-black text-amber-700">#{{ idx + 1 }}</td>
            <td class="p-4 font-extrabold">{{ r.participantName }}</td>
            <td class="p-4">
              <span :class="r.status === 'COMPLETED' ? 'text-[#2D5A42]' : 'text-amber-700'">
                {{ r.status === 'COMPLETED' ? 'Завершен' : 'В процессе' }}
              </span>
            </td>
            <td class="p-4 font-black">
              {{ r.score !== null ? `${r.score} / ${r.questionCount}` : '—' }}
            </td>
            <td class="p-4">{{ r.durationSeconds ? `${r.durationSeconds} сек.` : '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../../services/api';

const results = ref([]);

onMounted(async () => {
  const res = await api.get('/admin/results');
  results.value = res.data.results;
});
</script>
