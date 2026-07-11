import { getUser, setUser, cloudUpdateUser } from '../../utils/storage.js'
Page({
  data: {
    userInfo: {},
    newName: '',
    newMail: '',
    oldPwd: '',
    newPwd: ''
  },
  onLoad() {
    const user = getUser()
    if (!user) {
      wx.showToast({ title: "请先登录", icon: "none" })
      setTimeout(() => wx.navigateBack(), 1000)
      return
    }
    this.setData({
      userInfo: user,
      newName: user.username,
      newMail: user.email
    })
  },
  changeAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album'],
      success: res => {
        const avatar = res.tempFiles[0].tempFilePath
        const user = this.data.userInfo
        user.avatar = avatar
        this.setData({ userInfo: user })
        wx.showToast({ title: "头像预览已更新", icon: "none" })
      }
    })
  },
  inputName(e) {
    this.setData({ newName: e.detail.value.trim() })
  },
  inputMail(e) {
    this.setData({ newMail: e.detail.value.trim() })
  },
  inputOldPwd(e) {
    this.setData({ oldPwd: e.detail.value })
  },
  inputNewPwd(e) {
    this.setData({ newPwd: e.detail.value })
  },
  async saveUserInfo() {
    const { userInfo, newName, newMail, oldPwd, newPwd } = this.data
    let user = JSON.parse(JSON.stringify(userInfo))

    if (!newName) {
      return wx.showToast({ title: "用户名不能为空", icon: 'none' })
    }
    const mailReg = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
    if (!mailReg.test(newMail)) {
      return wx.showToast({ title: "邮箱格式不正确", icon: 'none' })
    }

    if (newPwd) {
      if (!oldPwd) {
        return wx.showToast({ title: '修改密码请填写旧密码', icon: 'none' })
      }
      if (newPwd.length < 6 || newPwd.length > 20) {
        return wx.showToast({ title: '新密码6-20位字母数字', icon: 'none' })
      }
      user.password = newPwd
    }

    user.username = newName
    user.email = newMail

    wx.showLoading({ title: "保存中..." })
    const res = await cloudUpdateUser(user.id, newName, user.avatar)
    wx.hideLoading()

    if (!res.success) {
      return wx.showToast({ title: res.msg, icon: "none" })
    }

    setUser(user)
    wx.showToast({ title: '资料保存成功' })
    setTimeout(() => wx.navigateBack(), 1000)
  }
})