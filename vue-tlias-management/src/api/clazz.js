import request from "@/utils/request"

//查询班级列表数据
export const queryPageApi = (name,begin,end,page,pageSize) => 
  request.get(`/clazzs?name=${name}&begin=${begin}&end=${end}&page=${page}&pageSize=${pageSize}`)

//删除
export const deleteByIdApi = (id) =>  request.delete(`/clazzs/`+id);

//新增
export const addApi = (clz) =>  request.post('/clazzs', clz);

//修改
export const updateApi = (clz) =>  request.put('/clazzs', clz);

//根据ID查询
export const queryByIdApi = (id) =>  request.get(`/clazzs/${id}`);

//查询所有班级
export const queryAllApi = () =>  request.get(`/clazzs/list`);