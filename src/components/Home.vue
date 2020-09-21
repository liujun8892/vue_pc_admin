<template>
  <!-- 头部区域 -->
  <el-container class="homeContainer">
    <el-header>
      <div @click="()=>{this.$router.push('/welcome')}" class="logoSwap">
        <img src="../assets/adminLogo1.png" alt="" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 侧边栏区域 -->
    <el-container>
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <!-- 切换收缩导航按钮 -->
        <div class="toggle_button" @click="toggleCollapse">|||</div>
        <!-- 侧导航栏 -->
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409EFF"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="path"
        >
          <el-submenu
            :index="item.id + ''"
            v-for="item in menuList"
            :key="item.id"
          >
            <!-- 一级导航 -->
            <template slot="title">
              <i :class="iconObj[item.id]"></i>
              <span>{{ item.authName }}</span>
            </template>

            <!-- 二级导航 -->
            <el-menu-item
              :index="'/' + itemSub.path"
              v-for="itemSub in item.children"
              :key="itemSub.id"
              @click="savePath(itemSub.path)"
            >
              <template slot="title"></template>
              <i class="el-icon-menu"></i>
              <span>{{ itemSub.authName }}</span>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  // 创建的时候就调用获取菜单列表方法
  created() {
    this.getMenuList()
    // 取出session中的path
    this.path = window.sessionStorage.getItem('path')
  },

  // 创建数据对象
  data() {
    return {
      // 侧导航栏是否折叠
      isCollapse: false,
      // 菜单列表
      menuList: [],
      // sessionstrage中的path
      path: '',
      // 字体图标对象,键是id,值是阿里图标类名
      iconObj: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      }
    }
  },

  methods: {
    // 退出方法
    logout() {
      // 清空浏览器token
      window.sessionStorage.clear()
      // 路由到登录页
      this.$router.push('/login')
    },
    // 获取菜单方法
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      this.menuList = res.data
    },
    // 切换收缩菜单栏
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    // 储存路由到sessionStrage
    savePath(path) {
      window.sessionStorage.setItem('path', '/' + path)
      this.path = '/' + path
    }
  }
}
</script>

<style lang="less" scoped>
// 整个主页布局
.homeContainer {
  height: 100%;
}
// 头部区域
.el-header {
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  background-color: #373d41;
  font-size: 20px;
  color: #fff;
  align-items: center;
  > div {
    display: flex;
    align-items: center;
    > span {
      padding-left: 20px;
    }
  }
}
.logoSwap {
  cursor: pointer;
  > img {
    margin-left: 10px;
    width: 70px;
    height: 50px;
  }
}

// 侧边栏区域
.el-aside {
  background-color: #333744;
  // 切换收缩导航按钮
  .toggle_button {
    font-size: 10px;
    line-height: 24px;
    text-align: center;
    color: #fff;
    background-color: #4a5064;
    letter-spacing: 0.2em;
    cursor: pointer;
  }

  // 侧导航栏
  .el-menu {
    border-right: none;
  }
}
.el-main {
  background-color: #eaedf1;
}
.iconfont {
  margin: 10px;
}
</style>
