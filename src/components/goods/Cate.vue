<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>分类管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 内容区域 -->
    <el-card class="box-card">
      <el-row>
        <el-button type="primary" @click="showAddCateDialogVisible">添加分类</el-button>
      </el-row>
      <!-- 树形表格 -->
      <tree-table
        class="treeTable"
        :data="categoryList"
        :columns="columns"
        :selection-type="false"
        :show-index="true"
        :border="true"
        :expand-type="false"
        :show-row-hover="false"
      >
        <!-- 是否有效列 -->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: lightgreen"
          ></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <!-- 分类等级列 -->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level == 0">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level == 1">二级</el-tag>
          <el-tag type="warning" v-else>三级</el-tag>
        </template>
        <!-- 分类操作列 -->
        <template slot="opt" slot-scope="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="eidtCateDialogShow(scope.row.cat_id)"
          >编辑</el-button>
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="deleteCate(scope.row.cat_id)"
          >删除</el-button>
        </template>
      </tree-table>
      <!-- 分页控件 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 8, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClose"
    >
      <!-- 添加分类的表单区域 -->
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateForm" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader
            v-model="selectCateKeys"
            :options="parentCateList"
            :props="selectProps"
            @change="handleCateSelectChange"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改分类对话框 -->
    <!-- 修改分类只有显示隐藏的开关不一样,基本的数据结构重用了添加分类的数据结构 -->
    <el-dialog
      title="修改分类"
      :visible.sync="editCateDialogVisible"
      width="50%"
      @close="editCateDialogClose"
    >
      <!-- 修改分类的表单区域 -->
      <el-form
        :model="editCateForm"
        :rules="addCateFormRules"
        ref="editCateForm"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader
            v-model="selectCateKeys"
            :options="parentCateList"
            :props="selectProps"
            @change="handleCateSelectChange"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询分类的参数
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 查询分类列表
      categoryList: [],
      // 查询到的分类总记录数
      total: 0,
      // 树形结构的表格列树形
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 自定义模板类型
          type: 'template',
          // 模板名称
          template: 'isok'
        },
        {
          label: '分类等级',
          // 自定义模板类型
          type: 'template',
          // 模板名称
          template: 'order'
        },
        {
          label: '操作',
          // 自定义模板类型
          type: 'template',
          // 模板名称
          template: 'opt'
        }
      ],
      // 添加分类对话框的显示隐藏
      addCateDialogVisible: false,
      // 添加分类的form表单
      addCateForm: {
        // 分类名称
        cat_name: '',
        // 分类层级
        cat_level: 0,
        // 分类父id
        cat_pid: 0
      },
      // 添加分类form表单校验规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 父级分类数据
      parentCateList: [],
      // 被选中的父级分类id数组
      selectCateKeys: [],
      // 配置选择展示的数据选项
      selectProps: {
        expandTrigger: 'hover',
        // 显示的名称
        label: 'cat_name',
        // 被选中的值
        value: 'cat_id',
        // 子项
        children: 'children',
        // 是否可选择父节点
        checkStrictly: true
      },
      // 修改分类对话框显示隐藏
      editCateDialogVisible: false,
      // 修改分类的form表单
      editCateForm: {
        // 分类id
        cat_id: '',
        // 分类名称
        cat_name: '',
        // 分类层级
        cat_level: 0,
        // 分类父id
        cat_pid: 0
      }
    }
  },
  methods: {
    async getCategoryList() {
      // 调用查询分类接口,获取分类信息
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      // 判断返回结果
      if (res.meta.status !== 200) {
        return this.$message.error('查询分类信息错误')
      }
      // 分类列表
      this.categoryList = res.data.result
      // 总分类数
      this.total = res.data.total
    },
    // 监听每页显示的数据条数改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      // 重新渲染页面数据
      this.getCategoryList()
    },
    // 监听每页显示的数据条数改变
    handleCurrentChange(newSize) {
      this.queryInfo.pagenum = newSize
      // 重新渲染页面数据
      this.getCategoryList()
    },
    // 显示添加分类的对话框
    showAddCateDialogVisible() {
      // 先获取父级分类数据
      this.getParentCateList()
      // 再显示对话框
      this.addCateDialogVisible = true
    },
    // 获取父级分类的数据
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: {
          type: 2
        }
      })
      if (res.meta.status !== 200) {
        this.$message.error('获取父级分类数据失败')
      }
      this.parentCateList = res.data
    },
    // 当选项被改变时
    handleCateSelectChange() {
      // 获取被选中的父级分类id数组长度
      const length = this.selectCateKeys.length
      // 当有被选中的父分类时
      if (length > 0) {
        // 给分类添加父id
        this.addCateForm.cat_pid = this.selectCateKeys[length - 1]
        // 给分类添加等级
        this.addCateForm.cat_level = length
      } else {
        // 重置父id为默认值0
        this.addCateForm.cat_pid = 0
        // 重置等级为默认值0
        this.addCateForm.cat_level = 0
      }
    },
    // 添加分类
    addCate() {
      // 再次验证表单数据
      this.$refs.addCateForm.validate(async pass => {
        // 验证不通过,不继续执行
        if (!pass) return
        // 通过,发送添加分类的请求
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )
        // 判断返回结果
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败')
        }
        this.$message.success('添加分类成功')
        // 重新加载数据
        this.getCategoryList()
        // 关闭对话框
        this.addCateDialogVisible = false
      })
    },
    // 关闭添加分类对话框
    addCateDialogClose() {
      // 清空表单数据
      this.$refs.addCateForm.resetFields()
      // 清空级联选择框
      this.selectCateKeys = []
      // 重置分类父id
      this.addCateForm.cat_pid = 0
      // 重置分类等级
      this.addCateForm.cat_level = 0
    },
    // 修改分类对话框显示
    async eidtCateDialogShow(catId) {
      // 先获取父级分类数据
      this.getParentCateList()

      // 根据分类id查询分类数据
      const { data: res } = await this.$http.get(`categories/${catId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('查询分类信息失败')
      }
      // 分类信息回显
      this.editCateForm = res.data
      // 级联选择框的父分类回显
      // 如果是三级的话,再查一次父级分类
      if (res.data.cat_level === 2) {
        const { data: resParent } = await this.$http.get(
          `categories/${res.data.cat_pid}`
        )
        if (resParent.meta.status !== 200) {
          return this.$message.error('查询分类信息失败')
        }
        this.selectCateKeys.push(resParent.data.cat_pid)
      }
      this.selectCateKeys.push(res.data.cat_pid)
      console.log(this.selectCateKeys)
      this.editCateDialogVisible = true
    },
    // 关闭修改分类对话框
    editCateDialogClose() {
      // 清空表单数据
      this.$refs.editCateForm.resetFields()
      // 清空级联选择框
      this.selectCateKeys = []
      // 重置分类id
      this.editCateForm.cat_id = 0
      // 重置分类父id
      this.editCateForm.cat_pid = 0
      // 重置分类等级
      this.editCateForm.cat_level = 0
    },
    // 修改分类提交
    async editCate() {
      // 再次验证表单数据
      this.$refs.editCateForm.validate(async pass => {
        // 验证不通过,不继续执行
        if (!pass) return
        // 通过,发送添加分类的请求
        const { data: res } = await this.$http.put(
          `categories/${this.editCateForm.cat_id}`,
          {
            cat_name: this.editCateForm.cat_name
          }
        )
        console.log(res)
        // 判断返回结果
        if (res.meta.status !== 200) {
          return this.$message.error('修改分类失败')
        }
        this.$message.success('修改分类成功')
        // 重新加载数据
        this.getCategoryList()
        // 关闭对话框
        this.editCateDialogVisible = false
      })
    },
    // 删除分类
    async deleteCate(cateId) {
      // 提醒角色再次是否删除确认
      const res = await this.$confirm(
        '此操作将永久删除该分类, 是否继续?',
        '删除分类',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // 删除角色取消
      if (res === 'cancel') {
        return this.$message({
          type: 'info',
          message: '已取消删除'
        })
      }
      // 调用后台接口,删除分类
      const { data: delRes } = await this.$http.delete('categories/' + cateId)
      // 验证返回结果
      if (delRes.meta.status !== 200) {
        // 删除分类失败
        return this.$message.error(delRes.meta.msg)
      }
      // 刷新列表
      this.getCategoryList()
      // 删除分类成功
      this.$message.success('删除分类成功')
    }
  },
  created() {
    this.getCategoryList()
  }
}
</script>

<style lang="less" scoped>
.treeTable {
  margin: 15px 0;
}
.el-cascader {
  width: 100%;
}
</style>
