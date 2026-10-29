<template>
  <div class="relative min-h-screen bg-[#F7F9F6] text-[#1E3326] flex flex-col justify-between p-4 overflow-hidden select-none font-sans">
    
    <!-- BACKGROUND SCENE: background.png + Northern Lights overlay -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden z-0">
      
      <!-- Real background image from project assets with fallback handling -->
      <img
        src="../assets/background.png"
        alt="Карелия Фон"
        class="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700"
        @error="handleBgError"
        v-if="!bgFailed"
      />

      <!-- Fallback SVG Vector Background (shown if image missing/loading) -->
      <div v-else class="absolute inset-0">
        <div class="absolute -top-32 left-1/2 -translate-x-1/2 w-[140%] h-[500px] rounded-[100%] bg-gradient-to-br from-[#80E8DD]/20 via-[#B0A1EC]/25 via-[#E6A0D4]/20 to-transparent blur-3xl transform -rotate-6 animate-pulse" style="animation-duration: 8s;"></div>
        <div class="absolute -top-10 -right-20 w-[350px] h-[350px] rounded-full bg-gradient-to-tr from-[#A88BEB]/30 to-[#F8A4D8]/20 blur-2xl"></div>
        <div class="absolute top-20 -left-20 w-[300px] h-[300px] rounded-full bg-gradient-to-br from-[#68D8D6]/25 to-[#9B5DE5]/15 blur-2xl"></div>

        <div class="absolute bottom-16 inset-x-0 h-48 opacity-25 flex items-end">
          <svg viewBox="0 0 1440 320" class="w-full h-full preserve-3d" preserveAspectRatio="none">
            <path fill="#2D5A42" fill-opacity="0.5" d="M0,224L120,192C240,160,480,96,720,128C960,160,1200,224,1320,256L1440,288L1440,320L0,320Z"></path>
            <path fill="#1E3326" fill-opacity="0.8" d="M0,288L180,240C360,192,540,224,720,208C900,192,1260,240,1350,256L1440,272L1440,320L0,320Z"></path>
          </svg>
        </div>

        <div class="absolute bottom-12 inset-x-0 h-36 flex justify-between items-end opacity-40 px-2 sm:px-10">
          <svg class="h-28 sm:h-36 w-auto text-[#1E3326] fill-current" viewBox="0 0 100 120">
            <polygon points="50,0 20,40 35,40 10,75 30,75 0,110 100,110 70,75 90,75 65,40 80,40" />
          </svg>
          <svg class="h-20 sm:h-28 w-auto text-[#1E3326] fill-current opacity-80" viewBox="0 0 100 120">
            <polygon points="50,0 20,40 35,40 10,75 30,75 0,110 100,110 70,75 90,75 65,40 80,40" />
          </svg>
        </div>
      </div>

      <!-- Subtle Paper / Watercolor Texture Layer -->
      <div class="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#1E3326_1px,transparent_1px)] [background-size:16px_16px]"></div>
    </div>

    <!-- HEADER / UPPER PANEL -->
    <header class="relative z-10 w-full max-w-xl mx-auto pt-3 pb-2 px-2 flex items-center justify-end">
      <div class="text-right">
        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-white/70 text-[#2D5A42] border border-[#2D5A42]/10 backdrop-blur-md shadow-xs">
          Зрительский этап
        </span>
      </div>
    </header>

    <!-- MAIN CONTENT CARD -->
    <main class="relative z-10 max-w-md w-full mx-auto my-auto py-4">
      
      <!-- Center Hero Logo Emblem & Title -->
      <div class="text-center mb-6 mt-6">
        <div class="relative inline-block">
          <div class="relative w-32 h-32 overflow-hidden">
            <img
              src="../assets/logo.png"
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
        <p class="text-sm text-[#4E6657] font-medium max-w-xs mx-auto leading-relaxed">
          Проверь, насколько хорошо ты знаешь участников волейбольного турнира в Карелии!
        </p>
      </div>

      <!-- ACTIVE ATTEMPT CARD -->
      <div 
        v-if="existingAttempt" 
        class="bg-white/80 backdrop-blur-xl border border-white/90 p-6 rounded-3xl mb-6 text-center shadow-xl shadow-[#2D5A42]/5 relative overflow-hidden"
      >
        <div class="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br from-[#B0A1EC]/30 to-[#80E8DD]/30 rounded-full blur-xl"></div>
        
        <!-- <p class="text-base font-extrabold text-[#1E3326] mb-1 flex items-center justify-center">
          <img 
            src="../assets/tree.png" 
            alt="Ёлочка" 
            class="w-10 h-5 object-contain inline-block opacity-85" 
            @error="(e) => e.target.style.display = 'none'"
          />
           <span>Здравствуйте, {{ existingAttempt.participantName }}!</span> 
          <img 
            src="../assets/tree.png" 
            alt="Ёлочка" 
            class="w-10 h-5 object-contain inline-block opacity-85 -scale-x-100" 
            @error="(e) => e.target.style.display = 'none'"
          />
        </p>
         -->
        <div v-if="existingAttempt.status === 'IN_PROGRESS'">
          <p class="text-xs text-[#5A7365] mb-5 font-medium">
            У вас есть незавершенная игра (Отвечено: <span class="text-[#2D5A42] font-extrabold">{{ existingAttempt.answeredCount }}</span> из {{ existingAttempt.questionCount }}).
          </p>
          <button
            @click="continueGame"
            type="button"
            class="w-full py-4 bg-[#6d4db8] hover:bg-[#5960b3] text-white font-bold rounded-2xl min-h-[54px] shadow-lg shadow-[#686fc3]/25 active:scale-[0.98] transition-all duration-200 flex items-center justify-center space-x-2 group"
          >
            <span>Продолжить игру</span>
            <span class="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>

        <div v-else>
            <p class="text-base font-extrabold text-[#1E3326] mb-5 flex items-center justify-center">
          <img 
            src="../assets/tree.png" 
            alt="Ёлочка" 
            class="w-10 h-5 object-contain inline-block opacity-85" 
            @error="(e) => e.target.style.display = 'none'"
          />
          <p class="text-xs text-[#5A7365] font-medium">Вы уже успешно прошли конкурс!</p>

          <!-- <span>Здравствуйте, {{ existingAttempt.participantName }}!</span> -->
          <img 
            src="../assets/tree.png" 
            alt="Ёлочка" 
            class="w-10 h-5 object-contain inline-block opacity-85 -scale-x-100" 
            @error="(e) => e.target.style.display = 'none'"
          />
        </p>
          <button
            @click="viewResult"
            type="button"
            class="w-full py-4 bg-[#6d4db8] hover:bg-[#5960b3] text-white font-bold rounded-2xl min-h-[54px] shadow-lg shadow-[#2D5A42]/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <span>Посмотреть результат</span>
          </button>
        </div>
      </div>

      <!-- NEW GAME FORM -->
      <form 
        v-else 
        @submit.prevent="startNewGame" 
        class="bg-white/85 backdrop-blur-xl p-6 sm:p-7 rounded-3xl border border-white/90 shadow-xl shadow-[#2D5A42]/5 space-y-5 relative"
      >
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-[#3D5647] mb-2 pl-1">
            Как тебя зовут?
          </label>
          <div class="relative">
            <input
              v-model="name"
              type="text"
              placeholder="Введите ваше имя"
              required
              maxlength="50"
              class="w-full px-4 py-3.5 rounded-2xl bg-[#F4F7F4]/80 border border-[#D5E0D8] text-[#1E3326] placeholder-[#8EA396] font-medium focus:outline-none focus:ring-2 focus:ring-[#80E8DD] focus:border-[#2D5A42] min-h-[52px] transition-all duration-200"
            />
            <div class="absolute right-3.5 top-1/2 -translate-y-1/2 text-lg opacity-40 pointer-events-none">
              🌲
            </div>
          </div>
          <span v-if="error" class="text-xs text-rose-500 font-semibold mt-1.5 pl-1 block">
            {{ error }}
          </span>
        </div>

        <button
          :disabled="loading"
          type="submit"
          class="w-full py-4 bg-[#6d4db8] hover:bg-[#5960b3] hover:opacity-95 text-white font-bold rounded-2xl min-h-[56px] shadow-lg shadow-[#9B5DE5]/30 transition-all duration-200 active:scale-[0.98] flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <span v-if="loading" class="inline-flex items-center">
            <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Создание...
          </span>
          <span v-else class="flex items-center font-extrabold text-base tracking-wide">
            <span>Начать игру</span>
            <span class="ml-1.5">✦</span>
          </span>
        </button>
      </form>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';
import { getParticipantToken, getAttemptId, setAttemptId } from '../services/storage';

const router = useRouter();

const name = ref('');
const error = ref('');
const loading = ref(false);
const existingAttempt = ref(null);

// Fallback visual state variables
const bgFailed = ref(false);
const heroLogoFailed = ref(false);

const handleBgError = () => {
  bgFailed.value = true;
};

const handleHeroLogoError = () => {
  heroLogoFailed.value = true;
};

onMounted(async () => {
  if (!document.getElementById('karelia-custom-fonts')) {
    const link = document.createElement('link');
    link.id = 'karelia-custom-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@900&family=Roboto+Slab:wght@900&display=swap';
    document.head.appendChild(link);
  }

  const attemptId = getAttemptId();
  if (attemptId) {
    try {
      const res = await api.get(`/attempts/${attemptId}`);
      existingAttempt.value = res.data;
    } catch {
      existingAttempt.value = null;
    }
  }
});

async function startNewGame() {
  if (!name.value || name.value.trim().length < 2) {
    error.value = 'Введите имя не менее 2 символов';
    return;
  }

  error.value = '';
  loading.value = true;

  try {
    const token = getParticipantToken();
    const res = await api.post('/attempts', {
      participantToken: token,
      name: name.value.trim(),
    });

    setAttemptId(res.data.attempt.id);
    if (res.data.attempt.status === 'COMPLETED') {
      router.push('/result');
    } else {
      router.push('/play');
    }
  } catch (err) {
    error.value = err.response?.data?.error?.message || 'Не удалось начать игру. Попробуйте еще раз.';
  } finally {
    loading.value = false;
  }
}

function continueGame() {
  router.push('/play');
}

function viewResult() {
  router.push('/result');
}
</script>