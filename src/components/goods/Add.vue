<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 内容区域 -->
    <el-card class="box-card">
      <!-- 提示信息 -->
      <el-alert title="消息提示的文案" type="info" center show-icon></el-alert>
      <!-- 进度条 -->
      <el-steps
        :space="200"
        :active="activeIndex - 0"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容."></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- 添加商品表单区域 -->
      <el-form
        :model="addGoodsForm"
        :rules="addGoodsRules"
        ref="addGoodsForm"
        label-position="top"
        label-width="100px"
      >
        <!-- 填写信息tab栏 -->
        <el-tabs
          tab-position="left"
          v-model="activeIndex"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <!-- 商品基本信息 -->
          <el-tab-pane label="基本信息" name="0">
            <!-- 商品名称 -->
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addGoodsForm.goods_name"></el-input>
            </el-form-item>
            <!-- 商品价格 -->
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model.number="addGoodsForm.goods_price"></el-input>
            </el-form-item>
            <!-- 商品数量 -->
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model.number="addGoodsForm.goods_number"></el-input>
            </el-form-item>
            <!-- 商品重量 -->
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model.number="addGoodsForm.goods_weight"></el-input>
            </el-form-item>
            <!-- 商品分类 -->
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addGoodsForm.goods_cat"
                :options="categoryList"
                :props="selectedProps"
                @change="handleSelectedCateChange"
                width="500px"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 商品参数 -->
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyTableData"
              :key="item.attr_id"
            >
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="itemVal"
                  v-for="(itemVal, index) in item.attr_vals"
                  :key="index"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <!-- 商品属性 -->
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyTableData"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- 图片上传 -->
            <el-upload
              :action="uploadUrl"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :headers="headersObj"
              :on-success="imgUploadSuccess"
              list-type="picture"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addGoodsForm.goods_introduce"></quill-editor>
            <el-button type="primary" @click="submitGoods" class="addGoodsBtn"
              >添加商品</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 预览图片的对话框 -->
    <el-dialog
      title="图片预览"
      :visible.sync="previewImgDialogVisible"
      width="50%"
    >
      <img :src="previewPath" alt="图片去火星了" style="width: 100%" />
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  data() {
    return {
      // 步骤条激活索引
      activeIndex: '0',

      // 添加商品的表单数据
      addGoodsForm: {
        goods_name: '',
        goods_cat: [],
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        pics: [],
        goods_introduce: '',
        attrs: []
      },

      // 添加商品的表单校验规则
      addGoodsRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' },
          { type: 'number', message: '年龄必须为数字值' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' },
          { type: 'number', message: '年龄必须为数字值' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' },
          { type: 'number', message: '年龄必须为数字值' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },

      // 分类数据列表
      categoryList: [],

      // 商品分类级联选择器属性
      selectedProps: {
        expandTrigger: 'hover',
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },

      // 动态参数列表
      manyTableData: [],

      // 静态属性列表
      onlyTableData: [],

      // 图片上传url
      uploadUrl: 'http://127.0.0.1:8888/api/private/v1/upload',

      // 图片上传请求头
      headersObj: {
        Authorization: window.sessionStorage.getItem('token')
      },

      // 预览图片的路径
      previewPath: '',

      // 预览图片的对话框
      previewImgDialogVisible: false
    }
  },

  methods: {
    // 获取商品分类数据列表
    async getCategoryList() {
      // 调用查询分类接口,获取分类信息
      const { data: res } = await this.$http.get('categories')
      // 判断返回结果
      if (res.meta.status !== 200) {
        return this.$message.error('查询分类信息错误')
      }
      // 分类列表
      this.categoryList = res.data
    },

    // 监听商品分类选择器状态改变
    handleSelectedCateChange() {
      // 选择的不是3级分类清空选选项
      if (this.addGoodsForm.goods_cat.length !== 3) {
        this.addGoodsForm.goods_cat = []
      }
    },

    // 监听tab切换
    beforeTabLeave(toTagName, fromTagName) {
      // 校验第一步tab栏
      if (fromTagName === '0' && this.addGoodsForm.goods_cat.length !== 3) {
        // 校验失败
        this.$message.error('请选择分类列表')
        // 阻止切换
        return false
      }
    },

    // 监听tab点击
    async tabClicked() {
      // 如果点击的是第二栏tab
      if (this.activeIndex === '1') {
        // 加载动态参数系信息
        // 调用根据分类id查询分类参数的接口
        const { data: res } = await this.$http.get(
          `categories/${this.getCateId}/attributes`,
          {
            params: {
              sel: 'many'
            }
          }
        )
        // 判断响应结果
        if (res.meta.status !== 200) {
          this.$message.error('获取参数列表失败')
        }
        // 处理参数值
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        })
        this.manyTableData = res.data
        console.log(res.data)
      } else if (this.activeIndex === '2') {
        // 加载静态属性信息
        // 调用根据分类id查询分类参数的接口
        const { data: res } = await this.$http.get(
          `categories/${this.getCateId}/attributes`,
          {
            params: {
              sel: 'only'
            }
          }
        )
        // 判断响应结果
        if (res.meta.status !== 200) {
          this.$message.error('获取参数列表失败')
        }
        this.onlyTableData = res.data
      }
    },

    // 图片预览事件
    handlePreview(file) {
      // 将图片的服务器路径赋值给previewPath
      this.previewPath = file.response.data.url
      // 预览图片的对话框显示
      this.previewImgDialogVisible = true
    },

    // 图片移除事件
    handleRemove(file) {
      // 获取图片路径
      const imgPath = file.response.data.tmp_path
      // 找出pics数组中此图片的索引
      const index = this.addGoodsForm.pics.findIndex(
        item => item.pic === imgPath
      )
      // 删除图片
      this.addGoodsForm.pics.splice(index, 1)
    },

    // 图片上传成功后,保存上传的图片路径
    imgUploadSuccess(response, file, fileList) {
      // 保存图片上传的路径
      this.addGoodsForm.pics.push({ pic: response.data.tmp_path })
    },

    // 商品内容提交
    async submitGoods() {
      // 校验表单数据
      this.$refs.addGoodsForm.validate(valid => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项')
        }
      })
      // 深拷贝表单数据
      const form = _.cloneDeep(this.addGoodsForm)
      // 处理商品分 裂数据
      console.log(form)
      form.goods_cat = form.goods_cat.join(',')
      // console.log(this.manyTableData)
      // console.log(this.onlyTableData)
      // 处理动态参数
      this.manyTableData.forEach(item => {
        const manyInfo = {
          attr_id: item.attr_id,
          attr_value: item.attr_vals.join(' ')
        }
        this.addGoodsForm.attrs.push(manyInfo)
      })
      // 处理静态属性
      this.onlyTableData.forEach(item => {
        const onlyInfo = {
          attr_id: item.attr_id,
          attr_value: item.attr_vals
        }
        this.addGoodsForm.attrs.push(onlyInfo)
      })
      // 将参数属性添加到form表单数据里
      form.attrs = this.addGoodsForm.attrs
      // 添加商品
      const { data: res } = await this.$http.post('goods', form)
      if (res.meta.status !== 201) {
        return this.$message.error('添加商品失败')
      }
      // 添加商品成功
      this.$message.success('添加商品成功')
      // 跳转到商品列表页
      this.$router.push('/goods')
      console.log(form)
    }
  },

  created() {
    // 初始化时加载商品分类数据
    this.getCategoryList()
  },

  computed: {
    getCateId() {
      return this.addGoodsForm.goods_cat.length === 3
        ? this.addGoodsForm.goods_cat[2]
        : ''
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 20px 10px 0 !important;
}
.addGoodsBtn {
  margin-top: 15px;
}
</style>
