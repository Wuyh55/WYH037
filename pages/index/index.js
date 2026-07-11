import { getUser, cloudGetAlbumList } from "../../utils/storage.js"
const pageSize = 15;

Page({
  data: {
    userInfo: null,
    searchTypeList: ['按相册名', '按创建时间'],
    searchTypeIndex: 0,
    searchType: 'name',
    searchValue: '',
    timeKeyword: '',
    searchTip: '',
    isSearch: false,
    currentPage: 1,
    totalAlbums: 0,
    totalPages: 1,
    pageNumList: [],
    albumList: [],
    allAlbumData: [],
    pageTitle: '我的相册集',
    emptyText: '还没有创建任何相册\n快去创建存放照片吧'
  },

  onShow() {
    const user = getUser();
    console.log("登录用户完整信息：", user);
    if(user){
      user.avatarUrl = user.avatarUrl || "";
    }
    this.setData({ userInfo: user });
    
    if (!user) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      wx.switchTab({ url: '/pages/mine/mine' })
      return;
    }
    this.resetPageData();
    this.loadLocalAlbum();
    this.getAllParentAlbum();
  },

  resetPageData() {
    this.setData({
      currentPage: 1,
      albumList: [],
      allAlbumData: [],
      isSearch: false,
      searchTip: '',
      pageTitle: '我的相册集',
      searchValue: '',
      timeKeyword: ''
    })
  },

  async loadLocalAlbum() {
    const user = this.data.userInfo;
    if (!user) return;
    wx.showLoading({ title: "加载中..." })
    try {
      const res = await cloudGetAlbumList(user.id);
      const allAlbum = res.success ? res.data : [];
      this.setData({ allAlbumData: allAlbum });
      this.renderPageAlbum(allAlbum);
    } catch (err) {
      console.error('loadLocalAlbum error:', err)
      wx.showToast({ title: '加载失败，请重试', icon: 'none' })
    } finally {
      wx.hideLoading()
    }
  },

  renderPageAlbum(sourceArr) {
    const total = sourceArr.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const start = (this.data.currentPage - 1) * pageSize;
    const pageData = sourceArr.slice(start, start + pageSize);

    let pageArr = [];
    let startPage = Math.max(1, this.data.currentPage - 2);
    let endPage = Math.min(totalPages, this.data.currentPage + 2);
    for (let i = startPage; i <= endPage; i++) pageArr.push(i);

    this.setData({
      albumList: pageData,
      totalAlbums: total,
      totalPages: totalPages,
      pageNumList: pageArr
    })
  },

  changeSearchType(e) {
    const idx = e.detail.value;
    const type = idx === 0 ? 'name' : 'time';
    this.setData({
      searchTypeIndex: idx,
      searchType: type
    })
  },

  inputSearchValue(e) {
    this.setData({ searchValue: e.detail.value })
  },

  inputTimeKeyword(e) {
    this.setData({ timeKeyword: e.detail.value })
  },

  submitSearch() {
    const { searchType, searchValue, timeKeyword, allAlbumData } = this.data;
    if (searchType === 'name' && !searchValue.trim()) {
      return wx.showToast({ title: '请输入相册名称', icon: 'none' })
    }
    if (searchType === 'time') {
      const val = timeKeyword.trim();
      if (!val) return wx.showToast({ title: '请输入时间', icon: 'none' })
      const reg = /^\d{4}(-\d{2})?(-\d{2})?$/;
      if (!reg.test(val)) return wx.showToast({ title: '时间格式错误', icon: 'none' })
    }
    this.setData({ currentPage: 1, isSearch: true });

    let filterList = [...allAlbumData];
    if (searchType === 'name') {
      filterList = filterList.filter(item => item.name.includes(searchValue));
      this.setData({ pageTitle: `搜索结果：${searchValue}` })
    } else {
      filterList = filterList.filter(item => {
        const createStr = new Date(item.createTime).toLocaleDateString();
        return createStr.includes(timeKeyword);
      })
      this.setData({ pageTitle: `搜索结果：${timeKeyword}` })
    }

    if (filterList.length === 0) {
      this.setData({
        albumList: [],
        searchTip: "无匹配相册",
        emptyText: '没有找到匹配的相册哦～'
      })
      return;
    }
    this.setData({ searchTip: "" })
    this.renderPageAlbum(filterList);
  },

  prevPage() {
    if (this.data.currentPage <= 1) return;
    this.setData({ currentPage: this.data.currentPage - 1 })
    this.renderPageAlbum(this.data.isSearch ? this.data.allAlbumData : this.data.allAlbumData);
  },
  nextPage() {
    if (this.data.currentPage >= this.data.totalPages) return;
    this.setData({ currentPage: this.data.currentPage + 1 })
    this.renderPageAlbum(this.data.isSearch ? this.data.allAlbumData : this.data.allAlbumData);
  },
  switchPage(e) {
    const page = e.currentTarget.dataset.page;
    this.setData({ currentPage: page })
    this.renderPageAlbum(this.data.isSearch ? this.data.allAlbumData : this.data.allAlbumData);
  },

  getAllParentAlbum() {
    const list = this.data.allAlbumData;
    const nameArr = ['无（顶级相册）'];
    list.forEach(item => nameArr.push(item.name));
  },
  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/albumDetail/detail?id=${id}` })
  },
  goSetCover(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/setCover/setCover?album_id=${id}` })
  }
})