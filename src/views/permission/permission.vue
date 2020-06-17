<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.name"
        placeholder="名称"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />

      <el-select
        v-model="listQuery.parent_id"
        placeholder="选择父级"
        clearable
        class="filter-item"
        style="width: 130px"
      >
        <el-option
          v-for="item in calendarTypeOptions"
          :key="item.key"
          :label="item.display_name+'('+item.key+')'"
          :value="item.key"
        />
      </el-select>

      <el-select
        v-model="listQuery.sort"
        style="width: 140px"
        class="filter-item"
        placeholder="选择排序方式"
        @change="handleFilter"
      >
        <el-option
          v-for="item in sortOptions"
          :key="item.key"
          :label="item.label"
          :value="item.key"
        />
      </el-select>
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >查找</el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >新增权限</el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column
        label="ID"
        prop="id"
        sortable="custom"
        align="center"
        width="80"
        :class-name="getSortClass('id')"
      >
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="父级ID" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.parent_id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建日期" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.created_at | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" min-width="150px">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="显示名称" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.display_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="路由" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.url }}</span>
        </template>
      </el-table-column>
      <el-table-column label="排序" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.sort }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">编辑</el-button>
          <el-button
            v-if="row.status!='deleted'"
            size="mini"
            type="danger"
            @click="handleDelete(row,$index)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.pageSize"
      @pagination="getList"
    />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="70px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>
        <el-form-item label="显示名称" prop="name">
          <el-input v-model="temp.display_name" />
        </el-form-item>
        <el-form-item label="路由" prop="url">
          <el-input v-model="temp.url" />
        </el-form-item>
        <el-form-item label="父级" prop="parent_id">
          <el-select v-model="temp.parent_id" class="filter-item" placeholder="请选择父级别">
            <el-option
              v-for="item in calendarTypeOptions"
              :key="item.key"
              :label="item.display_name"
              :value="item.key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="权限类别" prop="guard_name">
          <el-select v-model="temp.guard_name" class="filter-item" placeholder="请选择权限类型">
            <el-option
              v-for="item in permissionTypeOptions"
              :key="item.type"
              :label="item.display_name"
              :value="item.type"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="temp.sort" :step="10" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getPermissionList,
  updatePermission,
  createPermission,
  deletePermission
} from '@/api/permission';
import waves from '@/directive/waves'; // waves directive
import { parseTime } from '@/utils';
import Pagination from '@/components/Pagination'; // secondary package based on el-pagination

const calendarTypeOptions = [];
const permissionTypeOptions = [
  {
    type: 'web',
    display_name: '前台权限'
  },
  {
    type: 'admin',
    display_name: '后台权限'
  }
];

export default {
  name: 'Permission',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      };
      return statusMap[status];
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        pageSize: 20,
        name: '',
        parent_id: '',
        sort: ''
      },

      calendarTypeOptions,
      permissionTypeOptions,
      sortOptions: [
        { label: 'ASC', key: 'ASC' },
        { label: 'DESC', key: 'DESC' }
      ],
      temp: {
        id: undefined,
        name: '',
        display_name: '',
        guard_name: '',
        url: '',
        parent_id: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '新建'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        name: [{ required: true, message: '请填写名称', trigger: 'change' }],
        display_name: [
          { required: true, message: '请填写显示名称', trigger: 'change' }
        ],
        url: [{ required: true, message: '请填写路由', trigger: 'change' }],
        guard_name: [
          {
            required: true,
            message: '请选择权限类别',
            trigger: 'click'
          }
        ],
        sort: [
          {
            required: true,
            message: '请填写路由',
            trigger: 'change'
          }
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    getList() {
      this.listLoading = true;
      getPermissionList(this.listQuery).then(response => {
        this.list = response.data.list;
        this.total = response.data.total;

        if (calendarTypeOptions.length <= 0) {
          response.data.all.forEach(item => {
            calendarTypeOptions.push({
              key: item.id,
              display_name: item.name
            });
          });
          calendarTypeOptions.unshift({
            key: 0,
            display_name: '1级权限'
          });
          calendarTypeOptions.unshift({
            key: '',
            display_name: ''
          });
        }

        setTimeout(() => {
          this.listLoading = false;
        }, 1.5 * 1000);
      });
    },
    handleFilter() {
      this.listQuery.page = 1;
      this.getList();
    },
    sortChange(data) {
      const { prop, order } = data;
      if (prop === 'id') {
        this.sortByID(order);
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id';
      } else {
        this.listQuery.sort = '-id';
      }
      this.handleFilter();
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        name: '',
        display_name: '',
        url: '',
        sort: 0,
        parent_id: '',
        guard_name: 'admin'
      };
    },
    handleCreate() {
      this.resetTemp();
      this.dialogStatus = 'create';
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate();
      });
    },
    createData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          createPermission(this.temp).then(res => {
            this.temp.id = res.data.id;
            this.list.unshift(this.temp);
            this.dialogFormVisible = false;
            this.$notify({
              title: 'Success',
              message: '新增成功',
              type: 'success',
              duration: 2000
            });
          });
        }
      });
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row); // copy obj
      this.dialogStatus = 'update';
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate();
      });
    },
    updateData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          const tempData = Object.assign({}, this.temp);

          updatePermission(this.temp.id, tempData).then(() => {
            const index = this.list.findIndex(v => v.id === this.temp.id);
            this.list.splice(index, 1, this.temp);
            this.dialogFormVisible = false;
            this.$notify({
              title: 'Success',
              message: '更新成功',
              type: 'success',
              duration: 2000
            });
          });
        }
      });
    },
    handleDelete(row, index) {
      deletePermission(row.id).then(() => {
        this.list.splice(index, 1);
        this.total = this.total - 1;
        this.$notify({
          title: 'Success',
          message: '删除成功',
          type: 'success',
          duration: 2000
        });
      });
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort;
      return sort === `+${key}` ? 'ascending' : 'descending';
    }
  }
};
</script>
