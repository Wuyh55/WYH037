Page({
  data: {
    album: {},
    currentImgIndex: 0
  },
  onLoad(options) {
    this.setData({
      album: JSON.parse(decodeURIComponent(options.album)),
      currentImgIndex: Number(options.index)
    })
  },
  swiperChange(e) {
    this.setData({ currentImgIndex: e.detail.current })
  },
  goEditImgPage() {
    const idx = this.data.currentImgIndex
    const album = JSON.stringify(this.data.album)
    wx.navigateTo({
      url: `/pages/editImgNote/editImgNote?album=${encodeURIComponent(album)}&index=${idx}`
    })
  },
  deleteSingleImg() {
    const {album, currentImgIndex} = this.data
    album.fileList.splice(currentImgIndex, 1)
    // 写回本地存储逻辑自行补充，完成后返回刷新相册
    wx.showToast({title:"删除成功"})
    setTimeout(()=>wx.navigateBack(),1000)
  },
  goBack() {
    wx.navigateBack()
  }
})