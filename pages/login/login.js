import { getUser, setUser, cloudLogin } from "../../utils/storage.js"

Page({
  data: {
    username: "",
    password: "",
    captcha: "",
    localCaptcha: "",
    error: "",
    avatar: "/images/default_avatar.jpg"
  },

  onLoad(options) {
    this.refreshCaptcha()
    // 如果注册后带头像参数过来，显示注册头像
    if (options.avatar) {
      this.setData({ avatar: decodeURIComponent(options.avatar) })
    }
  },

  createCaptcha() {
    let str = "0123456789abcdefghijklmnopqrstuvwxyz";
    let code = "";
    for(let i=0;i<4;i++){
      code += str[Math.floor(Math.random()*str.length)]
    }
    this.setData({
      localCaptcha: code
    })
  },

  refreshCaptcha() {
    this.createCaptcha();
    this.setData({ captcha: "" });
  },

  inputUsername(e) {
    this.setData({ 
      username: e.detail.value,
      error: ""
    });
  },

  inputPassword(e) {
    this.setData({ 
      password: e.detail.value,
      error: ""
    });
  },

  inputCaptcha(e) {
    this.setData({ 
      captcha: e.detail.value,
      error: ""
    });
  },

  async submitLogin() {
    const {username, password, captcha, localCaptcha} = this.data
    if (!username.trim()) {
      this.setData({ error: "请输入用户名" });
      return;
    }
    if (!password.trim()) {
      this.setData({ error: "请输入密码" });
      return;
    }
    if (!captcha.trim()) {
      this.setData({ error: "请输入验证码" });
      return;
    }
    if(captcha.toLowerCase() !== localCaptcha.toLowerCase()){
      this.setData({ error: "验证码错误" });
      this.refreshCaptcha();
      return;
    }

    wx.showLoading({ title: "登录中..." })
    const res = await cloudLogin(username.trim(), password.trim())
    wx.hideLoading()

    if (!res.success) {
      this.setData({ error: res.msg });
      this.refreshCaptcha();
      return;
    }

    setUser(res.data)
    wx.showToast({ title: "登录成功", icon: "success", duration: 1500 });

    setTimeout(() => {
      wx.navigateBack({
        success: () => {
          setTimeout(() => {
            wx.switchTab({ url: "/pages/index/index" });
          }, 100);
        }
      });
    }, 1500);
  },

  goRegister() {
    wx.navigateTo({ 
      url: "/pages/register/register",
      fail: () => {
        wx.showToast({ title: "注册页面未创建", icon: "none" });
      }
    });
  }
});