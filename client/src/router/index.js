import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import PlayView from '../views/PlayView.vue';
import ResultView from '../views/ResultView.vue';
import LoginView from '../views/admin/LoginView.vue';
import DashboardView from '../views/admin/DashboardView.vue';
import TeamsView from '../views/admin/TeamsView.vue';
import PlayersView from '../views/admin/PlayersView.vue';
import QuestionsView from '../views/admin/QuestionsView.vue';
import ResultsView from '../views/admin/ResultsView.vue';
import SettingsView from '../views/admin/SettingsView.vue';

const routes = [
  { path: '/', name: 'Home', component: HomeView },
  { path: '/play', name: 'Play', component: PlayView },
  { path: '/result', name: 'Result', component: ResultView },
  { path: '/admin/login', name: 'AdminLogin', component: LoginView },
  { path: '/admin', name: 'AdminDashboard', component: DashboardView },
  { path: '/admin/teams', name: 'AdminTeams', component: TeamsView },
  { path: '/admin/players', name: 'AdminPlayers', component: PlayersView },
  { path: '/admin/questions', name: 'AdminQuestions', component: QuestionsView },
  { path: '/admin/results', name: 'AdminResults', component: ResultsView },
  { path: '/admin/settings', name: 'AdminSettings', component: SettingsView },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
