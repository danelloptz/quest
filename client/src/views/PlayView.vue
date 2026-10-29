
<template>
    <div class="relative min-h-screen bg-[#F7F9F6] text-[#1E3326] flex flex-col p-4 overflow-hidden select-none font-sans">
        <!-- Фон в стиле HomeView -->
        <div class="absolute inset-0 pointer-events-none overflow-hidden z-0">
            <img
                v-if="!bgFailed"
                src="../assets/background.png"
                alt=""
                class="absolute inset-0 w-full h-full object-cover object-center"
                @error="handleBgError"
            />

            <div v-else class="absolute inset-0">
                <div
                    class="absolute -top-32 left-1/2 -translate-x-1/2 w-[140%] h-[500px] rounded-[100%] bg-gradient-to-br from-[#80E8DD]/20 via-[#B0A1EC]/25 to-[#E6A0D4]/20 blur-3xl"
                ></div>
                <div class="absolute top-20 -left-20 w-72 h-72 rounded-full bg-[#68D8D6]/20 blur-3xl"></div>
                <div class="absolute top-0 -right-20 w-80 h-80 rounded-full bg-[#B0A1EC]/25 blur-3xl"></div>
            </div>

            <div class="absolute inset-0 bg-[#F7F9F6]/40"></div>
            <div class="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#1E3326_1px,transparent_1px)] [background-size:16px_16px]"></div>

            <div class="absolute -top-24 left-1/2 -translate-x-1/2 w-[420px] h-[300px] rounded-full bg-[#80E8DD]/20 blur-3xl"></div>
        </div>

        <!-- Шапка -->
        <header class="relative z-10 max-w-xl w-full mx-auto flex items-center justify-between py-2">
            <div class="flex items-center gap-3">
                <img
                    src="../assets/logo.png"
                    alt="Карелия 2026"
                    class="w-11 h-11 object-contain drop-shadow-sm"
                    @error="(e) => e.target.style.display = 'none'"
                />
                <div>
                    <p class="text-xs font-black tracking-[0.16em] text-[#2D5A42]">
                        KARJALA 2026
                    </p>
                    <p class="text-xs font-medium text-[#5A7365]">
                        Волейбольная викторина
                    </p>
                </div>
            </div>

            <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 border border-[#2D5A42]/10 backdrop-blur-md shadow-sm">
                <span class="w-2 h-2 rounded-full bg-[#80CDBA]"></span>
                <span class="text-xs font-bold text-[#2D5A42]">Игра</span>
            </div>
        </header>

        <main class="relative z-10 max-w-md w-full mx-auto flex-1 flex flex-col py-6">
            <!-- Загрузка -->
            <div
                v-if="loading"
                class="bg-white/80 backdrop-blur-xl border border-white/90 rounded-3xl p-8 shadow-xl shadow-[#2D5A42]/5 text-center"
            >
                <div class="relative w-16 h-16 mx-auto mb-5">
                    <div class="absolute inset-0 rounded-full border-4 border-[#2D5A42]/10"></div>
                    <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-[#2D5A42] animate-spin"></div>
                    <div class="absolute inset-0 flex items-center justify-center text-xl">🏐</div>
                </div>

                <h2 class="text-lg font-black text-[#1E3326]">
                    Загружаем вопросы
                </h2>
                <p class="text-sm text-[#5A7365] mt-2">
                    Совсем скоро можно будет проверить свои знания!
                </p>

                <div class="mt-6 space-y-3">
                    <div class="h-3 rounded-full bg-[#2D5A42]/10 animate-pulse"></div>
                    <div class="h-3 w-4/5 mx-auto rounded-full bg-[#2D5A42]/10 animate-pulse"></div>
                </div>
            </div>

            <!-- Ошибка загрузки -->
            <div
                v-else-if="error"
                class="bg-white/85 backdrop-blur-xl border border-rose-100 p-7 rounded-3xl shadow-xl shadow-[#2D5A42]/5 text-center"
            >
                <div class="w-14 h-14 mx-auto mb-4 rounded-2xl bg-rose-50 flex items-center justify-center text-2xl">
                    !
                </div>

                <h2 class="text-xl font-black text-[#1E3326] mb-2">
                    Не получилось загрузить вопросы
                </h2>

                <p class="text-sm text-rose-600 font-medium leading-relaxed">
                    {{ error }}
                </p>

                <button
                    @click="fetchQuestions"
                    type="button"
                    class="mt-6 w-full py-3.5 px-5 rounded-2xl bg-[#6d4db8] hover:bg-[#5960b3] text-white font-extrabold shadow-lg shadow-[#686fc3]/20 active:scale-[0.98] transition-all"
                >
                    Повторить загрузку
                    <span class="ml-1">↻</span>
                </button>
            </div>

            <!-- Текущий вопрос -->
            <div v-else-if="currentQuestion" class="space-y-5">
                <!-- Заголовок игры -->
                <!-- <div class="text-center pt-2 pb-1">
                    <img
                        src="../assets/tree.png"
                        alt=""
                        class="w-14 h-7 object-contain mx-auto mb-3 opacity-80"
                        @error="(e) => e.target.style.display = 'none'"
                    />

                    <p class="text-[10px] font-black uppercase tracking-[0.24em] text-[#5A7365] mb-2">
                        Карелия · Волейбол · 2026
                    </p>

                    <h1 class="text-2xl font-black tracking-tight text-[#1E3326]">
                        Угадай команду
                        <span class="text-[#6d4db8]">и игрока</span>
                    </h1>
                </div> -->

                <!-- Прогресс -->
                <section class="bg-white/75 backdrop-blur-xl border border-white/90 rounded-3xl px-5 py-4 shadow-lg shadow-[#2D5A42]/5">
                    <div class="flex justify-between items-center gap-3 mb-3">
                        <div>
                            <p class="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#5A7365]">
                                Твой прогресс
                            </p>
                            <p class="text-sm font-black text-[#1E3326] mt-0.5">
                                Вопрос {{ currentIndex + 1 }}
                                <span class="font-semibold text-[#8EA396]">
                                    из {{ questions.length }}
                                </span>
                            </p>
                        </div>

                        <div class="w-12 h-12 rounded-2xl bg-[#80E8DD]/20 border border-[#80E8DD]/40 flex items-center justify-center">
                            <span class="text-sm font-black text-[#2D5A42]">
                                {{ Math.round(((currentIndex + 1) / questions.length) * 100) }}%
                            </span>
                        </div>
                    </div>

                    <div class="w-full bg-[#2D5A42]/10 rounded-full h-2.5 overflow-hidden">
                        <div
                            class="bg-gradient-to-r from-[#2D5A42] via-[#68D8D6] to-[#B0A1EC] h-full rounded-full transition-all duration-500"
                            :style="{ width: `${((currentIndex + 1) / questions.length) * 100}%` }"
                        ></div>
                    </div>

                    <!-- <div class="flex justify-between mt-2 text-[10px] font-bold text-[#8EA396]">
                        <span>Начало</span>
                        <span>Финиш</span>
                    </div> -->
                </section>

                <!-- Карточка вопроса -->
                <section class="bg-white/85 backdrop-blur-xl border border-white/90 p-5 sm:p-6 rounded-3xl shadow-xl shadow-[#2D5A42]/5 relative overflow-hidden">
                    <div class="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br from-[#B0A1EC]/20 to-[#80E8DD]/20 blur-2xl pointer-events-none"></div>

                    <div class="relative">
                        <div class="flex items-center gap-2 mb-4">
                            <!-- <div class="w-9 h-9 rounded-xl bg-[#80E8DD]/20 border border-[#80E8DD]/40 flex items-center justify-center text-lg">
                                ✦
                            </div> -->

                            <span class="inline-flex items-center text-[10px] sm:text-xs font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-full bg-[#80E8DD]/20 text-[#2D5A42] border border-[#80E8DD]/40">
                                {{ getTypeName(currentQuestion.type) }}
                            </span>
                        </div>

                        <h2 class="text-xl sm:text-2xl font-black text-[#1E3326] leading-snug">
                            {{ currentQuestion.text }}
                        </h2>

                        <div class="h-px bg-gradient-to-r from-[#2D5A42]/20 via-[#80E8DD]/50 to-transparent my-5"></div>

                        <!-- Выбор команды -->
                        <TeamSelector
                            v-if="currentQuestion.type === 'TEAM_SELECTION'"
                            :teams="currentQuestion.options"
                            :selectedId="tempAnswers[currentQuestion.questionId]?.selectedTeamId"
                            @select="(id) => updateAnswer({ selectedTeamId: id })"
                        />

                        <!-- Текстовый ответ -->
                        <TextAnswerInput
                            v-else-if="currentQuestion.type === 'TEXT_INPUT'"
                            :modelValue="tempAnswers[currentQuestion.questionId]?.textAnswer || ''"
                            @update:modelValue="(val) => updateAnswer({ textAnswer: val })"
                        />

                        <!-- Выбор из четырёх вариантов -->
                        <MultipleChoiceSelector
                            v-else-if="currentQuestion.type === 'MULTIPLE_CHOICE'"
                            :options="currentQuestion.options"
                            :selectedId="tempAnswers[currentQuestion.questionId]?.selectedOptionId"
                            @select="(id) => updateAnswer({ selectedOptionId: id })"
                        />
                    </div>
                </section>

                <!-- Навигация -->
                <section class="bg-white/65 backdrop-blur-xl border border-white/90 p-3 rounded-3xl shadow-lg shadow-[#2D5A42]/5">
                    <div class="flex items-center justify-between gap-3">
                        <button
                            @click="prevQuestion"
                            :disabled="currentIndex === 0 || saving"
                            type="button"
                            class="min-h-[50px] px-4 sm:px-5 rounded-2xl border border-[#2D5A42]/20 bg-white/60 text-[#2D5A42] font-extrabold hover:bg-[#80E8DD]/15 disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
                        >
                            <span class="mr-1">←</span>
                            Назад
                        </button>

                        <!-- <div class="text-center min-w-0">
                            <p class="text-[9px] font-extrabold uppercase tracking-wider text-[#8EA396]">
                                Твой ответ
                            </p>
                            <p
                                class="text-xs font-bold mt-1"
                                :class="hasAnswer(currentQuestion.questionId) ? 'text-[#2D5A42]' : 'text-[#8EA396]'"
                            >
                                {{ hasAnswer(currentQuestion.questionId) ? 'Выбран' : 'Не выбран' }}
                            </p>
                        </div> -->

                        <button
                            v-if="currentIndex < questions.length - 1"
                            @click="nextQuestion"
                            :disabled="!hasAnswer(currentQuestion.questionId) || saving"
                            type="button"
                            class="min-h-[50px] px-4 sm:px-5 rounded-2xl bg-[#6d4db8] hover:bg-[#5960b3] text-white font-extrabold shadow-lg shadow-[#686fc3]/25 disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
                        >
                            {{ saving ? 'Сохр...' : 'Дальше' }}
                            <span v-if="!saving" class="ml-1">→</span>
                        </button>

                        <button
                            v-else
                            @click="finishGame"
                            :disabled="!hasAnswer(currentQuestion.questionId) || saving"
                            type="button"
                            class="min-h-[50px] px-4 sm:px-5 rounded-2xl bg-[#6d4db8] hover:bg-[#5960b3] text-white font-extrabold shadow-lg shadow-[#686fc3]/25 disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
                        >
                            {{ saving ? '...' : 'Завершить' }}
                            <span v-if="!saving" class="ml-1">✦</span>
                        </button>
                    </div>
                </section>

                <p class="text-center text-[10px] font-semibold tracking-wide text-[#5A7365]/80">
                    Каждый вопрос приближает тебя к финишу
                </p>
            </div>

            <!-- Вопросы не найдены -->
            <div
                v-else
                class="bg-white/85 backdrop-blur-xl border border-white/90 p-7 rounded-3xl shadow-xl shadow-[#2D5A42]/5 text-center"
            >
                <div class="text-4xl mb-4">🏐</div>
                <h2 class="text-xl font-black text-[#1E3326]">
                    Пока нет вопросов
                </h2>
                <p class="text-sm text-[#5A7365] mt-2">
                    Попробуй загрузить их ещё раз.
                </p>
                <button
                    @click="fetchQuestions"
                    type="button"
                    class="mt-5 px-5 py-3 rounded-2xl bg-[#6d4db8] text-white font-bold"
                >
                    Повторить
                </button>
            </div>
        </main>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';
import { getAttemptId } from '../services/storage';
import TeamSelector from '../components/game/TeamSelector.vue';
import TextAnswerInput from '../components/game/TextAnswerInput.vue';
import MultipleChoiceSelector from '../components/game/MultipleChoiceSelector.vue';

const router = useRouter();
const attemptId = getAttemptId();

const questions = ref([]);
const currentIndex = ref(0);
const tempAnswers = ref({});
const loading = ref(true);
const saving = ref(false);
const error = ref('');

const bgFailed = ref(false);

const currentQuestion = computed(() => questions.value[currentIndex.value]);

function handleBgError() {
    bgFailed.value = true;
}

onMounted(() => {
    if (!attemptId) {
        router.push('/');
        return;
    }

    if (!document.getElementById('karelia-custom-fonts')) {
        const link = document.createElement('link');
        link.id = 'karelia-custom-fonts';
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@900&family=Roboto+Slab:wght@900&display=swap';
        document.head.appendChild(link);
    }

    fetchQuestions();
});

async function fetchQuestions() {
    loading.value = true;
    error.value = '';

    try {
        const res = await api.get(`/attempts/${attemptId}/questions`);
        questions.value = res.data.questions;

        questions.value.forEach((q) => {
            if (q.userAnswer) {
                tempAnswers.value[q.questionId] = { ...q.userAnswer };
            }
        });
    } catch (err) {
        error.value = err.response?.data?.error?.message || 'Не удалось загрузить вопросы.';
    } finally {
        loading.value = false;
    }
}

function getTypeName(type) {
    if (type === 'TEAM_SELECTION') return 'Выбор команды';
    if (type === 'TEXT_INPUT') return 'Текстовый ответ';
    if (type === 'MULTIPLE_CHOICE') return 'Выбор из 4 вариантов';
    return '';
}

function updateAnswer(payload) {
    const qId = currentQuestion.value.questionId;
    tempAnswers.value[qId] = { ...tempAnswers.value[qId], ...payload };
}

function hasAnswer(qId) {
    const ans = tempAnswers.value[qId];
    if (!ans) return false;

    return !!(
        ans.selectedTeamId ||
        (ans.textAnswer && ans.textAnswer.trim()) ||
        ans.selectedOptionId
    );
}

async function saveCurrentAnswer() {
    const q = currentQuestion.value;
    const ans = tempAnswers.value[q.questionId];

    saving.value = true;

    try {
        await api.put(`/attempts/${attemptId}/answers/${q.questionId}`, {
            type: q.type,
            teamId: ans.selectedTeamId,
            textAnswer: ans.textAnswer,
            optionId: ans.selectedOptionId,
        });
    } catch (err) {
        alert(err.response?.data?.error?.message || 'Ошибка сохранения ответа');
        throw err;
    } finally {
        saving.value = false;
    }
}

async function nextQuestion() {
    try {
        await saveCurrentAnswer();

        if (currentIndex.value < questions.value.length - 1) {
            currentIndex.value++;
        }
    } catch {}
}

function prevQuestion() {
    if (currentIndex.value > 0) {
        currentIndex.value--;
    }
}

async function finishGame() {
    try {
        await saveCurrentAnswer();
        await api.post(`/attempts/${attemptId}/finish`);
        router.push('/result');
    } catch {}
}
</script>
