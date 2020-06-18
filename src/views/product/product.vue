<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.search"
        placeholder="名称"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />

      <el-select
        v-model="listQuery.category_id"
        placeholder="选择分类"
        clearable
        class="filter-item"
        style="width: 130px"
      >
        <el-option
          v-for="item in calendarTypeOptions"
          :key="item.key"
          :label="item.display_name"
          :value="item.key"
        />
      </el-select>

      <el-select
        v-model="listQuery.field"
        style="width: 140px"
        class="filter-item"
        placeholder="选择排序字段"
      >
        <el-option
          v-for="item in filedOptions"
          :key="item.key"
          :label="item.label"
          :value="item.key"
        />
      </el-select>

      <el-select
        v-model="listQuery.order"
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
      >新增用户</el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
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
      <el-table-column label="商品名称" width="110px" align="center">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.title}}</span>
        </template>
      </el-table-column>
      <el-table-column label="分类名称" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.category.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品图" width="150px" align="center">
        <template slot-scope="{row}">
          <img :src="row.image" style="width:50px;height:50px" />
        </template>
      </el-table-column>
      <el-table-column label="价格" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.price }}</span>
        </template>
      </el-table-column>
      <el-table-column label="查看人数" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.review_count }}</span>
        </template>
      </el-table-column>
      <el-table-column label="评分" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.rating }}</span>
        </template>
      </el-table-column>
      <el-table-column label="销量" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.sold_count }}</span>
        </template>
      </el-table-column>

      <el-table-column label="状态" width="150px" align="center">
        <template slot-scope="{row}">
          <el-tag v-if="row.on_sale">上架</el-tag>
          <el-tag v-else type="danger">未上架</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(row,$index)">删除</el-button>
          <el-button
            v-if="row.status==0"
            size="mini"
            type="danger"
            @click="handleChangeStatus(row,$index)"
          >禁用</el-button>
          <el-button
            v-if="row.status==1"
            type="primary"
            size="mini"
            @click="handleChangeStatus(row,$index)"
          >启用</el-button>
          <el-button type="primary" size="mini" @click="handleResetPassword(row)">重置密码</el-button>
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
        <el-form-item label="用户头像" prop="avatar">
          <pan-thumb :image="temp.avatar" />

          <el-button
            type="primary"
            icon="el-icon-upload"
            style="position: absolute;bottom: 15px;margin-left: 40px;"
            @click="imagecropperShow=true"
          >上传头像</el-button>

          <image-cropper
            v-show="imagecropperShow"
            :key="imagecropperKey"
            :width="300"
            :height="300"
            url="http://47.94.155.227:39002/me/avatar"
            lang-type="en"
            @close="close"
            @crop-upload-success="cropSuccess"
          />
        </el-form-item>
        <el-form-item label="商品名称" prop="title">
          <el-input v-model="temp.title" />
        </el-form-item>
        <el-form-item label="商品长标题" prop="long_title">
          <el-input v-model="temp.title" />
        </el-form-item>
        <el-form-item label="商品简介" prop="description">
          <el-input v-model="temp.description" />
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input v-model="temp.price" />
        </el-form-item>

        <!-- <el-form-item label="请选择角色" prop="role_id">
          <el-select
            v-model="temp.role_id"
            placeholder="选择角色"
            clearable
            class="filter-item"
            style="width: 130px"
          >
            <el-option
              v-for="item in calendarTypeOptions"
              :key="item.key"
              :label="item.display_name"
              :value="item.key"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="性别" prop="sex">
          <el-radio v-model="temp.sex" :label="0">男</el-radio>
          <el-radio v-model="temp.sex" :label="1">女</el-radio>
        </el-form-item>-->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import ImageCropper from "@/components/ImageCropper";
import PanThumb from "@/components/PanThumb";
import {
  getProductList,
  updateProduct,
  createProduct,
  deleteProduct
} from "@/api/product";
import waves from "@/directive/waves"; // waves directive
import { parseTime } from "@/utils";
import Pagination from "@/components/Pagination"; // secondary package based on el-pagination
import { string } from "jszip/lib/support";

const calendarTypeOptions = [];

const sexTypeOptions = [
  { key: 0, display_name: "男" },
  { key: 1, display_name: "女" }
];

export default {
  name: "Product",
  components: { Pagination, ImageCropper, PanThumb },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        0: "正常",
        1: "禁用"
      };
      return statusMap[status];
    },
    sexFilter(type) {
      return sexTypeKeyValue[type];
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      imagecropperShow: false,
      imagecropperKey: 0,
      listQuery: {
        page: 1,
        pageSize: 20,
        category_id: "",
        order: "",
        field: "",
        search: ""
      },
      calendarTypeOptions,
      sortOptions: [
        { label: "升序", key: "asc" },
        { label: "降序", key: "desc" }
      ],
      filedOptions: [
        { label: "销量", key: "sold_count" },
        { label: "评分", key: "rating" },
        { label: "查看人数", key: "review_count" },
        { label: "价格", key: "price" }
      ],
      temp: {
        id: undefined,
        category_id: 1,
        description: "",
        image: "",
        title: "",
        long_title: "",
        on_sale: "",
        price: 0,
        type: ""
      },
      dialogFormVisible: false,
      dialogStatus: "",
      textMap: {
        update: "编辑",
        create: "新建"
      },
      dialogPvVisible: false,
      rules: {
        user_name: [
          { required: true, message: "请填写用户名称", trigger: "change" }
        ],
        password: [
          { required: true, message: "请填写用户密码", trigger: "change" }
        ],
        email: [{ required: true, message: "请填写email", trigger: "change" }],
        sex: [
          {
            required: true,
            message: "请选择性别",
            trigger: "click"
          }
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    cropSuccess(resData) {
      this.imagecropperShow = false;
      this.imagecropperKey = this.imagecropperKey + 1;
      this.temp.avatar = resData.path;
    },
    close() {
      this.imagecropperShow = false;
    },
    getList() {
      this.listLoading = true;
      getProductList(this.listQuery).then(response => {
        this.list = response.data.list;
        this.total = response.data.total;
        if (calendarTypeOptions.length <= 0) {
          response.data.category.forEach(item => {
            calendarTypeOptions.push({
              key: item.id,
              display_name: item.name
            });
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
    resetTemp() {
      this.temp = {
        id: undefined,
        user_name: "",
        password: "",
        email: "",
        phone: "",
        real_name: "",
        avatar: "",
        sex: 0,
        roles: [],
        role_id: undefined
      };
    },
    handleCreate() {
      this.resetTemp();
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    createData() {
      this.$refs["dataForm"].validate(valid => {
        if (valid) {
          createUser(this.temp).then(res => {
            this.temp = res.data;
            this.list.unshift(this.temp);
            this.dialogFormVisible = false;
            this.$notify({
              title: "Success",
              message: "新增成功",
              type: "success",
              duration: 2000
            });
          });
        }
      });
    },
    handleUpdate(row) {
      var role_id = row.roles.length > 0 ? row.roles[0].id : 0;
      this.temp = Object.assign({ role_id: role_id }, row); // copy obj
      console.log(this.temp);
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    updateData() {
      this.$refs["dataForm"].validate(valid => {
        if (valid) {
          const tempData = Object.assign({}, this.temp);

          updateUser(this.temp.id, tempData).then(res => {
            const index = this.list.findIndex(v => v.id === this.temp.id);
            this.list.splice(index, 1, res.data);
            this.dialogFormVisible = false;
            this.$notify({
              title: "Success",
              message: "更新成功",
              type: "success",
              duration: 2000
            });
          });
        }
      });
    },
    handleDelete(row, index) {
      deleteUser(row.id).then(() => {
        this.list.splice(index, 1);
        this.total = this.total - 1;
        this.$notify({
          title: "Success",
          message: "删除成功",
          type: "success",
          duration: 2000
        });
      });
    },
    handleChangeStatus(row, index) {
      changeStatus(row.id).then(() => {
        row.status = row.status == 0 ? 1 : 0;
        this.list.splice(index, 1, row);
        this.$notify({
          title: "Success",
          message: "修改成功",
          type: "success",
          duration: 2000
        });
      });
    },
    handleResetPassword(row) {
      resetPassword(row.id).then(res => {
        this.$notify({
          title: "Success",
          message: "新密码为：" + res.data.password,
          type: "success",
          duration: 10000
        });
      });
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort;
      return sort === `+${key}` ? "ascending" : "descending";
    }
  }
};
</script>

<style scoped>
.avatar {
  width: 200px;
  height: 200px;
  border-radius: 50%;
}
</style>
