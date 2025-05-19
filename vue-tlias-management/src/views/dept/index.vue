<script setup>
import {ref, onMounted} from 'vue'
import { queryAllApi ,addApi,queryByIdApi,updateApi, deleteByIdApi } from '@/api/dept'
import { ElMessage, ElMessageBox } from 'element-plus'
import { el } from 'element-plus/es/locale/index'

//声明列表展示数据
let deptList= ref([])

const showDialog = ref(false)
// 表单数据
const deptForm = ref({name: ''})

const formTitle = ref('')
//新增部门
const add = () => {
  formTitle.value = '新增部门'
  showDialog.value = true
  deptForm.value = {name: ''}  //清空表单数据
  // 重置表单校验
  if (deptFormRef.value){
    deptFormRef.value .resetFields()
  }
}

// 表单验证规则
const formRules = ref({
  name: [
    { required: true, message: '请输入部门名称', trigger: 'blur' },
    { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
  ]
})
// 表单引用
const deptFormRef = ref()
//提交表单
const save = async() => {
  await deptFormRef.value.validate(async valid=>{  //valid为true时表单验证通过
    if (!valid) return
    // 提交表单
    let result = null;
    if(deptForm.value.id){
      result = await updateApi(deptForm.value) // 修改
    }else {
      result = await addApi(deptForm.value) // 新增
    }
    if(result.code){
      //提示信息
      ElMessage.success('操作成功')
      //关闭对话框
      showDialog.value = false
      //刷新列表
      queryAll()
    }else{
      ElMessage.error('操作失败')
    }

  })
  showDialog.value = false
}


//动态加载数据-查询部门
const queryAll = async () => {
  const result = await queryAllApi()
  deptList.value = result.data
}

//钩子函数
onMounted(() => {
  queryAll()
})

// 编辑部门 - 根据ID查询回显数据
const Edit = async(id) => {
  formTitle.value = '编辑部门'
  // 重置表单校验
  if (deptFormRef.value){
    deptFormRef.value .resetFields()
  }
  const result = await queryByIdApi(id)
  if (result.code) {
    showDialog.value = true
    deptForm.value = result.data
  }
};

// 删除部门 - 根据ID删除部门
const Delete = (id) => {
  // 在这里实现删除功能
  ElMessageBox.confirm('此操作将永久删除该文件, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async() => {
    // 删除部门
    const result = await deleteByIdApi(id)
    if (result.code) {
      ElMessage.success('删除成功')
      queryAll()
    }
  })
};
</script>

<template>
  <h1>部门管理</h1>
  <el-button type="primary" @click="add()" style="float: right;"> + 新增部门</el-button> <br><br>

  <!-- <el-button plain @click="add()">新增部门</el-button> -->

  <!-- 表格 -->
  <el-table :data="deptList" border style="width: 100%;">
    <el-table-column type="index" label="序号" width="100" align="center"/>
    <el-table-column prop="name" label="部门名称" width="300" align="center"/>
    <el-table-column prop="updateTime" label="最后修改时间" width="300" align="center"/>
    <el-table-column fixed="right" label="操作" align="center">
      <template #default="scope">
        <el-button size="small" @click="Edit(scope.row.id)">修改</el-button>
        <el-button size="small" type="danger" @click="Delete(scope.row.id)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>

  <!-- 对话框 -->
  <el-dialog v-model="showDialog" :title="formTitle" width="500">
    <el-form :model="deptForm" :rules="formRules" ref="deptFormRef">
      <el-form-item label="部门名称" :label-width="formLabelWidth" prop="name">
        <el-input v-model="deptForm.name" autocomplete="off" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="save()">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>

</style>