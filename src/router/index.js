import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CameraView from '../views/CameraView.vue'
import MemoView from '../views/MemoView.vue'
import SettingsView from '../views/SettingsView.vue'
import SignInView from '../views/SignInView.vue'
import RegisterView from '../views/RegisterView.vue'
import TransitionScreen from '../views/TransitionScreen.vue' // ✅ ここ追加！
import CalendarView from '../views/CalendarView.vue' 

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/signin'
    },
    {
      path: '/signin',
      name: 'signin',
      component: SignInView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/transition', // ✅ ここ追加！
      name: 'transition',
      component: TransitionScreen,
    },
{
  path: '/calendar',
  name: 'calendar',
  component: CalendarView,
},

    {
      path: '/home',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/camera',
      name: 'camera',
      component: CameraView,
    },
    {
      path: '/memo',
      name: 'memo',
      component: MemoView,
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
    },
  ],
})

export default router
