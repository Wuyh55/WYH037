import { getUser, cloudGetCheckInList } from "../../utils/storage.js"

Page({
  data: {
    province: '',
    checkList: [],
    showPreview: false,
    currentImgIndex: 0
  },

  async onLoad(options) {
    const province = options.province
    const user = getUser()
    if (!user) {
      wx.showToast({ title: "请先登录", icon: "none" })
      wx.navigateBack()
      return
    }
    const res = await cloudGetCheckInList(user.id)
    const allList = res.success ? res.data : []
    const myList = allList.filter(item => item.province === province)
    this.setData({
      province,
      checkList: myList
    })
  },

  async onShow() {
    const province = this.data.province
    const user = getUser()
    if (!user) return
    const res = await cloudGetCheckInList(user.id)
    const allList = res.success ? res.data : []
    const myList = allList.filter(item => item.province === province)
    this.setData({ checkList: myList })
  },

  goPreview(e) {
    const index = e.currentTarget.dataset.index
    this.setData({
      showPreview: true,
      currentImgIndex: index
    })
  },

  closePreview() {
    this.setData({ showPreview: false })
  },

  onSwiperChange(e) {
    this.setData({ currentImgIndex: e.detail.current })
  },

  stopBubble() {},

  goBack() {
    wx.navigateBack()
  }
})