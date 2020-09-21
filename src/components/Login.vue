<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 登录头像 -->
      <div class="avatar_img">
        <img src="../assets/logo.png" alt />
      </div>
      <!-- 登录表单 -->
      <el-form
        label-width="0px"
        class="loginForm"
        :model="loginForm"
        ref="loginFormRef"
        :rules="loginFormRules"
      >
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input
            prefix-icon="iconfont icon-user"
            v-model="loginForm.username"
          ></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            type="password"
            prefix-icon="iconfont icon-3702mima"
            v-model="loginForm.password"
          ></el-input>
        </el-form-item>
        <!-- 登录按钮 -->
        <el-form-item class="btns">
          <!-- 前置伪元素图片 -->
          <!-- 表单验证 -->
          <el-button type="primary" @click="vilidForm">登录</el-button>
          <el-button type="info" @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      loginFormRules: {
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 2, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },

  methods: {
    resetForm() {
      // 调用elementui的重置方法
      this.$refs.loginFormRef.resetFields()
    },
    vilidForm() {
      // 调用elementui的整个表单验证方法
      this.$refs.loginFormRef.validate(async pass => {
        // 表单验证未通过则不发送后台请求
        if (!pass) return
        // 验证通过调登录接口
        const { data: res } = await this.$http.post('login', this.loginForm)
        // 判断返回结果
        if (res.meta.status !== 200) return this.$message.error('登录失败')
        // 登录成功保存token
        window.sessionStorage.setItem('token', res.data.token)
        // 路由到主页
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login_box {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 450px;
  height: 300px;
  border-radius: 3px;
  background-color: #fff;
}

.avatar_img {
  position: absolute;
  left: 50%;
  width: 130px;
  padding: 10px;
  height: 130px;
  border: 1px solid #eee;
  background-color: #fff;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 10px #aaa;
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #eee;
  }
}

.loginForm {
  box-sizing: border-box;
  position: absolute;
  bottom: 0;
  padding: 10px;
  width: 100%;
  .btns {
    display: flex;
    justify-content: center;
  }
}
</style>
