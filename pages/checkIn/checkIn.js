// pages/checkIn/checkIn.js
import { getUser, cloudGetCheckInList } from "../../utils/storage.js"

Page({
  data: {
    groupList: []
  },
  
  async onShow() {
    const user = getUser()
    if (!user) {
      wx.showToast({ title: "请先登录", icon: "none" })
      wx.switchTab({ url: "/pages/mine/mine" })
      return
    }
    const res = await cloudGetCheckInList(user.id)
    console.log("打卡列表数据:", res)
    
    const list = res.success ? res.data : []
    
    // ⚠️ 调试：打印图片路径
    list.forEach((item, index) => {
      console.log(`第${index + 1}条:`, {
        city: item.city,
        province: item.province,
        image: item.image,  // 注意是 image 不是 img
        desc: item.desc
      })
    })
    
    const groups = this.groupByProvince(list)
    this.setData({ groupList: groups })
  },
  
  groupByProvince(list) {
    const map = {}
    list.forEach(item => {
      const province = item.province || '未知'
      if (!map[province]) {
        map[province] = []
      }
      map[province].push(item)
    })
    return Object.keys(map).map(province => ({
      province,
      items: map[province]
    }))
  },
  
  goProvinceDetail(e) {
    const province = e.currentTarget.dataset.province
    wx.navigateTo({
      url: `/pages/provinceCheckDetail/provinceCheckDetail?province=${province}`
    })
  },

  // 点击图片预览
  previewImage(e) {
    const imgUrl = e.currentTarget.dataset.img  // 这里对应 data-img
    const province = e.currentTarget.dataset.province
    
    console.log("点击预览:", { imgUrl, province })
    
    if (!imgUrl) {
      wx.showToast({ title: "图片地址不存在", icon: "none" })
      return
    }
    
    // 如果是云存储 fileID，先转换
    if (imgUrl.startsWith('cloud://')) {
      wx.cloud.getTempFileURL({
        fileList: [imgUrl],
        success: (res) => {
          if (res.fileList && res.fileList.length > 0) {
            const tempUrl = res.fileList[0].tempFileURL
            wx.previewImage({
              current: tempUrl,
              urls: [tempUrl]
            })
          }
        },
        fail: (err) => {
          console.error('获取临时链接失败:', err)
          wx.showToast({ title: "图片加载失败", icon: "none" })
        }
      })
      return
    }
    
    // 普通 http 链接直接预览
    wx.previewImage({
      current: imgUrl,
      urls: [imgUrl]
    })
  }
})