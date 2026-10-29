<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-black text-[#1E3326]">Справочник игроков</h1>
      <router-link to="/admin" class="text-xs font-bold text-[#516b5d] hover:underline">← Назад</router-link>
    </div>

    <!-- Create Player Form -->
    <form @submit.prevent="savePlayer" class="bg-white/80 p-4 rounded-2xl border border-white grid grid-cols-1 sm:grid-cols-3 gap-3 shadow-xs">
      <input v-model="firstName" type="text" placeholder="Имя" required class="bg-white border border-[#2D5A42]/20 rounded-xl px-4 py-2 text-[#1E3326] font-semibold" />
      <input v-model="lastName" type="text" placeholder="Фамилия" required class="bg-white border border-[#2D5A42]/20 rounded-xl px-4 py-2 text-[#1E3326] font-semibold" />
      <select v-model="selectedTeamId" required class="bg-white border border-[#2D5A42]/20 rounded-xl px-4 py-2 text-[#1E3326] font-semibold">
        <option value="" disabled>Выберите команду</option>
        <option v-for="t in teams" :key="t.id" :value="t.id">{{ t.name }}</option>
      </select>
      <button type="submit" class="sm:col-span-3 bg-[#2D5A42] hover:bg-[#1E3326] text-white font-extrabold py-2.5 rounded-xl text-sm">
        Добавить игрока
      </button>
    </form>

    <!-- Table -->
    <div class="bg-white/80 backdrop-blur-xl rounded-2xl border border-white overflow-hidden shadow-xs">
      <table class="w-full text-left text-sm text-[#1E3326]">
        <thead class="bg-[#F7F9F6] text-[#516b5d] uppercase text-[10px] font-black tracking-wider border-b border-[#2D5A42]/10">
          <tr>
            <th class="p-4">Имя Фамилия</th>
            <th class="p-4">Команда</th>
            <th class="p-4 text-right">Действия</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#2D5A42]/10 font-semibold">
          <tr v-for="p in players" :key="p.id">
            <td class="p-4 font-extrabold">{{ p.firstName }} {{ p.lastName }}</td>
            <td class="p-4">{{ p.team?.name }}</td>
            <td class="p-4 text-right">
              <button @click="deletePlayer(p.id)" class="text-xs font-bold text-rose-700 hover:underline">Удалить</button>
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

const players = ref([]);
const teams = ref([]);
const firstName = ref('');
const lastName = ref('');
const selectedTeamId = ref('');

onMounted(async () => {
  const tRes = await api.get('/admin/teams');
  teams.value = tRes.data.teams;
  fetchPlayers();
});

async function fetchPlayers() {
  const pRes = await api.get('/admin/players');
  players.value = pRes.data.players;
}

async function savePlayer() {
  await api.post('/admin/players', {
    firstName: firstName.value,
    lastName: lastName.value,
    teamId: selectedTeamId.value,
  });
  firstName.value = '';
  lastName.value = '';
  fetchPlayers();
}

async function deletePlayer(id) {
  if (confirm('Удалить игрока?')) {
    await api.delete(`/admin/players/${id}`);
    fetchPlayers();
  }
}
</script>