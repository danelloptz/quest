<template>
  <div v-if="loading" class="min-h-screen flex items-center justify-center text-[#073D2F] font-bold">
    <div class="flex items-center space-x-2 bg-white/80 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/90 shadow-lg">
      <svg class="animate-spin h-6 w-6 text-[#4B9A76]" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span class="text-base font-extrabold tracking-wide">Подготовка результатов...</span>
    </div>
  </div>

  <div
    v-else-if="result"
    class="relative min-h-screen w-full bg-[#F7F9F6] text-[#073D2F] font-sans overflow-x-hidden flex flex-col justify-between select-none py-6 px-4 sm:px-8 bg-cover bg-top bg-no-repeat"
    :style="{ backgroundImage: `url(${lastScreenBg})` }"
  >
    <!-- Background Fallback Layer (shown if bg asset is absent) -->
    <div class="absolute inset-0 pointer-events-none z-0 opacity-15 bg-gradient-to-b from-[#80E8DD]/30 via-transparent to-[#2D5A42]/20"></div>

    <!-- MAIN CONTAINER -->
    <div class="relative z-10 w-full max-w-[720px] mx-auto flex flex-col items-center space-y-5">

      <!-- 1. HEADER LOGO -->
       <div class="text-center mb-6 mt-6">
        <div class="relative inline-block">
          <div class="relative w-40 overflow-hidden">
            <img
              src="../assets/finish_logo.png"
              alt="Угадай игрока - Карелия 2026"
              class="w-full h-full object-contain filter drop-shadow-sm transition-all duration-300 hover:scale-105"
              @error="handleHeroLogoError"
              v-if="!heroLogoFailed"
            />
            <span v-else class="text-4xl">🏐</span>
          </div>
        </div>
        <h1 class="text-3xl font-black text-[#1E3326] mb-2 drop-shadow-xs font-['Montserrat'] scale-y-150 font-extrabold tracking-[0.12em]">
          KARJALA <span style="color: #516b5d;">2026</span>
        </h1>
        <div class="flex items-center justify-center space-x-3 my-3 max-w-xs mx-auto">
          <div class="h-[1.5px] flex-1 bg-gradient-to-r from-transparent via-[#516b5d]/40 to-[#516b5d]/80 rounded-full"></div>
          <span class="text-xs font-extrabold uppercase tracking-[0.2em] text-[#2D5A42] font-['Montserrat'] whitespace-nowrap">
            Угадай команду и игрока
          </span>
          <div class="h-[1.5px] flex-1 bg-gradient-to-l from-transparent via-[#516b5d]/40 to-[#516b5d]/80 rounded-full"></div>
        </div>
      </div>

      <!-- 2. INTRO / CONGRATULATIONS BLOCK -->
      <div class="text-center space-y-2 px-2">
        <h2 class="text-2xl sm:text-3xl font-[800] leading-[1.08] text-[#073D2F] uppercase tracking-tight">
          ТЫ ПОКАЗАЛ<br />ОТЛИЧНЫЙ РЕЗУЛЬТАТ!
        </h2>
        <p class="text-base sm:text-lg font-medium text-[#52796F] leading-snug">
          Спасибо за твоё участие<br />в конкурсе «Угадай игрока»!
        </p>
      </div>

      <!-- 3. STATS CARD -->
      <div class="w-full bg-white/94 backdrop-blur-xl border border-white/90 rounded-[32px] p-5 sm:p-6 shadow-xl shadow-[#073D2F]/5 relative overflow-hidden">
        <div class="grid grid-cols-2 relative items-center min-h-[160px]">
          
          <!-- Column 1: Correct Answers -->
          <div class="flex flex-col items-center justify-center text-center px-1">
            <div class="w-14 h-14 sm:w-16 sm:h-16 mb-2 flex items-center justify-center">
              <img
                src="../assets/answers.png"
                alt="Ответы"
                class="w-full h-full object-contain"
                @error="(e) => e.target.style.display='none'"
              />
            </div>
            <div class="text-3xl sm:text-4xl font-[800] text-[#073D2F] leading-none mb-1">
              {{ result.score }} / {{ result.questionCount }}
            </div>
            <div class="text-[11px] sm:text-xs font-[700] text-[#8795A1] uppercase tracking-wider leading-tight">
              ПРАВИЛЬНЫХ<br />ОТВЕТОВ
            </div>
          </div>

          <!-- Divider -->
          <div class="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 w-[1px] h-[140px] bg-[#D7E1DC]"></div>

          <!-- Column 2: Completion Time -->
          <div class="flex flex-col items-center justify-center text-center px-1">
            <div class="w-14 h-14 sm:w-16 sm:h-16 mb-2 flex items-center justify-center">
              <img
                src="../assets/timer.png"
                alt="Время"
                class="w-full h-full object-contain"
                @error="(e) => e.target.style.display='none'"
              />
            </div>
            <div class="text-3xl sm:text-4xl font-[800] text-[#101322] leading-none mb-1 tracking-tight">
              {{ formatTime(result.durationSeconds) }}
            </div>
            <div class="text-[11px] sm:text-xs font-[700] text-[#8795A1] uppercase tracking-wider leading-tight">
              ВРЕМЯ<br />РЕШЕНИЯ
            </div>
          </div>

        </div>
      </div>

      <!-- 4. RANKING CARD -->
      <div class="w-full bg-white/94 backdrop-blur-xl border border-white/90 rounded-[32px] p-6 sm:p-7 shadow-xl shadow-[#073D2F]/5 space-y-5">
        
        <!-- Header Title -->
        <h3 class="text-lg sm:text-xl font-[800] text-[#073D2F] uppercase tracking-wider text-left">
          ТВОЁ МЕСТО
        </h3>

        <!-- Place & Medal Composition -->
        <div class="flex items-center justify-start space-x-4 sm:space-x-6 py-1">
          <!-- Medal Image -->
          <div class="w-36 sm:w-44 h-28 sm:h-36 flex-shrink-0 flex items-center justify-center">
            <img
              :src="getMedalImage(userPlace)"
              :alt="userPlace + ' место'"
              class="max-w-full max-h-full object-contain"
              @error="handleMedalError"
            />
          </div>

          <!-- Place Text -->
          <div class="text-left space-y-1">
            <div class="text-3xl sm:text-5xl font-[800] text-[#073D2F] leading-none whitespace-nowrap">
              {{ userPlace }} место
            </div>
            <p class="text-sm sm:text-base font-normal text-[#8795A1] leading-tight">
              в общем рейтинге
            </p>
          </div>
        </div>

        <!-- Info Block 1: Realtime Updates -->
        <div class="bg-[#E9F5F1] rounded-[24px] p-4 sm:p-5 flex items-start space-x-3.5 border border-[#E0EFEA]">
          <div class="w-9 h-9 flex-shrink-0 text-[#438F70] mt-0.5">
            <!-- Chart / Analytics Icon -->
            <svg class="w-full h-full stroke-current fill-none" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
          </div>
          <p class="text-xs sm:text-sm font-normal text-[#567B70] leading-snug text-left">
            Твой рейтинг будет обновляться в режиме реального времени. Если следующие игроки дадут больше правильных ответов, они будут выше в рейтинге.
          </p>
        </div>

        <!-- Info Block 2: Rules -->
        <div class="bg-[#E9F5F1] rounded-[24px] p-4 sm:p-5 flex items-center space-x-3.5 border border-[#E0EFEA]">
          <div class="w-8 h-8 flex-shrink-0 text-[#438F70]">
            <!-- Info Icon -->
            <svg class="w-full h-full stroke-current fill-none" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </div>
          <p class="text-xs sm:text-sm font-normal text-[#567B70] leading-snug text-left">
            Рейтинг формируется по двум критериям: количество правильных ответов и скорость решения.
          </p>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';
import { getAttemptId } from '../services/storage';

import lastScreenBg from '../assets/last_screen_bg.png';
import emptyImg from '../assets/empty.png';

// Import image assets directly
import firstPlaceImg from '../assets/first_place.png';
import secondPlaceImg from '../assets/second_place.png';
import thirdPlaceImg from '../assets/third_place.png';

const router = useRouter();
const attemptId = getAttemptId();

const result = ref(null);
const loading = ref(true);
const logoFailed = ref(false);
const showBreakdown = ref(false);

const userPlace = computed(() => {
  return result.value?.place || -1;
});

const handleLogoError = () => {
  logoFailed.value = true;
};

const handleMedalError = (e) => {
    if (e.target.src !== emptyImg) {
        e.target.src = emptyImg;
    }
};

const getMedalImage = (place) => {
    if (place === 1) return firstPlaceImg;
    if (place === 2) return secondPlaceImg;
    if (place === 3) return thirdPlaceImg;
    return emptyImg;
};

onMounted(async () => {
  if (!attemptId) {
    router.push('/');
    return;
  }
  try {
    const res = await api.get(`/attempts/${attemptId}/result`);
    result.value = res.data;
  } catch (err) {
    router.push('/');
  } finally {
    loading.value = false;
  }
});

function formatTime(seconds) {
  if (!seconds && seconds !== 0) return '00:00';
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}
</script>
