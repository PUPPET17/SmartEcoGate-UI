<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-collapse v-model="activeCollapse">
      <el-collapse-item title="搜索条件" name="search">
        <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="100px" >
          <el-form-item label="离线实体ID" prop="entityId">
            <el-input v-model="queryParams.entityId" placeholder="请输入离线实体ID" clearable @keyup.enter.native="handleQuery" />
          </el-form-item>
          <el-form-item label="实体类型" prop="entityType">
            <el-select v-model="queryParams.entityType" placeholder="请选择实体类型" clearable style="width: 192px;">
              <el-option label="企业" :value="1" />
              <el-option label="设备" :value="2" />
            </el-select>
          </el-form-item>
          <el-form-item label="实体名称" prop="entityName">
            <el-input v-model="queryParams.entityName" placeholder="请输入实体名称" clearable @keyup.enter.native="handleQuery" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 192px;">
              <el-option label="已结束" :value="0" />
              <el-option label="离线中" :value="1" />
            </el-select>
          </el-form-item>
          <el-form-item label="离线时间" prop="offlineTime">
            <el-date-picker v-model="dateRange" type="datetimerange" range-separator="至" start-placeholder="开始日期"
              end-placeholder="结束日期" :default-time="[
                new Date(2000, 1, 1, 0, 0, 0),
                new Date(2000, 1, 1, 23, 59, 59)
              ]" value-format="YYYY-MM-DD HH:mm:ss" style="width: 192px;" />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </el-collapse-item>
    </el-collapse>

    <!-- 修改表格部分 -->
    <div class="el-table el-table--enable-row-hover el-table--small" style="max-height: 65vh ; overflow-y: auto;">
      <el-table v-loading="loading" :data="logList" style="width: 100%;height: 60vh;" class="el-table--small">
        <!-- <el-table-column label="离线实体ID" align="center" prop="entityId" /> -->
        <el-table-column label="实体类型" align="center" prop="entityType">
          <template #default="scope">
            <el-tag :type="scope.row.entityType === 1 ? 'success' : 'warning'">
              {{ scope.row.entityType === 1 ? '企业' : '相机' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="实体名称" align="center" prop="entityName" />
        <el-table-column label="离线时间" align="center" prop="offlineTime" width="100">
          <template #default="scope">
            <span>{{ parseTime(scope.row.offlineTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="上线时间" align="center" prop="onlineTime" width="100">
          <template #default="scope">
            <span>{{ parseTime(scope.row.onlineTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="离线时长(秒)" align="center" prop="offlineDuration" />
        <el-table-column label="状态" align="center" prop="status">
          <template #default="scope">
            <el-tag :type="scope.row.status === 0 ? 'info' : 'danger'">
              {{ scope.row.status === 0 ? '已上线' : '离线中' }}
            </el-tag>
          </template>
        </el-table-column>
        <!-- <el-table-column label="是否已处理" align="center" prop="isHandled">
          <template #default="scope">
            <el-tag :type="scope.row.isHandled === 0 ? 'danger' : 'success'">
              {{ scope.row.isHandled === 0 ? '待处理' : '已处理' }}
            </el-tag>
          </template>
        </el-table-column> -->
        <!-- <el-table-column label="离线原因" align="center" prop="offlineReason" :show-overflow-tooltip="true" /> -->
        <!-- <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" /> -->
      </el-table>
    </div>

    <!-- 分页组件 -->
    <pagination-small v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" :width="10" />
  </div>
</template>

<script>
import { listLog } from '@/api/offlineLog/log'
import { parseTime } from '@/utils/ruoyi'
import { Loading } from '@element-plus/icons-vue'
import dayjs from 'dayjs'

export default {
  name: 'OfflineLog',
  components: {
    Loading
  },
  data() {
    return {
      // 遮罩层
      loading: false,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 日志表格数据
      logList: [],
      // 日期范围
      dateRange: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        entityId: undefined,
        entityType: undefined,
        entityName: undefined,
        status: undefined
      },
      // 修改 collapse 激活项为空数组，默认收起
      activeCollapse: []
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询日志列表 */
    getList() {
      this.loading = true
      const params = {
        ...this.queryParams
      }
      if (this.dateRange && this.dateRange.length > 0) {
        params.OfflineTime = dayjs(this.dateRange[0]).format('YYYY-MM-DD HH:mm:ss')
        params.onlineTime = dayjs(this.dateRange[1]).format('YYYY-MM-DD HH:mm:ss')
      }

      listLog(params).then(response => {
        this.logList = response.rows
        this.total = response.total
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = []
      this.queryParams = {
        pageNum: 1,
        pageSize: 5,
        entityId: undefined,
        entityType: undefined,
        entityName: undefined,
        status: undefined,
        offlineTime: undefined,
        onlineTime: undefined
      }
      this.handleQuery()
    },
    /** 时间格式化 */
    parseTime
  }
}
</script>

<style scoped>
.app-container {
  height: 75vh;
}

:deep(.pagination-container) {
  padding: 10px 16px;
}
</style>
