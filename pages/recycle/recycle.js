// pages/recycle/recycle.js
import { 
  getUser, 
  cloudGetRecycleList, 
  cloudRestoreRecycle, 
  cloudDeleteRecycle, 
  cloudClearRecycle, 
  cloudGetAlbumList, 
  cloudAddAlbum, 
  cloudUpdateAlbum 
} from "../../utils/storage.js"

Page({
  data: {
    recycleList: [],
    albumRecycle: [],
    imgRecycle: []
  },

  onShow() {
    this.loadRecycle()
  },

  // 兼容多种日期格式
  parseDate(str) {
    if (!str) return null
    let d = new Date(str)
    if (!isNaN(d.getTime())) return d
    
    const match = str.match(/(\d+)\/(\d+)\/(\d+),?\s*(\d+):(\d+):(\d+)\s*(AM|PM)?/i)
    if (match) {
      let [, m, day, year, h, min, sec, ampm] = match
      let hour = parseInt(h)
      if (ampm) {
        if (ampm.toUpperCase() === 'PM' && hour < 12) hour += 12
        if (ampm.toUpperCase() === 'AM' && hour === 12) hour = 0
      }
      d = new Date(`${year}/${String(m).padStart(2,'0')}/${String(day).padStart(2,'0')} ${String(hour).padStart(2,'0')}:${min}:${sec}`)
      if (!isNaN(d.getTime())) return d
    }
    return null
  },

  // ⚠️ 云存储转临时链接
  async getTempUrl(fileId) {
    if (!fileId) return ''
    if (!fileId.startsWith('cloud://')) return fileId
    
    try {
      const result = await wx.cloud.getTempFileURL({
        fileList: [fileId]
      })
      if (result.fileList && result.fileList.length > 0) {
        return result.fileList[0].tempFileURL
      }
      return fileId
    } catch (err) {
      console.error('获取临时链接失败:', err)
      return fileId
    }
  },

  async loadRecycle() {
    const user = getUser()
    if (!user) {
      wx.showToast({ title: "请先登录", icon: "none" })
      return
    }

    wx.showLoading({ title: "加载中..." })
    const res = await cloudGetRecycleList(user.id)
    wx.hideLoading()

    console.log("回收站原始数据:", JSON.stringify(res))

    if (!res.success || !res.data || res.data.length === 0) {
      this.setData({ recycleList: [], albumRecycle: [], imgRecycle: [] })
      return
    }

    const rawList = res.data
    const now = new Date().getTime()
    const validList = []

    // ⚠️ 遍历处理每条数据
    for (const item of rawList) {
      const delDate = this.parseDate(item.deleteTime)
      if (!delDate) continue
      
      const diffDay = (now - delDate.getTime()) / (1000 * 60 * 60 * 24)
      if (diffDay <= 7) {
        // ⚠️ 关键修复：转换图片链接
        let imageUrl = ''
        
        if (item.type === 'album') {
          // 相册封面
          if (item.data && item.data.cover) {
            imageUrl = await this.getTempUrl(item.data.cover)
            item.data.cover = imageUrl
          }
          // 相册内的图片
          if (item.data && item.data.fileList && item.data.fileList.length > 0) {
            for (const file of item.data.fileList) {
              if (file.url) {
                file.url = await this.getTempUrl(file.url)
              }
            }
          }
        } else if (item.type === 'img') {
          // 照片
          if (item.data) {
            const imgField = item.data.image || item.data.url || ''
            if (imgField) {
              imageUrl = await this.getTempUrl(imgField)
              item.data.image = imageUrl
              item.data.url = imageUrl
            }
          }
        }
        
        const leftDay = Math.ceil(7 - diffDay)
        item.expireTip = `还有${leftDay}天彻底过期`
        validList.push(item)
      }
    }

    console.log("转换后的回收站数据:", validList)

    const albumArr = validList.filter(item => item.type === "album")
    const imgArr = validList.filter(item => item.type === "img")

    this.setData({
      recycleList: validList,
      albumRecycle: albumArr,
      imgRecycle: imgArr
    })
  },

  async recoverItem(e) {
    const idx = Number(e.currentTarget.dataset.index)
    const type = e.currentTarget.dataset.type
    const target = type === "album" ? this.data.albumRecycle[idx] : this.data.imgRecycle[idx]

    if (!target) {
      wx.showToast({ title: "数据不存在", icon: "none" })
      return
    }

    wx.showLoading({ title: "恢复中..." })

    try {
      if (type === "album") {
        // 清理数据，去掉回收站的_id，重新创建相册
        const albumData = JSON.parse(JSON.stringify(target.data))
        delete albumData._id
        await cloudAddAlbum(albumData)
      } else {
        const albumRes = await cloudGetAlbumList(getUser().id)
        if (!albumRes.success) {
          wx.hideLoading()
          return wx.showToast({ title: "获取相册失败", icon: "none" })
        }
        const allAlbum = albumRes.data
        const targetAlbum = allAlbum.find(a => a.id === target.data.albumId)
        
        if (!targetAlbum) {
          wx.hideLoading()
          return wx.showToast({ title: "原相册已永久删除，无法恢复", icon: "none" })
        }
        
        if (!targetAlbum.fileList) targetAlbum.fileList = []
        targetAlbum.fileList.push({
          url: target.data.image || target.data.url,
          name: target.data.name || '未命名'
        })
        targetAlbum.photo_num = targetAlbum.fileList.length
        if (!targetAlbum.cover && targetAlbum.fileList.length > 0) {
          targetAlbum.cover = targetAlbum.fileList[0].url
        }
        
        await cloudUpdateAlbum({
          id: targetAlbum.id,
          name: targetAlbum.name,
          fileList: targetAlbum.fileList,
          photo_num: targetAlbum.photo_num,
          cover: targetAlbum.cover,
          desc: targetAlbum.desc
        })
      }

      await cloudRestoreRecycle(target.id)
      wx.hideLoading()
      wx.showToast({ title: "恢复成功" })
      this.loadRecycle()
    } catch (err) {
      wx.hideLoading()
      console.error('恢复失败:', err)
      wx.showToast({ title: "恢复失败，请重试", icon: "none" })
    }
  },

  async realDelete(e) {
    const idx = Number(e.currentTarget.dataset.index)
    const type = e.currentTarget.dataset.type
    const target = type === "album" ? this.data.albumRecycle[idx] : this.data.imgRecycle[idx]

    if (!target) {
      wx.showToast({ title: "数据不存在", icon: "none" })
      return
    }

    wx.showModal({
      title: "⚠️ 永久删除",
      content: "确认永久删除？数据无法找回！",
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: "删除中..." })
          try {
            await cloudDeleteRecycle(target.id)
            wx.hideLoading()
            wx.showToast({ title: "已彻底删除" })
            this.loadRecycle()
          } catch (err) {
            wx.hideLoading()
            wx.showToast({ title: "删除失败", icon: "none" })
          }
        }
      }
    })
  },

  async clearAll() {
    if (this.data.recycleList.length === 0) {
      wx.showToast({ title: "回收站已空", icon: "none" })
      return
    }

    wx.showModal({
      title: "⚠️ 清空回收站",
      content: "确认清空回收站所有内容？数据将无法找回！",
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: "清空中..." })
          try {
            await cloudClearRecycle(getUser().id)
            wx.hideLoading()
            wx.showToast({ title: "已清空" })
            this.loadRecycle()
          } catch (err) {
            wx.hideLoading()
            wx.showToast({ title: "清空失败", icon: "none" })
          }
        }
      }
    })
  },

  previewAlbum(e) {
    const idx = Number(e.currentTarget.dataset.index)
    const album = this.data.albumRecycle[idx]
    if (!album || !album.data) {
      wx.showToast({ title: "无图片可预览", icon: "none" })
      return
    }

    const urls = []
    if (album.data.cover) urls.push(album.data.cover)
    if (album.data.image) urls.push(album.data.image)
    if (album.data.fileList && album.data.fileList.length > 0) {
      album.data.fileList.forEach(f => {
        if (f.url) urls.push(f.url)
      })
    }

    if (urls.length > 0) {
      wx.previewImage({
        current: urls[0],
        urls: urls
      })
    } else {
      wx.showToast({ title: "无图片可预览", icon: "none" })
    }
  },

  previewImg(e) {
    const idx = Number(e.currentTarget.dataset.index)
    const imgItem = this.data.imgRecycle[idx]
    if (!imgItem || !imgItem.data) {
      wx.showToast({ title: "图片不存在", icon: "none" })
      return
    }

    const imgUrl = imgItem.data.image || imgItem.data.url
    if (!imgUrl) {
      wx.showToast({ title: "图片地址无效", icon: "none" })
      return
    }

    const albumName = imgItem.albumName
    const allUrls = this.data.imgRecycle
      .filter(item => item.albumName === albumName && item.data)
      .map(item => item.data.image || item.data.url)
      .filter(url => url)

    wx.previewImage({
      current: imgUrl,
      urls: allUrls.length > 0 ? allUrls : [imgUrl]
    })
  }
})