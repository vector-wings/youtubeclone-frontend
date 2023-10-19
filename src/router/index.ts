import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import AppLayout from '../layout/AppLayout.vue' 
import { store } from '@/store'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: AppLayout,
    children: [
      {
        path: '', // 默认子路由
        name: 'home',
        component: () => import(/* webpackChunkName: "home" */ '@/views/home/index.vue')
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import(/* webpackChunkName: "profile" */ '@/views/profile/index.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'watch/:videoId',
        name: 'watch',
        component: () => import(/* webpackChunkName: "home" */ '@/views/watch/index.vue')
      },
    ]
  },
  {
    path: '/login',
    name: 'login', 
    component: () => import(/* webpackChunkName: "login" */ '@/views/login/index.vue')
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from) => {
  const { user } = store.state
  // 而不是去检查每条路由记录
  // to.matched.some(record => record.meta.requiresAuth)
  if (to.meta.requiresAuth && !user) {
    // 此路由需要授权，请检查是否已登录
    // 如果没有，则重定向到登录页面
    return {
      path: '/login',
      // 保存我们所在的位置，以便以后再来
      query: { redirect: to.fullPath },
    }
  }
})

export default router
