<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 内容区域 -->
    <el-card class="box-card">
      <!-- 头部搜索和添加用户 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            class="input-with-select"
            clearable
          >
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <el-table :data="orderList" style="width: 100%" border stripe>
        <!-- 用户列表区域 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="order_id" label="订单编号"></el-table-column>
        <el-table-column prop="order_price" label="订单价格"></el-table-column>
        <el-table-column prop="pay_status" label="是否付款">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.pay_status === 1" type="success"
              >已付款</el-tag
            >
            <el-tag v-else type="danger">未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货"></el-table-column>
        <el-table-column prop="create_time" label="下单时间">
          <template slot-scope="scope">
            {{ scope.row.create_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              v-if="scope"
              @click="showEditDialog"
              >修改地址</el-button
            >
            <el-button
              type="success"
              icon="el-icon-map-location"
              size="mini"
              @click="showProgressDialog"
              >物流信息</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 修改对话框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="handleEditDialogClose"
    >
      <el-form
        :model="editLocationForm"
        :rules="editLocationRules"
        ref="editLocationRef"
        label-width="150px"
      >
        <el-form-item label="省市区/县" prop="address">
          <el-cascader
            v-model="editLocationForm.address"
            :options="citydata"
            :props="locationProps"
            @change="handleLocaitonChange"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="detailAddr">
          <el-input v-model="editLocationForm.detailAddr"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editDialogVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>

    <!-- 物流进度对话框 -->
    <el-dialog
      title="物流进度"
      :visible.sync="logisticsProgressDialogVisible"
      width="50%"
    >
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in logisticsInfo"
          :key="index"
          :timestamp="activity.time"
        >
          {{ activity.context }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import citydata from './citydata'
export default {
  data() {
    return {
      // 总记录数
      total: 0,
      // 订单查询参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      // 查询到的当前订单
      currentorder: {},
      // 查询到的订单列表
      orderList: [],
      // 地址
      citydata: citydata,
      // 修改对话框的显示隐藏
      editDialogVisible: false,
      // 修改地址表单
      editLocationForm: {
        address: [],
        detailAddr: ''
      },
      // 修改地址校验规则
      editLocationRules: {
        address: [{ required: true, message: '请输入地址', trigger: 'blur' }],
        detailAddr: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ]
      },
      // 配置地址级联选择器属性
      locationProps: {
        label: 'label',
        value: 'value',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 物流进度对话框显示隐藏
      logisticsProgressDialogVisible: false,
      // 物流信息
      logisticsInfo: []
    }
  },
  created() {
    // 加载订单列表信息
    this.getOrderList()
  },
  methods: {
    // 获取用户列表数据
    async getOrderList() {
      const { data: res } = await this.$http.get('orders', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单列表数据失败')
      }
      this.total = res.data.total
      this.orderList = res.data.goods
    },
    // 监听每页显示条数改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    // 监听改变当前页
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    },
    // 显示修改地址的对话框
    showEditDialog() {
      this.editDialogVisible = true
    },
    // 监听地址改变
    handleLocaitonChange() {
      console.log(this.editLocationForm)
    },
    // 修改地址对话框关闭
    handleEditDialogClose() {
      this.$refs.editLocationRef.resetFields()
    },
    // 物流进度
    async showProgressDialog() {
      // 查询物流信息
      const { data: res } = await this.$http.get('/kuaidi/1106975712662')
      if (res.meta.status !== 200) {
        this.$message.error('获取物流信息失败')
      }
      this.logisticsInfo = res.data
      console.log(this.logisticsInfo)
      this.logisticsProgressDialogVisible = true
    }
  }
}
</script>

<style lang="less" scoped>
@import url('../../plugins/timeline/timeline.css');
@import url('../../plugins/timeline-item/timeline-item.css');
.el-table {
  margin: 20px 0;
}
.el-cascader {
  width: 100%;
}
</style>
