import { cloudGetAlbum, cloudUpdateAlbum, cloudDeleteAlbum, cloudAddRecycle } from "../../utils/storage.js"
Page({
  data: {
    album: {},
    showPreview: false,
    currentImgIndex: 0
  },

  async onLoad(options) {
    const albumId = options.id;
    if (!albumId) {
      wx.showToast({ title: "相册ID无效", icon: "none" });
      setTimeout(() => wx.navigateBack(), 1000);
      return;
    }
    wx.showLoading({ title: "加载中..." })
    try {
      const res = await cloudGetAlbum(albumId);
      if (res.success) {
        this.setData({ album: res.data });
      } else {
        wx.showToast({ title: res.msg || "相册不存在", icon: "none" });
        setTimeout(() => wx.navigateBack(), 1000);
      }
    } catch (err) {
      console.error('loadAlbum error:', err)
      wx.showToast({ title: "加载失败，请重试", icon: "none" });
      setTimeout(() => wx.navigateBack(), 1000);
    } finally {
      wx.hideLoading()
    }
  },

  async onShow() {
    const pages = getCurrentPages();
    const currPage = pages[pages.length - 1];
    const albumId = currPage.options.id;
    if (!albumId) return;
    try {
      const res = await cloudGetAlbum(albumId);
      if (res.success) {
        this.setData({ album: res.data });
      }
    } catch (err) {
      console.error('onShow loadAlbum error:', err)
    }
  },

  goUploadPage() {
    const album = JSON.stringify(this.data.album)
    wx.navigateTo({
      url: `/pages/upload/upload?album=${encodeURIComponent(album)}`
    })
  },

  goRenamePage() {
    const albumId = this.data.album.id
    wx.navigateTo({
      url: `/pages/renameAlbum/renameAlbum?id=${albumId}&name=${encodeURIComponent(this.data.album.name)}`
    })
  },

  goEditDescPage() {
    const album = JSON.stringify(this.data.album)
    wx.navigateTo({
      url: `/pages/editAlbumDesc/editAlbumDesc?album=${encodeURIComponent(album)}`
    })
  },

  async deleteAlbum() {
    const albumId = this.data.album.id;
    wx.showModal({
      title: "提示",
      content: "确定删除该相册及全部照片？删除后可在回收站恢复",
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: "处理中..." })
          await cloudAddRecycle({
            uid: this.data.album.uid,
            type: "album",
            item: JSON.parse(JSON.stringify(this.data.album))
          })
          await cloudDeleteAlbum(albumId)
          wx.hideLoading()
          wx.showToast({ title: "已移入回收站" });
          setTimeout(() => wx.switchTab({ url: "/pages/index/index" }), 1200);
        }
      }
    })
  },

  goPreviewPage(e) {
    const idx = e.currentTarget.dataset.index
    this.setData({
      showPreview: true,
      currentImgIndex: idx
    })
  },

  closePreview() {
    this.setData({ showPreview: false })
  },

  stopBubble() { },

  onSwiperChange(e) {
    this.setData({ currentImgIndex: e.detail.current })
  },

  async deleteSingleImg() {
    const { album, currentImgIndex } = this.data
    const delImg = JSON.parse(JSON.stringify(album.fileList[currentImgIndex]))

    wx.showLoading({ title: "处理中..." })

    // 如果是本地临时路径，先保存到持久化目录
    let savedUrl = delImg.url
    if (delImg.url && delImg.url.indexOf('tmp') > -1) {
      try {
        const saved = await new Promise((resolve, reject) => {
          wx.saveFile({
            tempFilePath: delImg.url,
            success: res => resolve(res.savedFilePath),
            fail: err => reject(err)
          })
        })
        savedUrl = saved
        delImg.url = savedUrl
      } catch (e) {
        console.log('saveFile fail:', e)
      }
    }

    await cloudAddRecycle({
      uid: album.uid,
      type: "img",
      item: {
        albumId: album.id,
        albumName: album.name,
        data: delImg
      }
    })

    album.fileList.splice(currentImgIndex, 1)
    album.photo_num = album.fileList.length

    await cloudUpdateAlbum({
      id: album.id,
      name: album.name,
      fileList: album.fileList,
      photo_num: album.photo_num,
      cover: album.cover,
      desc: album.desc
    })

    wx.hideLoading()
    wx.showToast({ title: "图片移入回收站" })
    setTimeout(() => {
      this.setData({ showPreview: false })
      this.onShow()
    }, 1000)
  },

  goEditImgPage() {
    const albumStr = JSON.stringify(this.data.album)
    const idx = this.data.currentImgIndex
    wx.navigateTo({
      url: `/pages/editImgNote/editImgNote?album=${encodeURIComponent(albumStr)}&index=${idx}`
    })
  },

  downloadImg() {
    const { album, currentImgIndex } = this.data;
    const imgUrl = album.fileList[currentImgIndex].url;
    wx.getSetting({
      success: res => {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success: () => this.saveImage(imgUrl),
            fail: () => {
              wx.showModal({
                title: "权限提示",
                content: "需要相册权限才能保存图片，请前往设置开启",
                confirmText: "去设置",
                success: r => {
                  if (r.confirm) wx.openSetting();
                }
              })
            }
          })
        } else {
          this.saveImage(imgUrl);
        }
      }
    })
  },

  saveImage(url) {
    wx.downloadFile({
      url: url,
      success: res => {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => wx.showToast({ title: "图片已保存到相册" }),
          fail: () => wx.showToast({ title: "保存失败", icon: "none" })
        })
      },
      fail: () => wx.showToast({ title: "下载失败", icon: "none" })
    })
  }
})