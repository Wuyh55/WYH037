import { setUser, cloudRegister } from "../../utils/storage.js"

Page({
  data:{
    avatar:"/images/default_avatar.jpg",
    username:"",
    password:"",
    confirm_pwd:"",
    email:"",
    captcha:"",
    localCaptcha:""
  },
  onLoad(){
    this.createCaptcha()
  },
  createCaptcha(){
    let str = "0123456789abcdefghijklmnopqrstuvwxyz";
    let code = "";
    for(let i=0;i<4;i++){
      code += str[Math.floor(Math.random()*str.length)]
    }
    this.setData({localCaptcha: code})
  },
  refreshCaptcha(){
    this.createCaptcha()
  },
  chooseAvatar(){
    wx.chooseImage({
      count:1,
      success: res=>{
        this.setData({avatar: res.tempFilePaths[0]})
      }
    })
  },
  inputUsername(e){this.setData({username:e.detail.value})},
  inputPassword(e){this.setData({password:e.detail.value})},
  inputConfirm(e){this.setData({confirm_pwd:e.detail.value})},
  inputEmail(e){this.setData({email:e.detail.value})},
  inputCaptcha(e){this.setData({captcha:e.detail.value})},
  
  async submitRegister(){
    const {username,password,confirm_pwd,email,captcha,localCaptcha,avatar} = this.data
    if(!username||!password||!confirm_pwd||!email){
      wx.showToast({title:"所有内容不能为空",icon:"none"})
      return
    }
    if(password !== confirm_pwd){
      wx.showToast({title:"两次密码不一致",icon:"none"})
      return
    }
    if(username.length<3 || password.length<6){
      wx.showToast({title:"用户名≥3位，密码≥6位",icon:"none"})
      return
    }
    if(captcha.toLowerCase() !== localCaptcha.toLowerCase()){
      wx.showToast({title:"验证码错误",icon:"none"})
      this.createCaptcha()
      return
    }

    wx.showLoading({ title: "注册中..." })
    const res = await cloudRegister(username.trim(), password.trim(), avatar)
    wx.hideLoading()

    if (!res.success) {
      wx.showToast({ title: res.msg, icon: "none" })
      return
    }

    setUser(res.data)
    wx.showToast({title:"注册成功"})
    setTimeout(()=>{
      wx.redirectTo({
        url: `/pages/login/login?avatar=${encodeURIComponent(avatar)}`
      })
    }, 1200)
  },
  goLogin(){
    wx.navigateTo({url:"/pages/login/login"})
  }
})