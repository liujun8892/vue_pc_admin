<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 内容区域 -->
    <el-card class="box-card">
      <!-- 提示信息 -->
      <el-alert
        title="注意: 只允许为第三级分类设定相关参数"
        type="warning"
        :closable="false"
        show-icon
      >
      </el-alert>
      <!-- 选择分类 -->
      <el-row>
        <el-col>
          <span>选择商品分类:</span>
          <el-cascader
            v-model="cateSelectedKeys"
            :options="categoryList"
            :props="cateProps"
            @change="cateSelectedChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tab标签页 -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button
            size="mini"
            type="primary"
            :disabled="isBtnDisabled"
            class="addParamsBtn"
            @click="addDialogVisible = true"
            >添加参数</el-button
          >
          <!-- 动态参数表格区域 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  :closable="true"
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  @close="hasClosed(scope.row, index)"
                >
                  {{ item }}
                </el-tag>
                <!-- 新标签输入框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="addNewAttrVals(scope.row)"
                  @blur="addNewAttrVals(scope.row)"
                >
                </el-input>
                <!-- 新标签按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <!-- 参数名称列 -->
            <el-table-column
              label="参数名称"
              prop="attr_name"
            ></el-table-column>
            <!-- 操作列 -->
            <el-table-column label="操作" width="300">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditParamsDialog(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="deleteParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template></el-table-column
            >
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button
            size="mini"
            type="primary"
            :disabled="isBtnDisabled"
            class="addParamsBtn"
            @click="addDialogVisible = true"
            >添加属性</el-button
          >
          <!-- 静态参数表格区域 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环显示标签页 -->
                <el-tag
                  :closable="true"
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  @close="hasClosed(scope.row, index)"
                >
                  {{ item }}
                </el-tag>
                <!-- 新标签输入框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="addNewAttrVals(scope.row)"
                  @blur="addNewAttrVals(scope.row)"
                >
                </el-input>
                <!-- 新标签按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <!-- 参数名称列 -->
            <el-table-column
              label="属性名称"
              prop="attr_name"
            ></el-table-column>
            <!-- 操作列 -->
            <el-table-column label="操作" width="300">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditParamsDialog(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="deleteParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template></el-table-column
            >
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数对话框 -->
    <el-dialog
      :title="'添加' + paramsAttr"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogHandleClose"
    >
      <el-form
        :model="addAttrsForm"
        :rules="addAttrsRules"
        ref="addAttrsForm"
        label-width="100px"
      >
        <el-form-item :label="paramsAttr" prop="attr_name">
          <el-input v-model="addAttrsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addAttrs">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数对话框 -->
    <el-dialog
      :title="'修改' + paramsAttr"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogHandleClose"
    >
      <el-form
        :model="editAttrsForm"
        :rules="editAttrsRules"
        ref="editAttrsForm"
        label-width="100px"
      >
        <el-form-item :label="paramsAttr" prop="attr_name">
          <el-input v-model="editAttrsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editAttrs">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类列表
      categoryList: [],
      // 商品分类的级联选择框属性
      cateProps: {
        // 鼠标悬浮的时候触发下一级选择框
        expandTrigger: 'hover',
        // 选择框的名称
        label: 'cat_name',
        // 选择框的值
        value: 'cat_id',
        // 子分类
        children: 'children'
      },
      // 级联选择框的选择项id数组
      cateSelectedKeys: [],
      // 激活的tab标签页
      activeName: 'many',
      // 动态参数表格
      manyTableData: [],
      // 静态参数
      onlyTableData: [],
      // 添加参数对话框的显示隐藏
      addDialogVisible: false,
      // 添加属性表单数据
      addAttrsForm: {
        attr_name: ''
      },
      // 添加属性表单校验规则
      addAttrsRules: {
        attr_name: [
          {
            required: true,
            message: '请输入名称',
            trigger: 'blur'
          }
        ]
      },
      // 修改参数对话框的显示隐藏
      editDialogVisible: false,
      // 修改属性表单数据
      editAttrsForm: {
        attr_name: ''
      },
      // 修改属性表单校验规则
      editAttrsRules: {
        attr_name: [
          {
            required: true,
            message: '请输入名称',
            trigger: 'blur'
          }
        ]
      },
      // 修改属性的id
      attr_id: '',
      // 新标签输入框的显示隐藏
      inputVisible: false,
      // 新标签输入框的输入内容
      inputValue: ''
    }
  },
  methods: {
    // 获取分类列表
    async getCategoryList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类列表信息失败')
      }
      this.categoryList = res.data
    },
    // 级联选择器状态改变
    async cateSelectedChange() {
      // 当用户选择的不是三级分类,清空选择数组,让用户重选
      const length = this.cateSelectedKeys.length
      if (length !== 3) {
        // 清空选中的选项数组
        this.cateSelectedKeys = []
        // 清空动态参数
        this.manyTableData = []
        // 清空静态属性
        this.onlyTableData = []
        return
      }
      // 调用获取参数列表的方法
      this.getParamsData()
    },
    // 获取参数列表
    async getParamsData() {
      // 再次判断是否选择了三级分类
      if (this.cateSelectedKeys.length !== 3) return
      // 调用根据分类id查询分类参数的接口
      const { data: res } = await this.$http.get(
        `categories/${this.getCateId}/attributes`,
        {
          params: {
            sel: this.activeName
          }
        }
      )
      // 判断响应结果
      if (res.meta.status !== 200) {
        this.$message.error('获取参数列表失败')
      }
      console.log(res.data)
      // 处理参数值
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 绑定新标签输入框显示隐藏属性
        item.inputVisible = false
        // 绑定新标签输入框输入内容
        item.inputValue = ''
      })

      // 将响应数据赋值给不同的表格
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // tab标签页被点击时
    handleClick() {
      console.log(this.activeName)
      // 调用获取参数列表的方法
      this.getParamsData()
    },
    // 添加参数对话框的关闭事件
    addDialogHandleClose() {
      this.$refs.addAttrsForm.resetFields()
    },
    // 添加参数
    addAttrs() {
      // 对整个表单验证
      this.$refs.addAttrsForm.validate(async pass => {
        // 没有通过验证不发送添加角色请求
        if (!pass) {
          return
        }
        // 通过验证
        const { data: res } = await this.$http.post(
          `categories/${this.getCateId}/attributes`,
          {
            attr_name: this.addAttrsForm.attr_name,
            attr_sel: this.activeName
          }
        )
        // 验证返回结果
        if (res.meta.status !== 201) {
          // 添加参数失败
          return this.$message.error(`添加${this.paramsAttr}失败`)
        }
        // 添加参数成功
        this.$message.success(`添加${this.paramsAttr}成功`)
        // 关闭对话框
        this.addDialogVisible = false
        // 刷新列表
        this.getParamsData()
      })
    },
    // 修改参数对话框的关闭事件
    editDialogHandleClose() {
      this.$refs.editAttrsForm.resetFields()
    },
    // 显示修改参数对话框
    async showEditParamsDialog(attrId) {
      this.attr_id = attrId
      // 请求参数信息
      const { data: res } = await this.$http.get(
        `categories/${this.getCateId}/attributes/${attrId}/`
      )
      if (res.meta.status !== 200) {
        return this.$http.error(`获取${this.paramsAttr}成功`)
      }
      // 参数信息回显
      this.editAttrsForm = res.data
      this.editDialogVisible = true
    },
    // 修改参数
    editAttrs() {
      // 对整个表单验证
      this.$refs.editAttrsForm.validate(async pass => {
        // 没有通过验证不发送修改参数请求
        if (!pass) {
          return
        }
        // 通过验证
        const { data: res } = await this.$http.put(
          `categories/${this.getCateId}/attributes/${this.attr_id}/`,
          {
            attr_name: this.editAttrsForm.attr_name,
            attr_sel: this.activeName
          }
        )
        // 验证返回结果
        if (res.meta.status !== 200) {
          // 修改参数失败
          return this.$message.error(`修改${this.paramsAttr}失败`)
        }
        // 修改参数成功
        this.$message.success(`修改${this.paramsAttr}成功`)
        // 关闭对话框
        this.editDialogVisible = false
        // 刷新列表
        this.getParamsData()
      })
    },
    // 删除参数
    async deleteParams(attrId) {
      // 提醒参数再次是否删除确认
      const res = await this.$confirm(
        '此操作将永久删除该参数, 是否继续?',
        '删除参数',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // 删除参数取消
      if (res === 'cancel') {
        return this.$message({
          type: 'info',
          message: '已取消删除'
        })
      }
      // 调用后台接口,删除该参数
      const { data: delRes } = await this.$http.delete(
        `categories/${this.getCateId}/attributes/${attrId}/`
      )
      // 验证返回结果
      if (delRes.meta.status !== 200) {
        // 删除参数失败
        return this.$message.error(delRes.meta.msg)
      }
      // 刷新列表
      this.getParamsData()
      // 删除参数成功
      this.$message.success('删除参数成功')
    },
    // 新标签输入框的离焦或回车触发的事件
    async addNewAttrVals(row) {
      // 如果用户输入的是空格,那么离焦之后,清空输入框
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        // 隐藏输入框
        row.inputVisible = false
        return
      }
      // 将新标签添加到数组中
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      // 隐藏输入框
      row.inputVisible = false

      // 调用添加新标签的方法
      this.saveTag(row)
    },
    // 添加新标签方法
    async saveTag(row) {
      // 添加新的标签
      const { data: res } = await this.$http.put(
        `categories/${row.cat_id}/attributes/${row.attr_id}/`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        }
      )
      // 验证返回结果
      if (res.meta.status !== 200) {
        // 修改参数失败
        return this.$message.error('修改参数的属性值失败')
      }
      // 修改参数成功
      this.$message.success('修改参数的属性值成功')
      // 隐藏输入框
      row.inputVisible = false
    },
    // 新标签输入框的显示方法
    showInput(row) {
      // 显示输入框
      row.inputVisible = true
      // 页面元素被重新渲染之后,让输入框自动获取
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除标签
    hasClosed(row, index) {
      // 页面删除
      row.attr_vals.splice(index, 1)
      // 数据库删除
      this.saveTag(row)
    }
  },
  created() {
    // 拉取分类列表
    this.getCategoryList()
  },
  computed: {
    // 计算添加参数按钮是否被禁用
    isBtnDisabled() {
      if (this.cateSelectedKeys.length !== 3) {
        return true
      }
      return false
    },
    // 计算选中的三级分类的id
    getCateId() {
      return this.cateSelectedKeys.length === 3
        ? this.cateSelectedKeys[2]
        : null
    },
    // 区分对话框添加的是动态参数还是静态属性
    paramsAttr() {
      return this.activeName === 'many' ? '动态参数' : '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
.el-alert {
  font-size: 14px;
}
.el-row {
  margin-top: 15px;
}
.el-cascader {
  margin-left: 20px;
}
.addParamsBtn {
  margin-bottom: 15px;
}
.el-tag {
  margin-right: 20px;
}
.el-input {
  width: 150px;
}
</style>
