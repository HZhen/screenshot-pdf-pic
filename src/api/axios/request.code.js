/**
 * MDT 接口返回code 码
 * @type {number}
 */
// 请求成功
export const CODE_SUCCESS = [200,201]
export const CODE_SUCCESS_INFO = [
  { code: 200,message:''},
  { code: 201,message:''},
]
// 请求成功无内容
export const CODE_NO_CONTENT = 204
// token 无效
export const CODE_TOKEN_INVALID = 110006
// 无效请求且token没传
export const CODE_QUEST_INVALID = [401,404]
export const CODE_QUEST_INVALID_INFO = [
  { code: 401,message:''},
  { code: 404,message:''}
]
