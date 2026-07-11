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
        const res = await db.collection(COLLECTION_NAME).add({  // ⚠️ 改成 COLLECTION_NAME
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
        const res = await db.collection(COLLECTION_NAME).where({ uid: data.uid }).orderBy('createTime', 'desc').get()  // ⚠️ 改成 COLLECTION_NAME
        return { success: true, data: res.data.map(item => ({ ...item, id: item._id })) }
      }
      case 'get': {
        const res = await db.collection(COLLECTION_NAME).doc(data.id).get()  // ⚠️ 改成 COLLECTION_NAME
        return { success: true, data: { ...res.data, id: res.data._id } }
      }
      case 'update': {
        await db.collection(COLLECTION_NAME).doc(data.id).update({  // ⚠️ 改成 COLLECTION_NAME
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
        await db.collection(COLLECTION_NAME).doc(data.id).update({  // ⚠️ 改成 COLLECTION_NAME
          data: { cover: data.cover, updateTime: new Date().toLocaleString() }
        })
        return { success: true, msg: '封面更新成功' }
      }
      case 'delete': {
        await db.collection(COLLECTION_NAME).doc(data.id).remove()  // ⚠️ 改成 COLLECTION_NAME
        return { success: true, msg: '删除成功' }
      }
      default:
        return { success: false, msg: '未知操作' }
    }
  } catch (err) {
    return { success: false, msg: err.message }
  }
}