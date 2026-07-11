const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-d2gq7l5vl2c158dd6' })
const db = cloud.database()

exports.main = async (event, context) => {
  const { action, data } = event

  try {
    switch (action) {
      case 'add': {
        if (!data || !data.userId || !data.province || !data.city) {
          return { success: false, msg: '打卡信息不完整' }
        }
        const res = await db.collection('checkIn').add({
          data: {
            userId: data.userId,
            province: data.province,
            city: data.city,
            image: data.image || '',
            desc: data.desc || '',
            createTime: new Date().toLocaleString()
          }
        })
        return { success: true, data: { id: res._id, ...data } }
      }
      case 'list': {
        if (!data || !data.userId) {
          return { success: false, msg: '用户ID不能为空' }
        }
        const res = await db.collection('checkIn').where({ userId: data.userId }).orderBy('createTime', 'desc').get()
        return { success: true, data: res.data.map(item => ({ ...item, id: item._id })) }
      }
      case 'get': {
        if (!data || !data.id) {
          return { success: false, msg: '记录ID不能为空' }
        }
        const res = await db.collection('checkIn').doc(data.id).get()
        return { success: true, data: { ...res.data, id: res.data._id } }
      }
      case 'delete': {
        if (!data || !data.id) {
          return { success: false, msg: '记录ID不能为空' }
        }
        await db.collection('checkIn').doc(data.id).remove()
        return { success: true, msg: '删除成功' }
      }
      default:
        return { success: false, msg: '未知操作' }
    }
  } catch (err) {
    return { success: false, msg: '服务器内部错误，请稍后重试' }
  }
}