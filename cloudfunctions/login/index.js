const cloud = require('wx-server-sdk')
const crypto = require('crypto')
cloud.init({ env: 'cloud1-d2gq7l5vl2c158dd6' })
const db = cloud.database()

// 简单哈希函数
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex')
}

exports.main = async (event, context) => {
  const { action, data } = event
  const openid = cloud.getWXContext().OPENID

  try {
    switch (action) {
      case 'register': {
        if (!data || !data.username || !data.password) {
          return { success: false, msg: '用户名和密码不能为空' }
        }
        if (data.username.length < 2 || data.username.length > 20) {
          return { success: false, msg: '用户名长度需在2-20个字符之间' }
        }
        if (data.password.length < 6) {
          return { success: false, msg: '密码长度不能少于6位' }
        }
        const { username, password, avatar } = data
        const exist = await db.collection('users').where({ username }).get()
        if (exist.data.length > 0) {
          return { success: false, msg: '用户名已存在' }
        }
        const res = await db.collection('users').add({
          data: {
            username,
            password: hashPassword(password),
            avatar: avatar || '',
            openid,
            createTime: new Date().toLocaleString()
          }
        })
        return { success: true, msg: '注册成功', data: { id: res._id, username, avatar } }
      }
      case 'login': {
        if (!data || !data.username || !data.password) {
          return { success: false, msg: '用户名和密码不能为空' }
        }
        const { username, password } = data
        // 先用哈希密码查找（新用户）
        let res = await db.collection('users').where({
          username,
          password: hashPassword(password)
        }).get()
        // 兼容旧数据：明文密码查找
        if (res.data.length === 0) {
          res = await db.collection('users').where({ username, password }).get()
          // 如果明文匹配成功，更新为哈希密码
          if (res.data.length > 0) {
            const user = res.data[0]
            await db.collection('users').doc(user._id).update({
              data: { password: hashPassword(password) }
            })
          }
        }
        if (res.data.length === 0) {
          return { success: false, msg: '用户名或密码错误' }
        }
        const user = res.data[0]
        return { success: true, msg: '登录成功', data: { id: user._id, username: user.username, avatar: user.avatar } }
      }
      case 'getUser': {
        if (!data || !data.id) {
          return { success: false, msg: '用户ID不能为空' }
        }
        const res = await db.collection('users').where({ _id: data.id }).get()
        if (res.data.length === 0) {
          return { success: false, msg: '用户不存在' }
        }
        return { success: true, data: res.data[0] }
      }
      case 'updateUser': {
        if (!data || !data.id) {
          return { success: false, msg: '用户ID不能为空' }
        }
        const { id, username, avatar } = data
        const updateData = { avatar }
        if (username) updateData.username = username
        await db.collection('users').doc(id).update({
          data: updateData
        })
        return { success: true, msg: '更新成功' }
      }
      case 'deleteUser': {
        if (!data || !data.id) {
          return { success: false, msg: '用户ID不能为空' }
        }
        await db.collection('users').doc(data.id).remove()
        return { success: true, msg: '删除成功' }
      }
      default:
        return { success: false, msg: '未知操作' }
    }
  } catch (err) {
    return { success: false, msg: '服务器内部错误，请稍后重试' }
  }
}