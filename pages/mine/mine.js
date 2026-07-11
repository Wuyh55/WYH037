import { getUser, clearUser, cloudGetAlbumList, cloudGetRecycleList, cloudGetCheckInList } from "../../utils/storage.js"
const { getProvinceData } = require("../../utils/chinaMapData.js")

const CITY_MAP = {
  '北京': ['北京'],
  '天津': ['天津'],
  '河北': ['石家庄','唐山','秦皇岛','邯郸','邢台','保定','张家口','承德','沧州','廊坊','衡水'],
  '山西': ['太原','大同','朔州','忻州','阳泉','吕梁','晋中','长治','晋城','临汾','运城'],
  '内蒙古': ['呼和浩特','包头','乌海','赤峰','通辽','鄂尔多斯','呼伦贝尔','巴彦淖尔','乌兰察布'],
  '辽宁': ['沈阳','大连','鞍山','抚顺','本溪','丹东','锦州','营口','阜新','辽阳','盘锦','铁岭','朝阳','葫芦岛'],
  '吉林': ['长春','吉林','四平','辽源','通化','白山','松原','白城'],
  '黑龙江': ['哈尔滨','齐齐哈尔','鸡西','鹤岗','双鸭山','大庆','伊春','佳木斯','七台河','牡丹江','黑河','绥化'],
  '上海': ['上海'],
  '江苏': ['南京','无锡','徐州','常州','苏州','南通','连云港','淮安','盐城','扬州','镇江','泰州','宿迁'],
  '浙江': ['杭州','宁波','温州','嘉兴','湖州','绍兴','金华','衢州','舟山','台州','丽水'],
  '安徽': ['合肥','芜湖','蚌埠','淮南','马鞍山','淮北','铜陵','安庆','黄山','滁州','阜阳','宿州','六安','亳州','池州','宣城'],
  '福建': ['福州','厦门','莆田','三明','泉州','漳州','南平','龙岩','宁德'],
  '江西': ['南昌','景德镇','萍乡','九江','新余','鹰潭','赣州','吉安','宜春','抚州','上饶'],
  '山东': ['济南','青岛','淄博','枣庄','东营','烟台','潍坊','济宁','泰安','威海','日照','临沂','德州','聊城','滨州','菏泽'],
  '河南': ['郑州','开封','洛阳','平顶山','安阳','鹤壁','新乡','焦作','濮阳','许昌','漯河','三门峡','南阳','商丘','信阳','周口','驻马店'],
  '湖北': ['武汉','黄石','十堰','宜昌','襄阳','鄂州','荆门','孝感','荆州','黄冈','咸宁','随州'],
  '湖南': ['长沙','株洲','湘潭','衡阳','邵阳','岳阳','常德','张家界','益阳','郴州','永州','怀化','娄底','湘西'],
  '广东': ['广州','深圳','珠海','汕头','佛山','韶关','湛江','肇庆','江门','茂名','惠州','梅州','汕尾','河源','阳江','清远','东莞','中山','潮州','揭阳','云浮'],
  '广西': ['南宁','柳州','桂林','梧州','北海','防城港','钦州','贵港','玉林','百色','贺州','河池','来宾','崇左'],
  '海南': ['海口','三亚','三沙','儋州'],
  '重庆': ['重庆'],
  '四川': ['成都','自贡','攀枝花','泸州','德阳','绵阳','广元','遂宁','内江','乐山','南充','眉山','宜宾','广安','达州','雅安','巴中','资阳'],
  '贵州': ['贵阳','六盘水','遵义','安顺','毕节','铜仁','黔西南','黔东南','黔南'],
  '云南': ['昆明','曲靖','玉溪','保山','昭通','丽江','普洱','临沧','楚雄','红河','文山','西双版纳','大理','德宏','怒江','迪庆'],
  '西藏': ['拉萨','日喀则','昌都','林芝','山南','那曲','阿里'],
  '陕西': ['西安','铜川','宝鸡','咸阳','渭南','延安','汉中','榆林','安康','商洛'],
  '甘肃': ['兰州','嘉峪关','金昌','白银','天水','武威','张掖','平凉','酒泉','庆阳','定西','陇南'],
  '青海': ['西宁','海东','海北','黄南','海南','果洛','玉树','海西'],
  '宁夏': ['银川','石嘴山','吴忠','固原','中卫'],
  '新疆': ['乌鲁木齐','克拉玛依','吐鲁番','哈密','昌吉','博尔塔拉','巴音郭楞','阿克苏','克孜勒苏','喀什','和田','伊犁','塔城','阿勒泰'],
  '香港': ['香港'],
  '澳门': ['澳门'],
  '台湾': ['台湾']
}
const COLOR_ARR = [
  '#d4a574','#c9956c','#e8c49a','#b89668','#c9a66b','#d4825a','#f0d5a8','#a67c52'
]

Page({
  data: {
    userInfo: null,
    stat: {
      albumCount: 0,
      imgCount: 0,
      recycleCount: 0
    },
    provinces: [],
    cityCheckList: [],
    COLOR_ARR,
    mapView: 0
  },

  onShow() {
    const user = getUser()
    this.setData({ userInfo: user })
    if (user) {
      this.calcStatData()
      this.loadProvincesWithCity()
    }
  },

  async loadProvincesWithCity() {
    const res = await cloudGetCheckInList(this.data.userInfo.id)
    const myCheck = res.success ? res.data : []
    this.setData({ cityCheckList: myCheck })

    const provinces = Object.keys(CITY_MAP).map(provName => {
      const cityList = CITY_MAP[provName]
      const checkedCities = myCheck.filter(item => item.province === provName).map(i => i.city)
      const allChecked = cityList.every(city => checkedCities.includes(city))
      const checked = checkedCities.length > 0
      return {
        name: provName,
        cityList,
        checkedCities,
        allChecked,
        checked
      }
    })
    this.setData({ provinces })
  },

  async calcStatData() {
    const albumRes = await cloudGetAlbumList(this.data.userInfo.id)
    const allAlbum = albumRes.success ? albumRes.data : []
    let totalImg = 0
    allAlbum.forEach(album => {
      totalImg += (album.fileList || []).length
    })
    
    const recycleRes = await cloudGetRecycleList(this.data.userInfo.id)
    const recycleList = recycleRes.success ? recycleRes.data : []
    
    this.setData({
      stat: {
        albumCount: allAlbum.length,
        imgCount: totalImg,
        recycleCount: recycleList.length
      }
    })
  },

  clickAvatar() {
    if (!this.data.userInfo) {
      wx.navigateTo({ url: "/pages/login/login" })
    }
  },

  goEditUser() {
    wx.navigateTo({ url: "/pages/editUser/edit" })
  },

  logout() {
    wx.showModal({
      title: "提示",
      content: "确定要退出登录吗？",
      success: res => {
        if (res.confirm) {
          clearUser()
          this.setData({ userInfo: null })
          wx.switchTab({ url: "/pages/index/index" })
          wx.showToast({ title: "已退出登录" })
        }
      }
    })
  },

  goCheckList() {
    wx.navigateTo({ url: "/pages/checkIn/checkIn" })
  },

  async exportAllImg() {
    const { userInfo } = this.data
    if (!userInfo) return wx.showToast({ title: "请先登录", icon: "none" })

    const res = await cloudGetAlbumList(userInfo.id)
    const allAlbum = res.success ? res.data : []
    const allImages = []
    allAlbum.forEach(album => {
      (album.fileList || []).forEach(img => {
        allImages.push(img.url)
      })
    })

    if (allImages.length === 0) {
      return wx.showToast({ title: "暂无照片可导出", icon: "none" })
    }

    wx.showLoading({ title: "正在导出图片..." })
    let saveSuccess = 0
    let saveFail = 0

    const saveOne = (index) => {
      if (index >= allImages.length) {
        wx.hideLoading()
        wx.showModal({
          title: "导出完成",
          content: `成功保存${saveSuccess}张，失败${saveFail}张\n图片已存入系统相册`,
          showCancel: false
        })
        return
      }
      wx.saveImageToPhotosAlbum({
        filePath: allImages[index],
        success: () => {
          saveSuccess++
          saveOne(index + 1)
        },
        fail: () => {
          saveFail++
          saveOne(index + 1)
        }
      })
    }
    saveOne(0)
  },

  clearCache() {
    wx.showModal({
      title: "清理缓存",
      content: "仅清除图片缩略图缓存，不会删除你的相册原图",
      success: res => {
        if (res.confirm) {
          wx.clearStorageSync()
          wx.showToast({ title: "缓存清理完成" })
        }
      }
    })
  },

  stopBubble() {},

  onMapSwiperChange(e) {
    const current = e.detail.current
    this.setData({ mapView: current })
    // 切换到地图页时绘制
    if (current === 1) {
      setTimeout(() => this.drawChinaMap(), 100)
    }
  },

  async drawChinaMap() {
    const query = wx.createSelectorQuery().in(this)
    query.select('#chinaMap').fields({ node: true, size: true, rect: true }).exec((res) => {
      if (!res || !res[0] || !res[0].node) {
        console.warn('Canvas节点获取失败，无法绘制地图')
        return
      }
      const canvas = res[0].node
      const ctx = canvas.getContext('2d')
      const dpr = wx.getSystemInfoSync().pixelRatio
      const width = res[0].width
      const height = res[0].height
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)

      // 保存canvas位置用于点击坐标计算
      this._canvasRect = res[0]

      const mapData = getProvinceData(width, height)
      const { provinces } = this.data

      // 清空画布
      ctx.clearRect(0, 0, width, height)

      // 绘制每个省份
      Object.keys(mapData).forEach(name => {
        const prov = mapData[name]
        const pData = provinces.find(p => p.name === name)
        const checked = pData ? pData.checked : false
        const allChecked = pData ? pData.allChecked : false

        ctx.beginPath()
        prov.path.forEach(([x, y], i) => {
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        })
        ctx.closePath()

        // 填充颜色
        if (allChecked) {
          ctx.fillStyle = '#b89668'
        } else if (checked) {
          ctx.fillStyle = '#d4a574'
        } else {
          ctx.fillStyle = '#e8e0d5'
        }
        ctx.fill()

        // 描边
        ctx.strokeStyle = '#d4c4a8'
        ctx.lineWidth = 1
        ctx.stroke()

        // 绘制省份名称
        ctx.fillStyle = checked || allChecked ? '#fff' : '#9a8b7a'
        ctx.font = '11px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(name, prov.center[0], prov.center[1])
      })

      // 保存省份数据用于点击检测
      this._mapData = mapData
    })
  },

  onCanvasTap(e) {
    if (!this._mapData || !this._canvasRect) return
    const touch = e.changedTouches[0]
    if (!touch) return
    // 减去canvas偏移量，得到canvas内坐标
    const x = touch.x - this._canvasRect.left
    const y = touch.y - this._canvasRect.top
    const provinces = Object.keys(this._mapData)
    for (let i = 0; i < provinces.length; i++) {
      const name = provinces[i]
      const prov = this._mapData[name]
      if (this.pointInPolygon(x, y, prov.path)) {
        wx.navigateTo({
          url: `/pages/cityCheck/cityCheck?province=${name}`
        })
        return
      }
    }
  },

  // 射线法判断点是否在多边形内
  pointInPolygon(x, y, polygon) {
    let inside = false
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0], yi = polygon[i][1]
      const xj = polygon[j][0], yj = polygon[j][1]
      const intersect = ((yi > y) !== (yj > y)) &&
        (x < (xj - xi) * (y - yi) / (yj - yi) + xi)
      if (intersect) inside = !inside
    }
    return inside
  },

  onProvinceTap(e) {
    const province = e.currentTarget.dataset.province
    wx.navigateTo({
      url: `/pages/cityCheck/cityCheck?province=${province}`
    })
  }
})