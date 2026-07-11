import { cloudGetAlbum, cloudUpdateAlbumCover } from "../../utils/storage.js"
Page({
  data: {
    albumId: "",
    albumName: "",
    imgList: [],
    imgNameList: ["-- 请选择一张图片作为封面 --"],
    selectIndex: 0,
    selectImgUrl: ""
  },
  async onLoad(options) {
    const aid = options.album_id
    const res = await cloudGetAlbum(aid)
    if (!res.success) {
      wx.showToast({ title: "相册不存在", icon: "none" })
      wx.navigateBack()
      return
    }
    const target = res.data
    const list = target.fileList || []
    const nameArr = ["-- 请选择一张图片作为封面 --"]
    list.forEach((item, idx) => {
      let name = item.desc || String(idx).padStart(2, "0")
      nameArr.push(name)
    })
    this.setData({
      albumId: aid,
      albumName: target.name,
      imgList: list,
      imgNameList: nameArr
    })
  },
  changeImg(e) {
    const idx = e.detail.value
    this.setData({ selectIndex: idx })
    if (idx === 0) {
      this.setData({ selectImgUrl: "" })
    } else {
      this.setData({ selectImgUrl: this.data.imgList[idx - 1].url })
    }
  },
  clickImg(e) {
    const idx = e.currentTarget.dataset.index
    const imgUrl = this.data.imgList[idx].url
    this.setData({
      selectIndex: idx + 1,
      selectImgUrl: imgUrl
    })
    wx.showToast({ title: "已选中该图片", icon: "none" })
  },
  async saveCover() {
    const { selectIndex, selectImgUrl, albumId } = this.data
    if (selectIndex === 0) {
      return wx.showToast({ title: "请选择图片", icon: "none" })
    }
    wx.showLoading({ title: "设置中..." })
    const res = await cloudUpdateAlbumCover(albumId, selectImgUrl)
    wx.hideLoading()
    if (!res.success) {
      wx.showToast({ title: res.msg, icon: "none" })
      return
    }
    wx.showToast({ title: "设置封面成功" })
    setTimeout(() => wx.navigateBack(), 1000)
  }
})