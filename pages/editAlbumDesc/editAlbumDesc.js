import { cloudGetAlbum, cloudUpdateAlbum } from "../../utils/storage.js"

Page({
  data:{
    album:{},
    newDesc:""
  },
  async onLoad(options){
    const album = JSON.parse(decodeURIComponent(options.album))
    this.setData({
      album,
      newDesc:album.desc || ""
    })
  },
  inputNewDesc(e){
    this.setData({newDesc:e.detail.value})
  },
  async saveDesc(){
    const {album, newDesc} = this.data
    
    wx.showLoading({ title: "保存中..." })
    const res = await cloudUpdateAlbum({
      id: album.id,
      name: album.name,
      fileList: album.fileList,
      photo_num: album.photo_num,
      cover: album.cover,
      desc: newDesc
    })
    wx.hideLoading()
    
    if (!res.success) {
      return wx.showToast({ title: res.msg, icon: "none" })
    }
    
    wx.showToast({title:"保存成功"})
    setTimeout(()=>wx.navigateBack(),1000)
  },
  goBack(){
    wx.navigateBack()
  }
})