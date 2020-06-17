<template>
  <div class="app-container">
    <el-button type="primary" @click="handleAddRole">新建角色</el-button>

    <el-table :data="rolesList" style="width: 100%;margin-top:30px;" border>
      <el-table-column align="center" label="角色ID" width="220">
        <template slot-scope="scope">{{ scope.row.id }}</template>
      </el-table-column>
      <el-table-column align="center" label="角色名称" width="220">
        <template slot-scope="scope">{{ scope.row.name }}</template>
      </el-table-column>
      <el-table-column align="header-center" label="简介">
        <template slot-scope="scope">{{ scope.row.description }}</template>
      </el-table-column>
      <el-table-column align="center" label="编辑">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'角色编辑':'新建角色'">
      <el-form :model="role" label-width="80px" label-position="left">
        <el-form-item label="Name">
          <el-input v-model="role.name" placeholder="角色名称" />
        </el-form-item>
        <el-form-item label="Desc">
          <el-input
            v-model="role.description"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="角色简介"
          />
        </el-form-item>
        <el-form-item label="权限">
          <el-tree
            ref="tree"
            :check-strictly="checkStrictly"
            :data="routesData"
            :props="defaultProps"
            show-checkbox
            node-key="id"
            class="permission-tree"
          />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmRole">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import path from 'path';
import { deepClone } from '@/utils';
import {
  getRoutes,
  getRoles,
  addRole,
  deleteRole,
  updateRole
} from '@/api/role';

const defaultRole = {
  key: '',
  name: '',
  description: '',
  routes: []
};

export default {
  data() {
    return {
      role: Object.assign({}, defaultRole),
      routes: [],
      rolesList: [],
      dialogVisible: false,
      dialogType: 'new',
      checkStrictly: false,
      defaultProps: {
        children: 'children',
        label: 'title'
      }
    };
  },
  computed: {
    routesData() {
      return this.routes;
    }
  },
  created() {
    // Mock: get all routes and roles list from server
    this.getRoutes();
    this.getRoles();
  },
  methods: {
    async getRoutes() {
      const res = await getRoutes(100);
      this.serviceRoutes = res.data;
      this.routes = this.generateRoutes(res.data);
    },
    async getRoles() {
      const res = await getRoles();
      this.rolesList = res.data.list;
    },

    // Reshape the routes structure so that it looks the same as the sidebar
    generateRoutes(routes, basePath = '/') {
      const res = [];
      for (const route of routes) {
        // skip some route

        // const onlyOneShowingChild = this.onlyOneShowingChild(
        //   route.child,
        //   route
        // );
        // if (route.name == "系统管理") {
        //   console.log(111);
        //    console.log(route);
        //   console.log(onlyOneShowingChild);
        // }
        // if (route.child && onlyOneShowingChild) {
        //   route = onlyOneShowingChild;
        // }

        const data = {
          id: route.id,
          path: path.resolve(basePath, route.url),
          title: route.name
        };

        // recursive child routes
        if (route.child) {
          data.children = this.generateRoutes(route.child, data.path);
        }

        res.push(data);
      }
      return res;
    },
    generateArr(routes) {
      let data = [];
      routes.forEach(route => {
        data.push(route);
        if (route.children) {
          const temp = this.generateArr(route.children);
          if (temp.length > 0) {
            data = [...data, ...temp];
          }
        }
      });
      return data;
    },
    handleAddRole() {
      this.role = Object.assign({}, defaultRole);
      if (this.$refs.tree) {
        this.$refs.tree.setCheckedNodes([]);
      }
      this.dialogType = 'new';
      this.dialogVisible = true;
    },
    getMenuByPermissions(permissions, parent_id = 0) {
      var menus = [];
      for (var i = 0; i < permissions.length; i++) {
        if (permissions[i].parent_id === parent_id) {
          menus.push(permissions[i]);
        }
      }
      for (var j = 0; j < menus.length; j++) {
        menus[j]['child'] = this.getMenuByPermissions(permissions, menus[j].id);
      }
      return menus;
    },
    handleEdit(scope) {
      this.dialogType = 'edit';
      this.dialogVisible = true;
      this.checkStrictly = true;
      this.role = deepClone(scope.row);
      var menus = this.getMenuByPermissions(this.role.permissions);
      console.log(menus);
      this.$nextTick(() => {
        const routes = this.generateRoutes(menus);
        console.log(routes);
        this.$refs.tree.setCheckedNodes(this.generateArr(routes));
        // set checked state of a node not affects its father and child nodes
        this.checkStrictly = false;
      });
    },
    handleDelete({ $index, row }) {
      this.$confirm('是否删除该角色?', 'Warning', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          await deleteRole(row.id);
          this.rolesList.splice($index, 1);
          this.$message({
            type: 'success',
            message: '删除成功!'
          });
        })
        .catch(err => {
          console.error(err);
        });
    },
    generateTree(routes, checkedKeys, res = []) {
      for (const route of routes) {
        const id = route.id;
        // recursive child routes
        if (checkedKeys.includes(id)) {
          res.push(route);
        }
        if (route.child) {
          this.generateTree(route.child, checkedKeys, res);
        }
      }
      var new_list = [];
      res.forEach(item => {
        delete item.child;
        new_list.push(item);
      });
      return new_list;
    },
    async confirmRole() {
      const isEdit = this.dialogType === 'edit';

      // 获取当前选中和半选中节点
      var nodes = this.$refs.tree.getCheckedNodes(false, true);
      var permissionsIds = [];
      nodes.forEach(item => {
        permissionsIds.push(item.id);
      });

      this.role.permissions = this.generateTree(
        deepClone(this.serviceRoutes),
        permissionsIds
      );

      const requestData = {
        name: this.role.name,
        description: this.role.description,
        guard_name: 'admin',
        permissionsIds: permissionsIds
      };

      if (isEdit) {
        await updateRole(this.role.id, requestData);
        for (let index = 0; index < this.rolesList.length; index++) {
          if (this.rolesList[index].id === this.role.id) {
            this.rolesList.splice(index, 1, Object.assign({}, this.role));
            break;
          }
        }
      } else {
        const { data } = await addRole(requestData);
        this.role.id = data.id;
        this.rolesList.push(this.role);
      }

      const { description, id, name } = this.role;
      this.dialogVisible = false;
      this.$notify({
        title: 'Success',
        dangerouslyUseHTMLString: true,
        message: `
            <div>角色ID: ${id}</div>
            <div>角色名称: ${name}</div>
            <div>角色简介: ${description}</div>
          `,
        type: 'success'
      });
    },
    // reference: src/view/layout/components/Sidebar/SidebarItem.vue
    onlyOneShowingChild(children = [], parent) {
      let onlyOneChild = null;
      const showingChildren = children.filter(
        item => !item.guard_name !== 'admin'
      );
      // When there is only one child route, the child route is displayed by default
      if (showingChildren.length === 1) {
        onlyOneChild = showingChildren[0];
        onlyOneChild.path = path.resolve(parent.url, onlyOneChild.url);
        return onlyOneChild;
      }

      // Show parent if there are no child route to display
      if (showingChildren.length === 0) {
        onlyOneChild = { ...parent, url: '', noShowingChildren: true };
        return onlyOneChild;
      }

      return false;
    }
  }
};
</script>

<style lang="scss" scoped>
.app-container {
  .roles-table {
    margin-top: 30px;
  }
  .permission-tree {
    margin-bottom: 30px;
  }
}
</style>
