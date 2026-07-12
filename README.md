# 凉嘟嘟 - 微信小程序相册管理应用

> 项目仓库: https://github.com/Wuyh55/WYH037

## 项目介绍

"凉嘟嘟"是一款基于微信小程序平台的相册管理小程序，采用微信云开发架构，为用户提供相册管理、照片上传、旅行打卡等功能。帮助用户系统化地管理照片，记录旅行足迹，保存人生中的美好瞬间。

### 核心功能

- **用户系统**：注册/登录、编辑个人资料、头像上传
- **相册管理**：创建相册、上传照片、设置封面、编辑备注、重命名、删除
- **回收站**：软删除照片和相册、恢复、彻底删除、7天自动过期
- **旅行打卡**：34省份网格打卡、Canvas中国地图可视化、城市打卡记录
- **个人中心**：数据统计、批量导出、缓存清理

## 技术栈

| 技术 | 说明 |
|------|------|
| 微信小程序原生框架 | WXML + WXSS + JavaScript (ES6+) |
| 微信云开发 | 云函数 + 云数据库(MongoDB) + 云存储 |
| Canvas 2D API | 绘制中国地图，实现打卡可视化 |
| Swiper 组件 | 左右滑动切换文字版和地图版视图 |

### 项目结构

```
huiyi/
├── pages/              # 页面目录（18个页面）
│   ├── index/          # 首页 - 相册列表
│   ├── create/         # 创建相册
│   ├── recycle/        # 回收站
│   ├── mine/           # 个人中心
│   ├── login/          # 登录
│   ├── register/       # 注册
│   ├── albumDetail/    # 相册详情
│   ├── upload/         # 上传照片
│   ├── setCover/       # 设置封面
│   ├── checkIn/        # 打卡记录
│   ├── cityCheck/      # 城市打卡
│   ── ...
├── cloudfunctions/     # 云函数目录
│   ├── login/          # 用户管理
│   ├── album/          # 相册操作
│   ├── recycle/        # 回收站管理
│   └── checkIn/        # 打卡记录管理
├── utils/              # 工具模块
│   ├── storage.js      # 云开发请求封装
│   ├── chinaMapData.js # 中国地图坐标数据
│   └── ...
├── components/         # 自定义组件
├── images/             # 静态图片资源
├── app.js              # 小程序入口
├── app.json            # 全局配置
└── app.wxss            # 全局样式
```

## 安装与运行指南

### 环境要求

- 微信开发者工具（最新稳定版）
- 微信小程序 AppID
- 微信云开发环境

### 运行步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/Wuyh/WYH037.git
   ```

2. **导入项目**
   - 打开微信开发者工具
   - 选择「导入项目」
   - 选择项目目录 `huiyi/`
   - 填入你的 AppID

3. **配置云开发**
   - 在微信开发者工具中点击「云开发」
   - 创建云开发环境
   - 在 `app.js` 中修改 `env` 为你的云开发环境ID

4. **创建数据库集合**
   - 在云开发控制台创建以下集合：
     - `users` - 用户信息
     - `album` - 相册数据
     - `recycle` - 回收站
     - `checkIn` - 打卡记录

5. **部署云函数**
   - 右键 `cloudfunctions/login` → 上传并部署：云端安装依赖
   - 右键 `cloudfunctions/album` → 上传并部署：云端安装依赖
   - 右键 `cloudfunctions/recycle` → 上传并部署：云端安装依赖
   - 右键 `cloudfunctions/checkIn` → 上传并部署：云端安装依赖

6. **编译运行**
   - 点击微信开发者工具的「编译」按钮
   - 在模拟器中预览效果

## API 文档

### 云函数接口

所有云函数通过 `wx.cloud.callFunction()` 调用，统一返回格式：

```json
{
  "success": true/false,
  "msg": "提示信息",
  "data": {}
}
```

#### 1. login 云函数 - 用户管理

**注册**
```javascript
wx.cloud.callFunction({
  name: 'login',
  data: {
    action: 'register',
    data: { username, password, avatar }
  }
})
```

**登录**
```javascript
wx.cloud.callFunction({
  name: 'login',
  data: {
    action: 'login',
    data: { username, password }
  }
})
```

**更新用户信息**
```javascript
wx.cloud.callFunction({
  name: 'login',
  data: {
    action: 'updateUser',
    data: { avatar, username, email }
  }
})
```

#### 2. album 云函数 - 相册操作

**创建相册**
```javascript
wx.cloud.callFunction({
  name: 'album',
  data: {
    action: 'add',
    data: { name, uid, fileList, cover, desc, photo_num }
  }
})
```

**获取相册列表**
```javascript
wx.cloud.callFunction({
  name: 'album',
  data: {
    action: 'list',
    data: { uid }
  }
})
```

**获取相册详情**
```javascript
wx.cloud.callFunction({
  name: 'album',
  data: {
    action: 'detail',
    data: { id }
  }
})
```

**更新相册**
```javascript
wx.cloud.callFunction({
  name: 'album',
  data: {
    action: 'update',
    data: { id, name, fileList, cover, desc, photo_num }
  }
})
```

**删除相册**
```javascript
wx.cloud.callFunction({
  name: 'album',
  data: {
    action: 'delete',
    data: { id }
  }
})
```

#### 3. recycle 云函数 - 回收站管理

**移入回收站**
```javascript
wx.cloud.callFunction({
  name: 'recycle',
  data: {
    action: 'add',
    data: { item, type, uid }
  }
})
```

**获取回收站列表**
```javascript
wx.cloud.callFunction({
  name: 'recycle',
  data: {
    action: 'list',
    data: { uid }
  }
})
```

**恢复**
```javascript
wx.cloud.callFunction({
  name: 'recycle',
  data: {
    action: 'restore',
    data: { id, type }
  }
})
```

**彻底删除**
```javascript
wx.cloud.callFunction({
  name: 'recycle',
  data: {
    action: 'delete',
    data: { id }
  }
})
```

**清空回收站**
```javascript
wx.cloud.callFunction({
  name: 'recycle',
  data: {
    action: 'clear',
    data: { uid }
  }
})
```

#### 4. checkIn 云函数 - 打卡记录管理

**添加打卡记录**
```javascript
wx.cloud.callFunction({
  name: 'checkIn',
  data: {
    action: 'add',
    data: { userId, province, city, image, desc }
  }
})
```

**获取打卡记录**
```javascript
wx.cloud.callFunction({
  name: 'checkIn',
  data: {
    action: 'list',
    data: { userId }
  }
})
```

**获取省份打卡记录**
```javascript
wx.cloud.callFunction({
  name: 'checkIn',
  data: {
    action: 'provinceList',
    data: { userId, province }
  }
})
```

## 数据库设计

### users 集合
| 字段 | 类型 | 说明 |
|------|------|------|
| _id | String | 用户ID |
| username | String | 用户名 |
| password | String | 密码 |
| avatar | String | 头像URL |
| openid | String | 微信openid |
| createTime | String | 创建时间 |

### album 集合
| 字段 | 类型 | 说明 |
|------|------|------|
| _id | String | 相册ID |
| name | String | 相册名称 |
| uid | String | 用户ID |
| fileList | Array | 图片文件列表 |
| photo_num | Number | 照片数量 |
| cover | String | 封面图URL |
| desc | String | 相册简介 |
| createTime | String | 创建时间 |
| updateTime | String | 更新时间 |

### recycle 集合
| 字段 | 类型 | 说明 |
|------|------|------|
| _id | String | 记录ID |
| item | Object | 原始数据 |
| type | String | 类型(album/img) |
| uid | String | 用户ID |
| deleteTime | String | 删除时间 |
| expireTime | String | 过期时间 |

### checkIn 集合
| 字段 | 类型 | 说明 |
|------|------|------|
| _id | String | 记录ID |
| userId | String | 用户ID |
| province | String | 省份 |
| city | String | 城市 |
| image | String | 打卡图片URL |
| desc | String | 打卡描述 |
| time | String | 打卡时间 |
