import Vue from 'vue'
import App from './App.vue'
import router from './router/router'
import './plugins/element.js'
import './assets/css/global.css'
import './assets/fonts/iconfont.css'
import TreeTable from 'vue-table-with-tree-grid'
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

// 导入NProgress
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// axios
import Axios from 'axios'
// 设置默认的URL
Axios.defaults.baseURL = 'http://49.232.46.237:3003/api/private/v1/'

// 挂载authorization的请求头
Axios.interceptors.request.use(config => {
  NProgress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Axios.interceptors.response.use(config => {
  NProgress.done()
  return config
})
// 把Axios挂载到vue的原型对象中
Vue.prototype.$http = Axios

Vue.config.productionTip = false

// 过滤器
Vue.filter('dateFormat', function(originVal) {
  const dt = new Date(originVal * 1000)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')

  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

// 挂载树形表格插件
Vue.component('tree-table', TreeTable)

// 挂载富文本编辑器
Vue.use(VueQuillEditor)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
