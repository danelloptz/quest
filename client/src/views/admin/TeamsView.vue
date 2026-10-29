<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-black text-[#1E3326]">Управление командами</h1>
      <router-link to="/admin" class="text-xs font-bold text-[#516b5d] hover:underline">← Назад</router-link>
    </div>

    <!-- Form -->
    <form @submit.prevent="saveTeam" class="bg-white/80 p-4 rounded-2xl border border-white flex gap-3 shadow-xs">
      <input
        v-model="newTeamName"
        type="text"
        placeholder="Название команды"
        required
        class="flex-grow bg-white border border-[#2D5A42]/20 rounded-xl px-4 py-2 text-[#1E3326] font-semibold outline-none"
      />
      <button type="submit" class="bg-[#2D5A42] hover:bg-[#1E3326] text-white font-extrabold px-5 py-2 rounded-xl text-sm">
        Добавить
      </button>
    </form>

    <!-- List -->
    <div class="bg-white/80 backdrop-blur-xl rounded-2xl border border-white overflow-hidden shadow-xs">
      <table class="w-full text-left text-sm text-[#1E3326]">
        <thead class="bg-[#F7F9F6] text-[#516b5d] uppercase text-[10px] font-black tracking-wider border-b border-[#2D5A42]/10">
          <tr>
            <th class="p-4">Название</th>
            <th class="p-4">Статус</th>
            <th class="p-4 text-right">Действия</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#2D5A42]/10 font-semibold">
          <tr v-for="team in teams" :key="team.id">
            <td class="p-4 font-extrabold">{{ team.name }}</td>
            <td class="p-4">
              <span :class="team.isActive ? 'text-[#2D5A42]' : 'text-[#516b5d]'">
                {{ team.isActive ? 'Активна' : 'Неактивна' }}
              </span>
            </td>
            <td class="p-4 text-right space-x-2">
              <button @click="toggleActive(team)" class="text-xs font-bold text-[#2D5A42] hover:underline">
                {{ team.isActive ? 'Деактивировать' : 'Активировать' }}
              </button>
              <button @click="deleteTeam(team.id)" class="text-xs font-bold text-rose-700 hover:underline">Удалить</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../../services/api';

const teams = ref([]);
const newTeamName = ref('');

onMounted(fetchTeams);

async function fetchTeams() {
  const res = await api.get('/admin/teams');
  teams.value = res.data.teams;
}

async function saveTeam() {
  if (!newTeamName.value.trim()) return;
  await api.post('/admin/teams', { name: newTeamName.value });
  newTeamName.value = '';
  fetchTeams();
}

async function toggleActive(team) {
  await api.put(`/admin/teams/${team.id}`, { isActive: !team.isActive });
  fetchTeams();
}

async function deleteTeam(id) {
  if (confirm('Удалить команду?')) {
    await api.delete(`/admin/teams/${id}`);
    fetchTeams();
  }
}
</script>
