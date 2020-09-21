import Vue from 'vue'
import VueRouter from 'vue-router'

// import Login from '../components/Login.vue'
// import Home from '../components/Home.vue'
// import Welcome from '../components/Welcome.vue'

const Login = () => import(/* webpackChunkName: "Login_Home_Welcome" */ '../components/Login.vue')
const Home = () => import(/* webpackChunkName: "Login_Home_Welcome" */ '../components/Home.vue')
const Welcome = () => import(/* webpackChunkName: "Login_Home_Welcome" */ '../components/Welcome.vue')

// import Users from '../components/user/User.vue'
// import Rights from '../components/rights/Rights.vue'
// import Roles from '../components/rights/Roles.vue'

const Users = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/user/User.vue')
const Rights = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/rights/Rights.vue')
const Roles = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/rights/Roles.vue')

// import Cate from '../components/goods/Cate.vue'
// import Params from '../components/goods/Params.vue'
const Cate = () => import(/* webpackChunkName: "Cate_Params" */ '../components/goods/Cate.vue')
const Params = () => import(/* webpackChunkName: "Cate_Params" */ '../components/goods/Params.vue')

// import List from '../components/goods/List.vue'
// import AddGoods from '../components/goods/Add.vue'
const List = () => import(/* webpackChunkName: "List_AddGoods" */ '../components/goods/List.vue')
const AddGoods = () => import(/* webpackChunkName: "List_AddGoods" */ '../components/goods/Add.vue')

// import Order from '../components/order/Order.vue'
// import Report from '../components/report/Report.vue'
const Order = () => import(/* webpackChunkName: "Order_Report" */ '../components/order/Order.vue')
const Report = () => import(/* webpackChunkName: "Order_Report" */ '../components/report/Report.vue')

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      component: Login
    },
    {
      path: '/home',
      component: Home,
      redirect: '/welcome',
      children: [
        {
          path: '/welcome',
          component: Welcome
        },
        {
          path: '/users',
          component: Users
        },
        {
          path: '/rights',
          component: Rights
        },
        {
          path: '/roles',
          component: Roles
        },
        {
          path: '/categories',
          component: Cate
        },
        {
          path: '/params',
          component: Params
        },
        {
          path: '/goods',
          component: List
        },
        {
          path: '/goods/add',
          component: AddGoods
        },
        {
          path: '/orders',
          component: Order
        },
        {
          path: '/reports',
          component: Report
        }
      ]
    }
  ]
})

// 路由导航守卫
router.beforeEach((to, form, next) => {
  // 如果是登录路由直接放行
  if (to.path === '/login') return next()
  // 否则判断是否携带token
  const token = window.sessionStorage.getItem('token')
  if (!token) return next('/login')
  next()
})

export default router
