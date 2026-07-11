import { cloudGetAlbum, cloudUpdateAlbum } from "../../utils/storage.js"

Page({
  data: {
    album: {},
    selectFiles: [],
    fileDesc: ""
  },

  async onLoad(options) {
    let album;
    if (options.albumId) {
      const res = await cloudGetAlbum(options.albumId);
      album = res.success ? res.data : null;
    } else if (options.album) {
      album = JSON.parse(decodeURIComponent(options.album));
    }
    if (album) {
      this.setData({ album });
    }
  },

  selectMedia() {
    wx.chooseMedia({
      count: 99,
      mediaType: ["image", "video"],
      sourceType: ["album"],
      success: (res) => {
        this.setData({
          selectFiles: [...this.data.selectFiles, ...res.tempFiles]
        })
      }
    });
  },

  delSelectFile(e) {
    const idx = e.currentTarget.dataset.index;
    let arr = this.data.selectFiles;
    arr.splice(idx, 1);
    this.setData({ selectFiles: arr });
  },

  inputFileDesc(e) {
    this.setData({ fileDesc: e.detail.value });
  },

  // 上传单个文件到云存储
  uploadToCloud(filePath) {
    return new Promise((resolve, reject) => {
      const ext = filePath.split('.').pop() || 'jpg'
      const cloudPath = `albums/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`
      wx.cloud.uploadFile({
        cloudPath: cloudPath,
        filePath: filePath,
        success: res => resolve(res.fileID),
        fail: err => reject(err)
      })
    })
  },

  async submitUpload() {
    const { selectFiles, fileDesc, album } = this.data;
    if (selectFiles.length === 0) {
      wx.showToast({ title: "请先选择文件", icon: "none" });
      return;
    }

    wx.showLoading({ title: "上传中..." })

    const savedFiles = [];
    for (let i = 0; i < selectFiles.length; i++) {
      const file = selectFiles[i];
      let url = file.tempFilePath;
      try {
        url = await this.uploadToCloud(file.tempFilePath);
      } catch (e) {
        console.log('upload fail:', e);
      }
      savedFiles.push({
        url: url,
        title: "",
        desc: fileDesc
      });
    }

    if (!album.fileList) album.fileList = [];
    const oldImgCount = album.fileList.length;
    album.fileList.push(...savedFiles);
    album.photo_num = album.fileList.length;

    if (oldImgCount === 0) {
      album.cover = savedFiles[0].url;
    }

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
      wx.showToast({ title: res.msg, icon: "none" })
      return
    }

    wx.showToast({ title: "上传成功" });
    setTimeout(() => wx.navigateBack(), 1500);
  }
});
