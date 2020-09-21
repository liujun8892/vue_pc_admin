module.exports = {
  chainWebpack: config => {
    // 开发模式
    config.when(process.env.NODE_ENV === 'development', config => {
      // 入口指向开发 main-dev.js
      config
        .entry('app')
        .clear()
        .add('./src/main-dev.js')

      // 在html插件里面挂载自定义参数
      config.plugin('html').tap(args => {
        args[0].isProd = false
        return args
      })
    })

    // 发布模式
    config.when(process.env.NODE_ENV === 'production', config => {
      config
        .entry('app')
        .clear()
        .add('./src/main-prod.js')

      // 使用externals设置排除项
      config.set('externals', {
        vue: 'Vue',
        'vue-router': 'VueRouter',
        axios: 'axios',
        lodash: '_',
        echarts: 'echarts',
        nprogress: 'NProgress',
        'vue-quill-editor': 'VueQuillEditor'
      })

      // 在html插件里面挂载自定义参数
      config.plugin('html').tap(args => {
        args[0].isProd = true
        return args
      })
    })
  }
}
