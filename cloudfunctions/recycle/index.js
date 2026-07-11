const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-d2gq7l5vl2c158dd6' })
const db = cloud.database()

exports.main = async (event, context) => {
  const { action, data } = event

  try {
    switch (action) {
      case 'add': {
        if (!data || !data.uid || !data.type || !data.item) {
          return { success: false, msg: '参数不完整' }
        }
        if (data.type !== 'album' && data.type !== 'img') {
          return { success: false, msg: '无效的删除类型' }
        }
        const res = await db.collection('recycle').add({
          data: {
            uid: data.uid,
            type: data.type,
            item: data.item,
            deleteTime: new Date().toLocaleString(),
            expireTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleString()
          }
        })
        return { success: true, data: { id: res._id } }
      }
      case 'list': {
        if (!data || !data.uid) {
          return { success: false, msg: '用户ID不能为空' }
        }
        const res = await db.collection('recycle').where({ uid: data.uid }).orderBy('deleteTime', 'desc').get()
        return { success: true, data: res.data.map(item => ({ ...item, id: item._id })) }
      }
      case 'restore': {
        if (!data || !data.id) {
          return { success: false, msg: '记录ID不能为空' }
        }
        await db.collection('recycle').doc(data.id).remove()
        return { success: true, msg: '恢复成功' }
      }
      case 'delete': {
        if (!data || !data.id) {
          return { success: false, msg: '记录ID不能为空' }
        }
        await db.collection('recycle').doc(data.id).remove()
        return { success: true, msg: '删除成功' }
      }
      case 'clear': {
        if (!data || !data.uid) {
          return { success: false, msg: '用户ID不能为空' }
        }
        await db.collection('recycle').where({ uid: data.uid }).remove()
        return { success: true, msg: '清空成功' }
      }
      default:
        return { success: false, msg: '未知操作' }
    }
  } catch (err) {
    return { success: false, msg: '服务器内部错误，请稍后重试' }
  }
}