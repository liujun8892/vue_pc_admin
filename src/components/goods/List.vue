<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 内容区域 -->
    <el-card class="box-card">
      <!-- 头部搜索和添加商品 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            class="input-with-select"
            v-model="queryInfo.query"
            clearable
            @clear="getGoodsList"
          >
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddGoodsPage">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 商品列表表格区域 -->
      <el-table :data="goodsList" style="width: 100%" border stripe>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <!--商品名称 -->
        <el-table-column prop="goods_name" label="商品名称" width="700"></el-table-column>
        <!--商品价格 -->
        <el-table-column prop="goods_price" label="商品价格"></el-table-column>
        <!--商品重量 -->
        <el-table-column prop="goods_weight" label="商品重量"></el-table-column>
        <!--创建时间 -->
        <el-table-column label="创建时间">
          <template slot-scope="scope">{{scope.row.add_time | dateFormat}}</template>
        </el-table-column>
        <!--操作列 -->
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeById(scope.row.goods_id)"
            ></el-button>
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
        background
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 获取商品列表的查询参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 商品列表数据
      goodsList: [],
      // 总商品数
      total: 0
    }
  },
  methods: {
    // 获取商品列表
    async getGoodsList() {
      // 发起获取商品列表请求
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo
      })
      // 验证返回结果
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表')
      }
      this.goodsList = res.data.goods
      this.total = res.data.total
    },
    // 监听每页显示条数改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    // 监听改变当前页
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    // 删除商品
    async removeById(goodsId) {
      // 提醒商品再次是否删除确认
      const res = await this.$confirm(
        '此操作将永久删除该商品, 是否继续?',
        '删除商品',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // 商品取消
      if (res === 'cancel') {
        return this.$message({
          type: 'info',
          message: '已取消删除'
        })
      }
      // 调用后台接口,删除该商品
      const { data: delRes } = await this.$http.delete('goods/' + goodsId)
      // 验证返回结果
      if (delRes.meta.status !== 200) {
        // 删除商品失败
        return this.$message.error(delRes.meta.msg)
      }
      // 删除商品成功
      this.$message.success('删除商品成功')
      // 刷新列表
      this.getGoodsList()
    },
    // 去添加商品页面
    goAddGoodsPage() {
      this.$router.push('/goods/add')
    }
  },
  created() {
    // 页面初始化就获取商品列表
    this.getGoodsList()
  },
  computed: {}
}
</script>

<style lang="less" scoped>
.el-table {
  margin-top: 20px;
}
</style>
