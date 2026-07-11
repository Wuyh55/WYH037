App({
  onLaunch() {
    // ========== 云开发初始化（复制环境ID填到env里）==========
    wx.cloud.init({
      env: "cloud1-d2gq7l5vl2c158dd6", // 去云开发控制台顶部复制，形如 xxx-xxxx
      traceUser: true
    })

    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
  },
  globalData: {
    userInfo: null
  }
})