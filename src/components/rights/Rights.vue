<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 内容区域 -->
    <el-card class="box-card">
      <el-table :data="rightList" style="width: 100%" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="权限名称" prop="authName"></el-table-column>
        <el-table-column label="路径" prop="path"></el-table-column>
        <el-table-column label="等级" prop="level">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level==0">等级一</el-tag>
            <el-tag type="success" v-else-if="scope.row.level==1">等级二</el-tag>
            <el-tag type="warning" v-else @click="showScope(scope)">等级三</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rightList: []
    }
  },
  methods: {
    // 获取权限列表
    async getRightList() {
      const { data: res } = await this.$http.get('rights/list')
      // 获取权限列表失败
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      // 显示权限列表数据
      this.rightList = res.data
    },
    showScope(scope) {
      console.log(scope)
    }
  },
  created() {
    this.getRightList()
  }
}
</script>

<style lang="less" scoped>
</style>
