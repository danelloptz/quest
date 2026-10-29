<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-black text-[#1E3326]">Управление вопросами</h1>
      <router-link to="/admin" class="text-xs font-bold text-[#516b5d] hover:underline">← Назад</router-link>
    </div>

    <!-- Create Question Form -->
    <div class="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white space-y-4 shadow-xs">
      <h3 class="text-lg font-black text-[#1E3326]">Добавить новый вопрос</h3>
      <div class="flex gap-4">
        <select v-model="form.type" class="bg-white border border-[#2D5A42]/20 rounded-xl px-4 py-2 text-[#1E3326] font-semibold text-sm">
          <option value="TEAM_SELECTION">1. Выбор команды</option>
          <option value="TEXT_INPUT">2. Текстовый ответ</option>
          <option value="MULTIPLE_CHOICE">3. Выбор из 4 вариантов</option>
        </select>
      </div>

      <div class="space-y-3">
        <input v-model="form.text" type="text" placeholder="Текст вопроса" class="w-full bg-white border border-[#2D5A42]/20 rounded-xl p-3 text-[#1E3326] font-semibold" />

        <!-- TEAM SELECTION -->
        <div v-if="form.type === 'TEAM_SELECTION'" class="space-y-2">
          <label class="text-xs font-bold text-[#516b5d]">Правильная команда:</label>
          <select v-model="form.correctTeamId" class="w-full bg-white border border-[#2D5A42]/20 rounded-xl p-3 text-[#1E3326] font-semibold">
            <option v-for="t in teams" :key="t.id" :value="t.id">{{ t.name }}</option>
          </select>
        </div>

        <!-- TEXT INPUT -->
        <div v-if="form.type === 'TEXT_INPUT'" class="space-y-2">
          <label class="text-xs font-bold text-[#516b5d]">Допустимые варианты ответа (по одному в строке):</label>
          <textarea v-model="textAnswersRaw" rows="3" class="w-full bg-white border border-[#2D5A42]/20 rounded-xl p-3 text-[#1E3326] font-semibold"></textarea>
        </div>

        <!-- MULTIPLE CHOICE -->
        <div v-if="form.type === 'MULTIPLE_CHOICE'" class="space-y-2">
          <label class="text-xs font-bold text-[#516b5d]">4 варианта ответа (отметьте радиокнопкой правильный):</label>
          <div v-for="(opt, idx) in form.options" :key="idx" class="flex gap-2 items-center">
            <input type="radio" :name="'correctOpt'" :checked="opt.isCorrect" @change="setCorrectOption(idx)" />
            <input v-model="opt.text" type="text" :placeholder="`Вариант ${idx + 1}`" class="flex-grow bg-white border border-[#2D5A42]/20 rounded-xl p-2 text-[#1E3326] font-semibold text-sm" />
          </div>
        </div>

        <button @click="saveQuestion" class="bg-[#2D5A42] hover:bg-[#1E3326] text-white font-extrabold px-6 py-2.5 rounded-xl text-sm">
          Сохранить вопрос
        </button>
      </div>
    </div>

    <!-- Question List -->
    <div class="space-y-3">
      <div v-for="q in questions" :key="q.id" class="bg-white/80 p-4 rounded-2xl border border-white flex justify-between items-start gap-4 shadow-xs">
        <div>
          <span class="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#80E8DD]/20 text-[#2D5A42]">
            {{ q.type }}
          </span>
          <p class="text-[#1E3326] font-bold mt-1.5">{{ q.text }}</p>
        </div>
        <button @click="deleteQuestion(q.id)" class="text-xs font-bold text-rose-700 hover:underline">Удалить</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../../services/api';

const questions = ref([]);
const teams = ref([]);
const textAnswersRaw = ref('');

const form = ref({
  type: 'TEAM_SELECTION',
  text: '',
  correctTeamId: '',
  options: [
    { text: '', isCorrect: true },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ],
});

onMounted(async () => {
  const tRes = await api.get('/admin/teams');
  teams.value = tRes.data.teams;
  if (teams.value.length > 0) form.value.correctTeamId = teams.value[0].id;
  fetchQuestions();
});

async function fetchQuestions() {
  const res = await api.get('/admin/questions');
  questions.value = res.data.questions;
}

function setCorrectOption(idx) {
  form.value.options.forEach((o, i) => (o.isCorrect = i === idx));
}

async function saveQuestion() {
  const payload = {
    type: form.value.type,
    text: form.value.text,
    correctTeamId: form.value.correctTeamId,
    acceptedAnswers: textAnswersRaw.value.split('\n').filter((s) => s.trim()),
    options: form.value.options,
  };

  await api.post('/admin/questions', payload);
  form.value.text = '';
  textAnswersRaw.value = '';
  fetchQuestions();
}

async function deleteQuestion(id) {
  if (confirm('Удалить вопрос?')) {
    await api.delete(`/admin/questions/${id}`);
    fetchQuestions();
  }
}
</script>