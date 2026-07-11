const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-d2gq7l5vl2c158dd6' })
const db = cloud.database()

// 定义集合名
const COLLECTION_NAME = 'album'

exports.main = async (event, context) => {
  const { action, data } = event

  try {
    switch (action) {
      case 'add': {
        if (!data || !data.name || !data.uid) {
          return { success: false, msg: '相册名称和用户ID不能为空' }
        }
        if (data.name.length > 50) {
          return { success: false, msg: '相册名称不能超过50个字符' }
        }
        const res = await db.collection(COLLECTION_NAME).add({
          data: {
            name: data.name,
            uid: data.uid,
            fileList: data.fileList || [],
            photo_num: data.photo_num || 0,
            cover: data.cover || '',
            desc: data.desc || '',
            createTime: new Date().toLocaleString(),
            updateTime: new Date().toLocaleString()
          }
        })
        return { success: true, data: { id: res._id, ...data } }
      }
      case 'list': {
        if (!data || !data.uid) {
          return { success: false, msg: '用户ID不能为空' }
        }
        const res = await db.collection(COLLECTION_NAME).where({ uid: data.uid }).orderBy('createTime', 'desc').get()
        return { success: true, data: res.data.map(item => ({ ...item, id: item._id })) }
      }
      case 'get': {
        if (!data || !data.id) {
          return { success: false, msg: '相册ID不能为空' }
        }
        const res = await db.collection(COLLECTION_NAME).doc(data.id).get()
        return { success: true, data: { ...res.data, id: res.data._id } }
      }
      case 'update': {
        if (!data || !data.id) {
          return { success: false, msg: '相册ID不能为空' }
        }
        await db.collection(COLLECTION_NAME).doc(data.id).update({
          data: {
            name: data.name,
            fileList: data.fileList,
            photo_num: data.photo_num,
            cover: data.cover,
            desc: data.desc,
            updateTime: new Date().toLocaleString()
          }
        })
        return { success: true, msg: '更新成功' }
      }
      case 'updateCover': {
        if (!data || !data.id) {
          return { success: false, msg: '相册ID不能为空' }
        }
        await db.collection(COLLECTION_NAME).doc(data.id).update({
          data: { cover: data.cover, updateTime: new Date().toLocaleString() }
        })
        return { success: true, msg: '封面更新成功' }
      }
      case 'delete': {
        if (!data || !data.id) {
          return { success: false, msg: '相册ID不能为空' }
        }
        await db.collection(COLLECTION_NAME).doc(data.id).remove()
        return { success: true, msg: '删除成功' }
      }
      default:
        return { success: false, msg: '未知操作' }
    }
  } catch (err) {
    return { success: false, msg: '服务器内部错误，请稍后重试' }
  }
}