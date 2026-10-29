<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center border-b border-[#2D5A42]/15 pb-4">
      <h1 class="text-2xl font-black text-[#1E3326]">Панель управления</h1>
      <button @click="logout" class="text-xs font-bold text-rose-700 hover:underline">Выйти</button>
    </div>

    <!-- Quick Navigation -->
    <div class="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
      <router-link to="/admin/teams" class="p-3 bg-white/80 hover:bg-white rounded-2xl text-center text-xs font-extrabold text-[#2D5A42] border border-white">
        Команды
      </router-link>
      <router-link to="/admin/players" class="p-3 bg-white/80 hover:bg-white rounded-2xl text-center text-xs font-extrabold text-[#2D5A42] border border-white">
        Игроки
      </router-link>
      <router-link to="/admin/questions" class="p-3 bg-white/80 hover:bg-white rounded-2xl text-center text-xs font-extrabold text-[#2D5A42] border border-white">
        Вопросы
      </router-link>
      <router-link to="/admin/results" class="p-3 bg-white/80 hover:bg-white rounded-2xl text-center text-xs font-extrabold text-[#2D5A42] border border-white">
        Результаты
      </router-link>
      <router-link to="/admin/settings" class="p-3 bg-white/80 hover:bg-white rounded-2xl text-center text-xs font-extrabold text-[#2D5A42] border border-white">
        Настройки
      </router-link>
    </div>

    <!-- Stats Cards -->
    <div v-if="stats" class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div class="bg-white/80 p-4 rounded-2xl border border-white shadow-xs">
        <div class="text-[10px] font-bold text-[#516b5d] uppercase">Участников</div>
        <div class="text-2xl font-black text-[#1E3326] mt-1">{{ stats.total }}</div>
      </div>
      <div class="bg-white/80 p-4 rounded-2xl border border-white shadow-xs">
        <div class="text-[10px] font-bold text-[#516b5d] uppercase">Завершили</div>
        <div class="text-2xl font-black text-[#2D5A42] mt-1">{{ stats.completed }}</div>
      </div>
      <div class="bg-white/80 p-4 rounded-2xl border border-white shadow-xs">
        <div class="text-[10px] font-bold text-[#516b5d] uppercase">В процессе</div>
        <div class="text-2xl font-black text-amber-700 mt-1">{{ stats.inProgress }}</div>
      </div>
      <div class="bg-white/80 p-4 rounded-2xl border border-white shadow-xs">
        <div class="text-[10px] font-bold text-[#516b5d] uppercase">Средняя точность</div>
        <div class="text-2xl font-black text-[#2D5A42] mt-1">{{ stats.avgScorePercent }}%</div>
      </div>
    </div>

    <!-- TOP 3 -->
    <div v-if="stats && stats.top3.length > 0" class="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white/90 space-y-4 shadow-sm">
      <h3 class="text-lg font-black text-[#1E3326]">🏆 Лидеры конкурса (TOP 3)</h3>
      <div class="space-y-2">
        <div
          v-for="(item, idx) in stats.top3"
          :key="item.id"
          class="flex justify-between items-center bg-[#F7F9F6] p-3 rounded-2xl border border-[#2D5A42]/10"
        >
          <div class="flex items-center gap-3">
            <span class="font-black text-amber-600 w-6">#{{ idx + 1 }}</span>
            <span class="font-bold text-[#1E3326]">{{ item.participantName }}</span>
          </div>
          <div class="text-right">
            <span class="text-[#2D5A42] font-black">{{ item.score }} / {{ item.questionCount }}</span>
            <span class="text-xs text-[#516b5d] font-semibold block">{{ item.durationSeconds }} сек.</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../../services/api';

const router = useRouter();
const stats = ref(null);

onMounted(async () => {
  try {
    const res = await api.get('/admin/stats');
    stats.value = res.data;
  } catch {
    router.push('/admin/login');
  }
});

async function logout() {
  await api.post('/admin/auth/logout');
  router.push('/admin/login');
}
</script>
