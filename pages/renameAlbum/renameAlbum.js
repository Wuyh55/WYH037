import { cloudGetAlbum, cloudUpdateAlbum } from "../../utils/storage.js"
Page({
  data:{
    albumId:"",
    newName:""
  },
  async onLoad(options){
    const albumId = options.id
    const res = await cloudGetAlbum(albumId)
    if (res.success) {
      this.setData({
        albumId,
        newName: res.data.name
      })
    }
  },
  inputNewName(e){
    this.setData({newName:e.detail.value})
  },
  async saveRename(){
    const name = this.data.newName.trim()
    if(!name) return wx.showToast({title:"名称不能为空",icon:"none"})
    
    wx.showLoading({ title: "保存中..." })
    const albumRes = await cloudGetAlbum(this.data.albumId)
    if (!albumRes.success) {
      wx.hideLoading()
      return wx.showToast({ title: "相册不存在", icon: "none" })
    }
    const album = albumRes.data
    
    const res = await cloudUpdateAlbum({
      id: album.id,
      name: name,
      fileList: album.fileList,
      photo_num: album.photo_num,
      cover: album.cover,
      desc: album.desc
    })
    wx.hideLoading()
    
    if (!res.success) {
      return wx.showToast({ title: res.msg, icon: "none" })
    }
    
    wx.showToast({title:"修改成功"})
    setTimeout(()=>wx.navigateBack(),1000)
  },
  goBack(){wx.navigateBack()}
})