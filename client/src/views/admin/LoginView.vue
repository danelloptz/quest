<template>
  <div class="max-w-md mx-auto py-12 space-y-6">
    <div class="text-center space-y-2">
      <h1 class="text-2xl font-black text-[#1E3326]">Вход в панель организатора</h1>
      <p class="text-xs text-[#516b5d] font-bold uppercase tracking-wider">KARELIA 2026 ADMIN</p>
    </div>

    <form @submit.prevent="handleLogin" class="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white/90 shadow-xl shadow-[#2D5A42]/5 space-y-4">
      <div class="space-y-1">
        <label class="text-xs font-bold text-[#2D5A42]">Логин</label>
        <input
          v-model="login"
          type="text"
          required
          class="w-full bg-white border border-[#2D5A42]/20 rounded-2xl p-3 text-[#1E3326] font-semibold outline-none focus:border-[#2D5A42]"
        />
      </div>
      <div class="space-y-1">
        <label class="text-xs font-bold text-[#2D5A42]">Пароль</label>
        <input
          v-model="password"
          type="password"
          required
          class="w-full bg-white border border-[#2D5A42]/20 rounded-2xl p-3 text-[#1E3326] font-semibold outline-none focus:border-[#2D5A42]"
        />
      </div>

      <p v-if="error" class="text-rose-600 text-xs font-bold">{{ error }}</p>

      <button
        type="submit"
        :disabled="loading"
        class="w-full bg-[#2D5A42] hover:bg-[#1E3326] text-white font-extrabold py-3.5 rounded-2xl transition shadow-md"
      >
        {{ loading ? 'Вход...' : 'Войти' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../../services/api';

const router = useRouter();
const login = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

async function handleLogin() {
  error.value = '';
  loading.value = true;
  try {
    await api.post('/admin/auth/login', {
      login: login.value,
      password: password.value,
    });
    router.push('/admin');
  } catch (err) {
    error.value = err.response?.data?.error?.message || 'Ошибка авторизации';
  } finally {
    loading.value = false;
  }
}
</script>
