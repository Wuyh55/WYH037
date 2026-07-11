import { getUser, cloudGetAlbumList, cloudAddAlbum } from "../../utils/storage.js"
Page({
  data: {
    newAlbumName: "",
    parentAlbumList: [],
    parentNameList: ['无（顶级相册）'],
    parentIndex: 0
  },
  onShow() {
    const user = getUser();
    if (!user) {
      wx.showToast({ title: "请先登录", icon: "none" })
      wx.switchTab({ url: "/pages/mine/mine" })
      return;
    }
    this.getAllParentAlbum();
  },
  async getAllParentAlbum() {
    const user = getUser();
    const res = await cloudGetAlbumList(user.id);
    const all = res.success ? res.data : [];
    const nameArr = ['无（顶级相册）'];
    all.forEach(item => nameArr.push(item.name))
    this.setData({
      parentAlbumList: all,
      parentNameList: nameArr,
      newAlbumName: "",
      parentIndex: 0
    })
  },
  changeParentAlbum(e) {
    this.setData({ parentIndex: e.detail.value })
  },
  inputNewAlbum(e) {
    this.setData({ newAlbumName: e.detail.value })
  },
  async submitCreateAlbum() {
    const { newAlbumName, parentIndex, parentAlbumList } = this.data;
    const name = newAlbumName.trim();
    if (!name) return wx.showToast({ title: "请输入相册名称", icon: "none" })
    const user = getUser();
    let parentId = 0;
    if (parentIndex > 0) parentId = parentAlbumList[parentIndex - 1].id;

    wx.showLoading({ title: "创建中..." })
    const res = await cloudAddAlbum({
      name,
      uid: user.id,
      parent_id: parentId,
      cover: "",
      photo_num: 0,
      fileList: [],
      createTime: new Date().toLocaleDateString()
    })
    wx.hideLoading()

    console.log("cloudAddAlbum result:", res)

    if (!res || !res.success) {
      const msg = res && res.msg ? res.msg : "创建失败，请重试"
      wx.showToast({ title: msg, icon: "none" })
      return
    }

    if (!res.data || !res.data.id) {
      wx.showToast({ title: "创建成功但未获取到相册ID", icon: "none" })
      setTimeout(() => {
        wx.switchTab({ url: "/pages/index/index" })
      }, 1500)
      return
    }

    wx.showToast({ title: "创建成功" })
    setTimeout(() => {
      wx.navigateTo({
        url: `/pages/upload/upload?albumId=${res.data.id}`
      })
    }, 1000)
  },
  goBack() {
    wx.navigateBack()
  }
})