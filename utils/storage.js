export const setUser = (user) => wx.setStorageSync('userInfo', user)
export const getUser = () => wx.getStorageSync('userInfo') || null
export const clearUser = () => wx.removeStorageSync('userInfo')

export function getUUID() {
  return Date.now().toString() + Math.random().toString(36).slice(2,8)
}

// ========== 统一云函数调用封装 ==========
const callCloud = async (name, data) => {
  try {
    const res = await wx.cloud.callFunction({ name, data })
    return res.result || { success: false, msg: '云函数返回为空' }
  } catch (err) {
    console.error(`callCloud [${name}] error:`, err)
    return { success: false, msg: '网络异常，请检查网络连接后重试' }
  }
}

// ========== 云开发 API ==========

// 用户相关
export const cloudRegister = async (username, password, avatar) => {
  if (!username || !password) return { success: false, msg: '用户名和密码不能为空' }
  return callCloud('login', { action: 'register', data: { username, password, avatar } })
}

export const cloudLogin = async (username, password) => {
  if (!username || !password) return { success: false, msg: '用户名和密码不能为空' }
  return callCloud('login', { action: 'login', data: { username, password } })
}

export const cloudGetUser = async (id) => {
  if (!id) return { success: false, msg: '用户ID不能为空' }
  return callCloud('login', { action: 'getUser', data: { id } })
}

export const cloudUpdateUser = async (id, username, avatar) => {
  if (!id) return { success: false, msg: '用户ID不能为空' }
  return callCloud('login', { action: 'updateUser', data: { id, username, avatar } })
}

// 相册相关
export const cloudAddAlbum = async (data) => {
  if (!data || !data.name || !data.uid) return { success: false, msg: '相册名称和用户不能为空' }
  return callCloud('album', { action: 'add', data })
}

export const cloudGetAlbumList = async (uid) => {
  if (!uid) return { success: false, msg: '用户ID不能为空' }
  return callCloud('album', { action: 'list', data: { uid } })
}

export const cloudGetAlbum = async (id) => {
  if (!id) return { success: false, msg: '相册ID不能为空' }
  return callCloud('album', { action: 'get', data: { id } })
}

export const cloudUpdateAlbum = async (data) => {
  if (!data || !data.id) return { success: false, msg: '相册ID不能为空' }
  return callCloud('album', { action: 'update', data })
}

export const cloudUpdateAlbumCover = async (id, cover) => {
  if (!id) return { success: false, msg: '相册ID不能为空' }
  return callCloud('album', { action: 'updateCover', data: { id, cover } })
}

export const cloudDeleteAlbum = async (id) => {
  if (!id) return { success: false, msg: '相册ID不能为空' }
  return callCloud('album', { action: 'delete', data: { id } })
}

// 回收站相关
export const cloudAddRecycle = async (data) => {
  if (!data || !data.uid || !data.type) return { success: false, msg: '参数不完整' }
  return callCloud('recycle', { action: 'add', data })
}

export const cloudGetRecycleList = async (uid) => {
  if (!uid) return { success: false, msg: '用户ID不能为空' }
  return callCloud('recycle', { action: 'list', data: { uid } })
}

export const cloudRestoreRecycle = async (id) => {
  if (!id) return { success: false, msg: '记录ID不能为空' }
  return callCloud('recycle', { action: 'restore', data: { id } })
}

export const cloudDeleteRecycle = async (id) => {
  if (!id) return { success: false, msg: '记录ID不能为空' }
  return callCloud('recycle', { action: 'delete', data: { id } })
}

export const cloudClearRecycle = async (uid) => {
  if (!uid) return { success: false, msg: '用户ID不能为空' }
  return callCloud('recycle', { action: 'clear', data: { uid } })
}

// 打卡相关
export const cloudAddCheckIn = async (data) => {
  if (!data || !data.userId || !data.province || !data.city) return { success: false, msg: '打卡信息不完整' }
  return callCloud('checkIn', { action: 'add', data })
}

export const cloudGetCheckInList = async (userId) => {
  if (!userId) return { success: false, msg: '用户ID不能为空' }
  return callCloud('checkIn', { action: 'list', data: { userId } })
}

export const cloudGetCheckIn = async (id) => {
  if (!id) return { success: false, msg: '记录ID不能为空' }
  return callCloud('checkIn', { action: 'get', data: { id } })
}

export const cloudDeleteCheckIn = async (id) => {
  if (!id) return { success: false, msg: '记录ID不能为空' }
  return callCloud('checkIn', { action: 'delete', data: { id } })
}