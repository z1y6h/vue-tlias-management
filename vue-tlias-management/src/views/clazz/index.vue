<script setup>
import { ref, watch, onMounted } from 'vue'
import { queryPageApi,deleteByIdApi,addApi,updateApi,queryByIdApi   } from '@/api/clazz'
import { ElMessage, ElMessageBox } from 'element-plus'
import { queryAllemp  } from '@/api/emp'

const clazzList = ref([])
const showDialog = ref(false)

//学科列表数据
const subjects = ref([
  { name: 'java', value: 1 },
  { name: '前端', value: 2 },
  { name: '大数据', value: 3 },
  { name: 'python', value: 4 },
  { name: 'go', value: 5 },
  { name: '嵌入式', value: 6 }
])
// 表单数据
const clazzForm = ref({
  name: '',
  room: '',
  beginDate: '',
  endDate: '',
  masterId: '',
  subject: '',
})
// 表单引用
const clazzFormRef = ref()
const formTitle = ref('')

//员工列表数据
const empList = ref([])

//查询班级表单的条件数据
const searchClazz = ref({
  name: '',
  date: [],
  begin: '',
  end: ''
})

//侦听searchClazz中的date属性
watch(
  () => searchClazz.value.date,
  (newValue, oldValue) => {
     if(newValue.length == 2){
      searchClazz.value.begin = newValue[0]
      searchClazz.value.end = newValue[1]
     }else {
      searchClazz.value.begin = ''
      searchClazz.value.end = ''
     }
  }
)

onMounted(async() => {
  //getToken(); //获取token
  search()
  //加载所有员工数据
  const result = await queryAllemp();
  if(result.code){
    empList.value = result.data
  }
})


//查询班级
const search= async () => {
  console.log('Search:', searchClazz.value)
  const result = await queryPageApi(searchClazz.value.name, searchClazz.value.begin, searchClazz.value.end, currentPage.value, pageSize.value);
  if(result.code){
    clazzList.value = result.data.rows  // 从后台返回的分页数据中获取员工信息
    total.value = result.data.total  // 从后台返回的分页数据中获取总条数
  }
}

const clear = () => {
  // 清空表单
  searchClazz.value = {
    name: '',
    date: [],
    begin: '',
    end: ''
  }
  search()
}

// 分页配置
const currentPage = ref(1)  // 当前页码
const pageSize = ref(10)  // 每页条数
const total = ref(0)  // 总条数

// 每页展示记录数变化时触发
const handleSizeChange = (val) => {
  search()
}
// 当前页码变化时触发
const handleCurrentChange = (val) => {
  search()
}


// 删除班级 - 根据ID删除班级
const Delete = (id) => {
  // 在这里实现删除功能
  ElMessageBox.confirm('此操作将永久删除该班级, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async() => {
    // 删除班级
    const result = await deleteByIdApi(id)
    if (result.code) {
      ElMessage.success('删除成功')
      search()
    }
  })
};


//新增班级
const add = () => {
  formTitle.value = '新增班级'
  showDialog.value = true
  clazzForm.value = {name: ''}  //清空表单数据
  // 重置表单校验
  if (clazzFormRef.value){
    clazzFormRef.value .resetFields()
  }
}

// 表单验证规则
const formRules = ref({
  name: [
    { required: true, message: '请输入班级名称', trigger: 'blur' },
    { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
  ],
  room: [
    { required: true, message: '请输入教室', trigger: 'blur' },
    { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
  ],
  beginDate: [
    { required: true, message: '请输入开课时间', trigger: 'blur' },
  ],
  endDate: [
    { required: true, message: '请输入结课时间', trigger: 'blur' },
  ],
  masterId: [
    { required: false, message: '请选择班主任', trigger: 'blur' },
  ],
  subject: [
    { required: true, message: '请选择学科', trigger: 'blur' },
  ]
})

//提交表单
const save = async() => {
  await clazzFormRef.value.validate(async valid=>{  //valid为true时表单验证通过
    if (!valid) return
    // 提交表单
    let result = null;
    if(clazzForm.value.id){
      result = await updateApi(clazzForm.value) // 修改
    }else {
      result = await addApi(clazzForm.value) // 新增
    }
    if(result.code){
      //提示信息
      ElMessage.success('操作成功')
      //关闭对话框
      showDialog.value = false
      //刷新列表
      search()
    }else{
      ElMessage.error('操作失败')
    }

  })
  showDialog.value = false
}

// 编辑部门 - 根据ID查询回显数据
const Edit = async(id) => {
  formTitle.value = '编辑班级'
  // 重置表单校验
  if (clazzFormRef.value){
    clazzFormRef.value .resetFields()
  }
  const result = await queryByIdApi(id)  //查询回显
  if (result.code) {
    showDialog.value = true
    clazzForm.value = result.data
  }
};


</script>

<template>
  <h1>班级管理</h1>

  <el-form :inline="true" :model="searchClazz">
    <el-form-item label="班级名称">
      <el-input v-model="searchClazz.name" placeholder="请输入班级"></el-input>
    </el-form-item>

    <el-form-item label="结课时间">
      <el-date-picker
        v-model="searchClazz.date"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="YYYY-MM-DD"
      ></el-date-picker>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="search">查询</el-button>
      <el-button @click="clear">清空</el-button>
    </el-form-item>
  </el-form>


  <el-button type="primary" @click="add()" style="float: right;"> + 新增班级</el-button> <br><br>

  <!-- 表格 -->
  <el-table :data="clazzList" border style="width: 100%;">
    <el-table-column type="index" label="序号" width="70" align="center"/>
    <el-table-column prop="name" label="班级名称" width="150" align="center"/>
    <el-table-column prop="room" label="班级教室" width="80" align="center"/>
    <el-table-column prop="masterName" label="班主任姓名" width="100" align="center"/>
    <el-table-column prop="beginDate" label="开课时间" width="200" align="center"/>
    <el-table-column prop="endDate" label="结课时间" width="200" align="center"/>
    <el-table-column prop="status" label="状态" width="100" align="center"/>
    <el-table-column prop="updateTime" label="最后修改时间" width="200" align="center"/>
    <el-table-column fixed="right" label="操作" align="center">
      <template #default="scope">
        <el-button size="small" @click="Edit(scope.row.id)">修改</el-button>
        <el-button size="small" type="danger" @click="Delete(scope.row.id)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>

  <!-- 分页条 -->
  <el-pagination
  @size-change="handleSizeChange"  
  @current-change="handleCurrentChange"
  v-model:current-page="currentPage"
  v-model:page-size="pageSize"
  :page-sizes="[5, 10, 20, 30, 40]"
  layout="total, sizes, prev, pager, next, jumper"
  :total="total"
  >
  </el-pagination>

  <!-- 对话框 -->
  <el-dialog v-model="showDialog" :title="formTitle" width="500">
    <el-form :model="clazzForm" :rules="formRules" ref="clazzFormRef">
      <!-- 第一行 -->
      <el-row :gutter="20">
        <el-col >
          <el-form-item label="班级名称" :label-width="formLabelWidth" prop="name">
            <el-input v-model="clazzForm.name" placeholder="请输入班级名称，2-20个字"></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 第二行 -->
      <el-row :gutter="20">
        <el-col >
          <el-form-item label="班级教室" :label-width="formLabelWidth" prop="room">
            <el-input v-model="clazzForm.room" placeholder="请输入班级教室"></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 第三行 -->
      <el-row :gutter="20">
        <el-col >
          <el-form-item label="开课时间" :label-width="formLabelWidth">
            <el-date-picker v-model="clazzForm.beginDate" type="date" style="width: 100%;" placeholder="选择日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD"></el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 第四行 -->
      <el-row :gutter="20">
        <el-col >
          <el-form-item label="结课时间" :label-width="formLabelWidth">
            <el-date-picker v-model="clazzForm.endDate" type="date" style="width: 100%;" placeholder="选择日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD"></el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 第五行 -->
      <el-row :gutter="20">
        <el-col >
          <el-form-item label="班主任" :label-width="formLabelWidth">
            <el-select v-model="clazzForm.masterId" placeholder="请选择班主任" style="width: 100%;">
              <el-option v-for="emp in empList" :key="emp.name" :label="emp.name" :value="emp.id"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 第六行 -->
      <el-row :gutter="20">
        <el-col >
          <el-form-item label="学科" :label-width="formLabelWidth">
            <el-select v-model="clazzForm.subject" placeholder="请选择学科" style="width: 100%;">
              <el-option v-for="sbj in subjects" :key="sbj.name" :label="sbj.name" :value="sbj.value"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      

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