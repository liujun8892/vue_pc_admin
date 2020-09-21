<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 内容区域 -->
    <el-card class="box-card">
      <!-- 头部搜索和添加用户 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            class="input-with-select"
            v-model="userInfo.query"
            clearable
            @clear="getUserList"
          >
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <el-table :data="userList" style="width: 100%" border stripe>
        <!-- 用户列表区域 -->
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="手机"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column prop="mg_state" label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="modefiyState(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editUser(scope.row.id)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteUser(scope.row.id)"
            ></el-button>
            <el-tooltip
              class="item"
              effect="dark"
              content="设置角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="userInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="userInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      :before-close="handleAddClose"
    >
      <!-- 添加用户表单区域 -->
      <el-form :model="addUserForm" :rules="addUserRules" ref="addUserRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addUserForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addUserForm.password" type="password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户对话框 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editDialogVisible"
      width="50%"
      :before-close="handleEditClose"
    >
      <el-form :model="editUserForm" :rules="editRules" ref="editUserRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editUserForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="eiditUserSubmit">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 设置角色对话框 -->
    <el-dialog
      title="设置角色"
      :visible.sync="setRoleDialogVisible"
      width="50%"
      @close="setRoleDialogClose"
    >
      <p>
        <el-tag type="info">当前的用户:</el-tag>
        {{ currentUser.username }}
      </p>
      <p>
        <el-tag type="info">当前的角色:</el-tag>
        {{ currentUser.role_name }}
      </p>
      <p>
        <el-tag type="info">修改的角色:</el-tag>
        <el-select v-model="roleId" placeholder="请选择">
          <el-option
            v-for="item in roleList"
            :key="item.id"
            :label="item.roleName"
            :value="item.id"
          ></el-option>
        </el-select>
      </p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRoleSubmit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created() {
    this.getUserList()
  },

  data() {
    // 验证邮箱
    const checkEamil = (rule, value, callback) => {
      // 定义验证邮箱的正则
      const checkEamilReg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/

      if (checkEamilReg.test(value)) {
        // 验证通过
        return callback()
      }
      callback(new Error('请输入正确的邮箱'))
    }

    // 验证手机号
    const checkMobile = (rule, value, callback) => {
      // 验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        return callback()
      }
      callback(new Error('请输入正确的手机号'))
    }

    return {
      // 添加用户对话框显示隐藏
      addDialogVisible: false,
      // 修改用户对话框显示隐藏
      editDialogVisible: false,
      // 设置角色对话框显示隐藏
      setRoleDialogVisible: false,
      // 总记录数
      total: 0,
      // 要查询用户数据参数
      userInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 查询到的当前用户
      currentUser: {},
      // 查询到的用户列表
      userList: [],
      // 添加用户表单数据
      addUserForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      addUserRules: {
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 3 ~ 5 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 ~ 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEamil, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 修改用户表单数据
      editUserForm: {
        username: '',
        email: '',
        mobile: ''
      },
      // 修改用户规则
      editRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEamil, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 角色列表
      roleList: [],
      // 选中的角色id
      roleId: ''
    }
  },

  methods: {
    // 获取用户列表数据
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.userInfo
      })
      if (res.meta.status !== 200) {
        // return this.$message.error(res.meta.msg)
      }

      this.total = res.data.total
      this.userList = res.data.users
    },
    // 监听每页显示条数改变
    handleSizeChange(newSize) {
      this.userInfo.pagesize = newSize
      this.getUserList()
    },
    // 监听改变当前页
    handleCurrentChange(newPage) {
      this.userInfo.pagenum = newPage
      this.getUserList()
    },
    // 监听开关状态
    async modefiyState(row) {
      const { data: res } = await this.$http.put(`users/${row.id}/state/${row.mg_state}`)
      if (res.meta.status !== 200) {
        row.mg_state = !row.mg_state
        return this.$message.error('更新状态失败')
      }
      this.$message.success('更新状态成功')
    },
    // 关闭添加对话框,重置表单
    handleAddClose() {
      this.$refs.addUserRef.resetFields()
      this.addDialogVisible = false
    },
    // 添加用户
    addUser() {
      // 对整个表单验证
      this.$refs.addUserRef.validate(async (pass) => {
        // 没有通过验证不发送添加用户请求
        if (!pass) {
          return
        }
        // 通过验证
        const { data: res } = await this.$http.post('users', this.addUserForm)
        // 验证返回结果
        if (res.meta.status !== 201) {
          // 添加用户失败
          return this.$message.error(res.meta.msg)
        }
        // 添加用户成功
        this.$message.success(res.meta.msg)
        // 关闭对话框
        this.handleAddClose()
        // 刷新列表
        this.getUserList()
      })
    },
    // 修改用户
    async editUser(id) {
      // 显示修改对话框
      this.editDialogVisible = true
      // 请求用户信息
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$http.error('获取用户信息失败')
      }
      // 用户信息回显
      this.editUserForm = res.data
    },
    // 关闭修改对话框,重置表单
    handleEditClose() {
      this.$refs.editUserRef.resetFields()
      this.editDialogVisible = false
    },
    // 修改用户提交
    eiditUserSubmit() {
      // 对整个表单验证
      this.$refs.editUserRef.validate(async (pass) => {
        // 没有通过验证不发送修改用户请求
        if (!pass) {
          return
        }
        // 通过验证,调用后台修改用户数据接口
        const { data: res } = await this.$http.put('users/' + this.editUserForm.id, {
          email: this.editUserForm.email,
          mobile: this.editUserForm.mobile
        })
        // 验证返回结果
        if (res.meta.status !== 200) {
          // 修改用户失败
          return this.$message.error(res.meta.msg)
        }
        // 修改用户成功
        this.$message.success('修改用户成功')
        // 关闭对话框
        this.handleEditClose()
        // 刷新列表
        this.getUserList()
      })
    },
    // 删除用户
    async deleteUser(id) {
      // 提醒用户再次是否删除确认
      const res = await this.$confirm('此操作将永久删除该用户, 是否继续?', '删除用户', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err)
      // 用户取消
      if (res === 'cancel') {
        return this.$message({
          type: 'info',
          message: '已取消删除'
        })
      }
      // 调用后台接口,删除该用户
      const { data: delRes } = await this.$http.delete('users/' + id)
      // 验证返回结果
      if (delRes.meta.status !== 200) {
        // 删除用户失败
        return this.$message.error(delRes.meta.msg)
      }
      // 删除用户成功
      this.$message.success('删除用户成功')
      // 刷新列表
      this.getUserList()
    },
    // 设置角色
    async setRole(user) {
      this.currentUser = user
      // 调用后台接口,查询所有角色
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        this.$message.error('获取角色失败')
      }
      this.roleList = res.data
      this.setRoleDialogVisible = true
    },
    // 设置角色提交
    async setRoleSubmit() {
      if (this.roleId.length === 0) {
        return this.$message.error('请选择修改的角色')
      }
      // 发送请求修改角色
      const { data: res } = await this.$http.put(`users/${this.currentUser.id}/role`, {
        rid: this.roleId
      })

      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.$message.success('修改角色成功')
      this.getUserList()
      this.setRoleDialogVisible = false
    },
    // 关闭角色对话框清空角色id
    setRoleDialogClose() {
      this.roleId = ''
      this.userInfo = ''
    }
  }
}
</script>

<style lang="less" scoped>
.el-table {
  margin-top: 20px;
  font-size: 12px;
}
.el-pagination {
  margin-top: 15px;
}
.el-tag {
  font-size: 16px;
  margin-right: 15px;
}
</style>
