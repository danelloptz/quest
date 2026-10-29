<template>
  <header class="relative z-20 w-full max-w-xl mx-auto pt-3 pb-2 px-2 flex items-center justify-between">
    <router-link to="/" class="flex items-center space-x-2 text-[#1E3326] hover:opacity-80 transition">
      <span class="text-xl">🏐</span>
      <span class="font-black text-sm uppercase tracking-widest text-[#2D5A42]">Karjala 2026</span>
    </router-link>

    <div class="flex items-center gap-3">
      <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/70 text-[#2D5A42] border border-[#2D5A42]/15 backdrop-blur-md shadow-xs">
        Зрительский этап
      </span>
      <router-link to="/admin" class="text-xs font-bold text-[#516b5d] hover:text-[#1E3326] transition">
        Админка
      </router-link>
    </div>
  </header>
</template>