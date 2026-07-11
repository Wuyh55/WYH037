import { cloudUpdateAlbum } from "../../utils/storage.js"

Page({
  data:{
    album:{},
    currentImgIndex:0,
    currentImgDesc:""
  },
  onLoad(options){
    const album = JSON.parse(decodeURIComponent(options.album))
    const idx = Number(options.index)
    this.setData({
      album,
      currentImgIndex:idx,
      currentImgDesc:album.fileList[idx].desc
    })
  },
  inputImgDesc(e){
    this.setData({currentImgDesc:e.detail.value})
  },
  async saveImgDesc(){
    const {album, currentImgIndex, currentImgDesc} = this.data
    album.fileList[currentImgIndex].desc = currentImgDesc
    
    wx.showLoading({ title: "保存中..." })
    const res = await cloudUpdateAlbum({
      id: album.id,
      name: album.name,
      fileList: album.fileList,
      photo_num: album.photo_num,
      cover: album.cover,
      desc: album.desc
    })
    wx.hideLoading()
    
    if (!res.success) {
      return wx.showToast({ title: res.msg, icon: "none" })
    }
    
    wx.showToast({title:"保存成功"})
    setTimeout(()=>wx.navigateBack({delta:1}),1000)
  },
  goBack(){
    wx.navigateBack()
  }
})