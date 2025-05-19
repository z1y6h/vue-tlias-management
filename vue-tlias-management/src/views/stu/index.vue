<script setup>
import { ref, onMounted } from 'vue'
import { queryAllApi as queryClazzAll } from '@/api/clazz'
import { queryPageApi,updateApi,addApi,queryInfoApi,deleteApi,violationApi } from '@/api/stu'
import { ElMessage, ElMessageBox } from 'element-plus'






const degree = ref([
  { name: '初中', value: 1 },
  { name: '高中', value: 2 },
  { name: '大专', value: 3 },
  { name: '本科', value: 4 },
  { name: '硕士', value: 5 },
  { name: '博士', value: 6 }
])

const searchStu = ref({
  name: '',
  degree: '',
  clazzId: ''
})

const clazzList = ref([])  //存储班级数据

const stuList = ref([])  //存储后端返回的学员数据

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


//查询学员
const search= async () => {
  console.log('Search:', searchStu.value)
  const result = await queryPageApi(searchStu.value.name, searchStu.value.degree, searchStu.value.clazzId, currentPage.value, pageSize.value);
  if(result.code){
    stuList.value = result.data.rows  // 从后台返回的分页数据中获取员工信息
    total.value = result.data.total  // 从后台返回的分页数据中获取总条数
  }
}

const clear = () => {
  // 清空表单
  searchStu.value = {
    name: '',
    degree: '',
    clazzId: ''
  }
  search()
}







onMounted(async() => {
  search()
  //加载所有班级数据
  const result = await queryClazzAll();
  if(result.code){
    clazzList.value = result.data
  }
})

// 新增员工
// 控制弹窗
const dialogVisible = ref(false)
const dialogTitle = ref('新增员工')
//新增/修改表单
const studentFormRef = ref(null)
//存储新增/修改学员信息
const student = ref({
  name: '',
  no:'',
  gender: '',
  phone: '',
  degree: '',
  clazzId: '',
  idCard: '',
  isCollege: '',
  address: '',
  graduationDate:''
})
//性别列表数据
const genders = ref([{ name: '男', value: 1 }, { name: '女', value: 2 }])
//院校列表数据
const college = ref([{ name: '是', value: 1 }, { name: '否', value: 2 }])
const addStu = () => {
  dialogVisible.value = true
  dialogTitle.value = '新增学员'

  //清空表单内容及校验提示信息
  student.value = {
    name: '',
    no:'',
    gender: '',
    phone: '',
    degree: '',
    clazzId: '',
    idCard: '',
    isCollege: '',
    address: '',
    graduationDate:''
  }
  if(studentFormRef.value){
      studentFormRef.value.resetFields()
  }
}

//表单校验规则
// 验证规则
const rules = ref({
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 10, message: '姓名长度应在2到10个字符之间', trigger: 'blur' }
  ],
  no: [
    { required: true, message: '请输入学号', trigger: 'blur' },
    { min: 2, max: 10, message: '学号长度应在2到10个字符之间', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1\d{10}$/g, message: '请输入有效的手机号', trigger: 'blur' }
  ],
  idCard: [
    { required: true, message: '请输入身份证号', trigger: 'blur' },
    { pattern: /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/, message: '请输入有效的身份证号', trigger: 'blur' }
  ],
  idCollege:[
    { required: true, message: '请选择是否为学院学生', trigger: 'change' }
  ]
});

//保存/修改学员信息
const save = async () => {
  //表单校验
  if(!studentFormRef.value) return;
  studentFormRef.value.validate(async (valid) => { //valid 表示是否校验通过: true 通过 / false  不通过
    if(valid){ //通过
      let result;
      if(student.value.id){ //修改
        result = await updateApi(student.value);
      }else { //新增
        result = await addApi(student.value);
      }
      
      if(result.code) {//成功
        ElMessage.success('保存成功');
        dialogVisible.value = false;
        search();
      }else { //失败了
        ElMessage.error(result.msg);
      }
    }else { //不通过
      ElMessage.error('表单校验不通过');
    }
  })
}

//修改
const edit = async (id) => {
  const result = await queryInfoApi(id);
  if(result.code){
    dialogVisible.value = true;
    dialogTitle.value = '修改学员';
    student.value = result.data;
  }
}

//删除员工
const deleteById = (id) => {
  //弹出确认框
  ElMessageBox.confirm('您确认删除该员工吗?','提示',
    { confirmButtonText: '确认',cancelButtonText: '取消',type: 'warning'}
  ).then(async () => { //确认
    const result = await deleteApi(id);
    if(result.code){
      ElMessage.success('删除成功');
      search();
    }else{
      ElMessage.error(result.msg);
    }
  }).catch(() => { //取消
    ElMessage.info('您已取消删除');
  })
}

//记录勾选的学员的id
const selectedIds = ref([]);
//复选框勾选发生变化时触发 - selection: 当前选中的记录 (数组)
const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map( item => item.id);
}

//批量删除
const deleteByIds = () => {
  //弹出确认框
  ElMessageBox.confirm('您确认删除该员工吗?','提示',
    { confirmButtonText: '确认',cancelButtonText: '取消',type: 'warning'}
  ).then(async () => { //确认
    if(selectedIds.value && selectedIds.value.length > 0){
      const result = await deleteApi(selectedIds.value);
      if(result.code){
        ElMessage.success('删除成功');
        search();
      }else{
        ElMessage.error(result.msg);
      }
    }else {
      ElMessage.info('您没有选择任何要删除的数据');
    }
  }).catch(() => { //取消
    ElMessage.info('您已取消删除');
  })
}

// 违纪
// 控制弹窗
const dialogVisible2 = ref(false)
const score =  ref({
  id: null,
  score: ''
})
const violation = async (id) => { 
  score.value.id = id
  dialogVisible2.value = true
}

const cutScore = async () => { 
  // 确保扣分值输入有效
  if (!score.value.score || isNaN(score.value.score)) {
    ElMessage.error('请输入有效的扣分值');
    return;
  }

  const result = await violationApi(score.value.id,score.value.score);
  if(result.code){
    ElMessage.success('扣分成功');
    search();
  }else{
    ElMessage.error(result.msg);
  }
  dialogVisible2.value = false;
}


</script>

<template>
  <h1>学员管理</h1> <br>

  <el-form :inline="true" :model="searchStu">
    <el-form-item label="姓名">
      <el-input v-model="searchStu.name" placeholder="请输入学员姓名"></el-input>
    </el-form-item>

    <el-form-item label="最高学历" >
      <el-select v-model="searchStu.degree" placeholder="请选择" style="width: 100%;">
        <el-option label="初中" value="1"></el-option>
        <el-option label="高中" value="2"></el-option>
        <el-option label="大专" value="3"></el-option>
        <el-option label="本科" value="4"></el-option>
        <el-option label="硕士" value="5"></el-option>
        <el-option label="博士" value="6"></el-option>
      </el-select>
    </el-form-item>

    <el-form-item label="所属班级" >
      <el-select v-model="searchStu.clazzId" placeholder="请选择" style="width: 100%;">
        <el-option v-for="clz in clazzList" :key="clz.name" :label="clz.name" :value="clz.id"></el-option>
      </el-select>
    </el-form-item>


    <el-form-item>
      <el-button type="primary" @click="search">查询</el-button>
      <el-button @click="clear">清空</el-button>
    </el-form-item>
  </el-form>

  <!-- 功能按钮 -->
  <el-button type="primary" @click="addStu"> + 新增学员</el-button>
  <el-button type="danger" @click="deleteByIds"> - 批量删除</el-button>
  <br><br>

  <!-- 表格 -->
  <el-table :data="stuList" border style="width: 100%" @selection-change="handleSelectionChange">
    <el-table-column type="selection" width="40" align="center"></el-table-column>
    <el-table-column prop="name" label="姓名" width="60" align="center"></el-table-column>
    <el-table-column prop="no" label="学号" width="120" align="center"></el-table-column>
    <el-table-column prop="clazzName" label="班级" width="150" align="center"></el-table-column>
    <el-table-column label="性别" width="50" align="center">
      <template #default="scope" >
        {{ scope.row.gender == 1 ? '男' : '女' }}
      </template>
    </el-table-column>
    <el-table-column prop="phone" label="手机号" width="120" align="center"></el-table-column>
    <el-table-column label="最高学历" width="100" align="center">
      <template #default="scope">
          <span v-if="scope.row.degree == 1">初中</span>
          <span v-else-if="scope.row.degree == 2">高中</span>
          <span v-else-if="scope.row.degree == 3">大专</span>
          <span v-else-if="scope.row.degree == 4">本科</span>
          <span v-else-if="scope.row.degree == 5">硕士</span>
          <span v-else-if="scope.row.degree == 6">博士</span>
        </template>
    </el-table-column>
    <el-table-column prop="violationCount" label="违纪次数" width="90" align="center"></el-table-column>
    <el-table-column prop="violationScore" label="违纪扣分" width="90" align="center"></el-table-column> 
    <el-table-column prop="updateTime" label="最后操作时间" width="210" align="center"></el-table-column>
    <el-table-column label="操作" fixed="right" align="center">
      <template #default="scope">
        <el-button size="small" type="primary" @click="edit(scope.row.id)">编辑</el-button>
        <el-button size="small" type="warning" @click="violation(scope.row.id)">违纪</el-button>
        <el-button size="small" type="danger" @click="deleteById(scope.row.id)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>

  <br>

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


  <!-- 新增/修改学员的对话框 -->
  <el-dialog v-model="dialogVisible" :title="dialogTitle">
    <el-form ref="studentFormRef" :model="student" :rules="rules" label-width="80px">
      <!-- 基本信息 -->
      <!-- 第一行 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="姓名" prop="name">
            <el-input v-model="student.name" placeholder="请输入学员姓名"></el-input>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="学号" prop="no">
            <el-input v-model="student.no" placeholder="请输入学员学号"></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 第二行 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="性别" prop="gender">
            <el-select v-model="student.gender" placeholder="请选择性别" style="width: 100%;">
              <el-option v-for="gender in genders" :key="gender.name" :label="gender.name" :value="gender.value"></el-option>
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="student.phone" placeholder="请输入员工手机号"></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 第三行 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="身份证号">
            <el-input v-model="student.idCard" placeholder="请输入身份证号码："></el-input>
          </el-form-item>
        </el-col>


        <el-col :span="12">
          <el-form-item label="是否院校">
            <el-select v-model="student.isCollege"  style="width: 100%;">
              <el-option v-for="clg in college" :key="clg.name" :label="clg.name" :value="clg.value"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 第四行 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="联系地址">
            <el-input v-model="student.address" placeholder="请输入联系地址："></el-input>
          </el-form-item>
        </el-col>


        <el-col :span="12">
          <el-form-item label="最高学历">
            <el-select v-model="student.degree" placeholder="请选择你的最高学历" style="width: 100%;">
              <!-- <el-option v-for="degree in degree" :key="degree.id" :label="degree.name" :value="degree.id"></el-option> -->
              <el-option label="初中" value="1"></el-option>
              <el-option label="高中" value="2"></el-option>
              <el-option label="大专" value="3"></el-option>
              <el-option label="本科" value="4"></el-option>
              <el-option label="硕士" value="5"></el-option>
              <el-option label="博士" value="6"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 第五行 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="毕业时间">
            <el-date-picker v-model="student.graduationDate" type="date" style="width: 100%;" placeholder="选择日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD"></el-date-picker>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="所属班级">
            <el-select v-model="student.clazzId" placeholder="请选择你的班级" style="width: 100%;">
            <el-option v-for="clz in clazzList" :key="clz.name" :label="clz.name" :value="clz.id"></el-option>            </el-select>
          </el-form-item>
        </el-col>

      </el-row>
      
      
    </el-form>
    
      <!-- 底部按钮 -->
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="save">保存</el-button>
        </span>
      </template>

  </el-dialog>

  <!-- 违纪处分对话框 -->
  <el-dialog v-model="dialogVisible2" title="违纪处分" width="500">
    <el-form :model="score">
      <el-form-item label="请输入违纪扣分"  prop="score">
        <el-input v-model="score.score" autocomplete="off" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible2 = false">取消</el-button>
        <el-button type="primary" @click="cutScore">确定</el-button>
      </div>
    </template>
  </el-dialog>
  




</template>

<style scoped>

</style>