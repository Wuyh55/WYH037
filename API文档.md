# 凉嘟嘟 - API 接口文档

> 项目仓库: https://github.com/Wuyh55/WYH037

## 概述

本项目采用微信云开发架构，所有后端接口通过云函数实现。前端通过 `wx.cloud.callFunction()` 调用云函数，统一返回格式如下：

```json
{
  "success": true,
  "msg": "操作提示信息",
  "data": {}
}
```

### 通用参数

| 参数 | 类型 | 说明 |
|------|------|------|
| action | String | 操作类型，决定调用哪个接口 |
| data | Object | 业务数据，根据 action 不同而不同 |

---

## 一、login 云函数 - 用户管理

**云函数名称**: `login`  
**数据库集合**: `users`

### 1.1 用户注册

**action**: `register`

**请求参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | String | 是 | 用户名，2-20个字符 |
| password | String | 是 | 密码，不少于6位 |
| avatar | String | 否 | 头像URL，默认空字符串 |

**请求示例**:

```javascript
wx.cloud.callFunction({
  name: 'login',
  data: {
    action: 'register',
    data: {
      username: '张三',
      password: '123456',
      avatar: 'cloud://xxx.jpg'
    }
  }
})
```

**成功返回**:

```json
{
  "success": true,
  "msg": "注册成功",
  "data": {
    "id": "用户ID",
    "username": "张三",
    "avatar": "cloud://xxx.jpg"
  }
}
```

**错误返回**:

| 错误信息 | 原因 |
|----------|------|
| 用户名和密码不能为空 | 缺少必填参数 |
| 用户名长度需在2-20个字符之间 | 用户名长度不符合要求 |
| 密码长度不能少于6位 | 密码太短 |
| 用户名已存在 | 该用户名已被注册 |

---

### 1.2 用户登录

**action**: `login`

**请求参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | String | 是 | 用户名 |
| password | String | 是 | 密码 |

**请求示例**:

```javascript
wx.cloud.callFunction({
  name: 'login',
  data: {
    action: 'login',
    data: {
      username: '张三',
      password: '123456'
    }
  }
})
```

**成功返回**:

```json
{
  "success": true,
  "msg": "登录成功",
  "data": {
    "id": "用户ID",
    "username": "张三",
    "avatar": "cloud://xxx.jpg"
  }
}
```

**错误返回**:

| 错误信息 | 原因 |
|----------|------|
| 用户名和密码不能为空 | 缺少必填参数 |
| 用户名或密码错误 | 用户名不存在或密码错误 |

> **说明**: 密码使用 SHA256 哈希存储，同时兼容旧版明文密码，登录成功后自动升级为哈希密码。

---

### 1.3 获取用户信息

**action**: `getUser`

**请求参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | String | 是 | 用户ID |

**请求示例**:

```javascript
wx.cloud.callFunction({
  name: 'login',
  data: {
    action: 'getUser',
    data: { id: '用户ID' }
  }
})
```

**成功返回**:

```json
{
  "success": true,
  "data": {
    "_id": "用户ID",
    "username": "张三",
    "avatar": "cloud://xxx.jpg",
    "openid": "微信openid",
    "createTime": "2026/7/12 10:00:00"
  }
}
```

---

### 1.4 更新用户信息

**action**: `updateUser`

**请求参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | String | 是 | 用户ID |
| username | String | 否 | 新用户名 |
| avatar | String | 是 | 新头像URL |

**请求示例**:

```javascript
wx.cloud.callFunction({
  name: 'login',
  data: {
    action: 'updateUser',
    data: {
      id: '用户ID',
      username: '新名字',
      avatar: 'cloud://new.jpg'
    }
  }
})
```

**成功返回**:

```json
{
  "success": true,
  "msg": "更新成功"
}
```

---

### 1.5 删除用户

**action**: `deleteUser`

**请求参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | String | 是 | 用户ID |

**成功返回**:

```json
{
  "success": true,
  "msg": "删除成功"
}
```

---

## 二、album 云函数 - 相册管理

**云函数名称**: `album`  
**数据库集合**: `album`

### 2.1 创建相册

**action**: `add`

**请求参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | String | 是 | 相册名称，不超过50字符 |
| uid | String | 是 | 用户ID |
| fileList | Array | 否 | 图片文件列表，默认空数组 |
| photo_num | Number | 否 | 照片数量，默认0 |
| cover | String | 否 | 封面图URL，默认空字符串 |
| desc | String | 否 | 相册简介，默认空字符串 |

**请求示例**:

```javascript
wx.cloud.callFunction({
  name: 'album',
  data: {
    action: 'add',
    data: {
      name: '旅行相册',
      uid: '用户ID',
      cover: 'cloud://cover.jpg',
      desc: '2026年旅行记录'
    }
  }
})
```

**成功返回**:

```json
{
  "success": true,
  "data": {
    "id": "相册ID",
    "name": "旅行相册",
    "uid": "用户ID",
    "cover": "cloud://cover.jpg",
    "desc": "2026年旅行记录",
    "fileList": [],
    "photo_num": 0
  }
}
```

---

### 2.2 获取相册列表

**action**: `list`

**请求参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| uid | String | 是 | 用户ID |

**请求示例**:

```javascript
wx.cloud.callFunction({
  name: 'album',
  data: {
    action: 'list',
    data: { uid: '用户ID' }
  }
})
```

**成功返回**:

```json
{
  "success": true,
  "data": [
    {
      "id": "相册ID",
      "_id": "相册ID",
      "name": "旅行相册",
      "uid": "用户ID",
      "fileList": [...],
      "photo_num": 5,
      "cover": "cloud://cover.jpg",
      "desc": "2026年旅行记录",
      "createTime": "2026/7/12 10:00:00",
      "updateTime": "2026/7/12 10:00:00"
    }
  ]
}
```

> **说明**: 返回结果按创建时间倒序排列，每条记录额外包含 `id` 字段（等于 `_id`）。

---

### 2.3 获取相册详情

**action**: `get`

**请求参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | String | 是 | 相册ID |

**请求示例**:

```javascript
wx.cloud.callFunction({
  name: 'album',
  data: {
    action: 'get',
    data: { id: '相册ID' }
  }
})
```

**成功返回**:

```json
{
  "success": true,
  "data": {
    "id": "相册ID",
    "_id": "相册ID",
    "name": "旅行相册",
    "uid": "用户ID",
    "fileList": [
      {
        "url": "cloud://xxx.jpg",
        "title": "图片标题",
        "desc": "图片描述"
      }
    ],
    "photo_num": 5,
    "cover": "cloud://cover.jpg",
    "desc": "2026年旅行记录",
    "createTime": "2026/7/12 10:00:00",
    "updateTime": "2026/7/12 10:00:00"
  }
}
```

---

### 2.4 更新相册

**action**: `update`

**请求参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | String | 是 | 相册ID |
| name | String | 否 | 新名称 |
| fileList | Array | 否 | 新的文件列表 |
| photo_num | Number | 否 | 新照片数量 |
| cover | String | 否 | 新封面URL |
| desc | String | 否 | 新简介 |

**请求示例**:

```javascript
wx.cloud.callFunction({
  name: 'album',
  data: {
    action: 'update',
    data: {
      id: '相册ID',
      name: '新名称',
      fileList: [...],
      photo_num: 10
    }
  }
})
```

**成功返回**:

```json
{
  "success": true,
  "msg": "更新成功"
}
```

---

### 2.5 更新封面

**action**: `updateCover`

**请求参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | String | 是 | 相册ID |
| cover | String | 是 | 新封面URL |

**请求示例**:

```javascript
wx.cloud.callFunction({
  name: 'album',
  data: {
    action: 'updateCover',
    data: {
      id: '相册ID',
      cover: 'cloud://new-cover.jpg'
    }
  }
})
```

**成功返回**:

```json
{
  "success": true,
  "msg": "封面更新成功"
}
```

---

### 2.6 删除相册

**action**: `delete`

**请求参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | String | 是 | 相册ID |

**成功返回**:

```json
{
  "success": true,
  "msg": "删除成功"
}
```

---

## 三、recycle 云函数 - 回收站管理

**云函数名称**: `recycle`  
**数据库集合**: `recycle`

### 3.1 移入回收站

**action**: `add`

**请求参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| uid | String | 是 | 用户ID |
| type | String | 是 | 删除类型：`album`（相册）或 `img`（照片） |
| item | Object | 是 | 被删除的数据对象 |

**请求示例**:

```javascript
wx.cloud.callFunction({
  name: 'recycle',
  data: {
    action: 'add',
    data: {
      uid: '用户ID',
      type: 'album',
      item: {
        _id: '相册ID',
        name: '旅行相册',
        cover: 'cloud://cover.jpg',
        fileList: [...]
      }
    }
  }
})
```

**成功返回**:

```json
{
  "success": true,
  "data": {
    "id": "回收记录ID"
  }
}
```

> **说明**: 回收记录包含 `deleteTime`（删除时间）和 `expireTime`（过期时间，30天后），过期后应自动清理。

---

### 3.2 获取回收站列表

**action**: `list`

**请求参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| uid | String | 是 | 用户ID |

**请求示例**:

```javascript
wx.cloud.callFunction({
  name: 'recycle',
  data: {
    action: 'list',
    data: { uid: '用户ID' }
  }
})
```

**成功返回**:

```json
{
  "success": true,
  "data": [
    {
      "id": "回收记录ID",
      "_id": "回收记录ID",
      "uid": "用户ID",
      "type": "album",
      "item": { ... },
      "deleteTime": "2026/7/12 10:00:00",
      "expireTime": "2026/8/11 10:00:00"
    }
  ]
}
```

> **说明**: 返回结果按删除时间倒序排列。

---

### 3.3 恢复

**action**: `restore`

**请求参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | String | 是 | 回收记录ID |

**请求示例**:

```javascript
wx.cloud.callFunction({
  name: 'recycle',
  data: {
    action: 'restore',
    data: { id: '回收记录ID' }
  }
})
```

**成功返回**:

```json
{
  "success": true,
  "msg": "恢复成功"
}
```

> **说明**: 恢复操作会从回收站中删除该记录，前端需同时将数据写回原集合。

---

### 3.4 彻底删除

**action**: `delete`

**请求参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | String | 是 | 回收记录ID |

**成功返回**:

```json
{
  "success": true,
  "msg": "删除成功"
}
```

---

### 3.5 清空回收站

**action**: `clear`

**请求参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| uid | String | 是 | 用户ID |

**成功返回**:

```json
{
  "success": true,
  "msg": "清空成功"
}
```

---

## 四、checkIn 云函数 - 旅行打卡管理

**云函数名称**: `checkIn`  
**数据库集合**: `checkIn`

### 4.1 添加打卡记录

**action**: `add`

**请求参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| userId | String | 是 | 用户ID |
| province | String | 是 | 省份名称 |
| city | String | 是 | 城市名称 |
| image | String | 否 | 打卡图片URL（云存储fileID） |
| desc | String | 否 | 打卡描述 |

**请求示例**:

```javascript
wx.cloud.callFunction({
  name: 'checkIn',
  data: {
    action: 'add',
    data: {
      userId: '用户ID',
      province: '贵州',
      city: '贵阳',
      image: 'cloud://xxx.jpg',
      desc: '甲秀楼打卡'
    }
  }
})
```

**成功返回**:

```json
{
  "success": true,
  "data": {
    "id": "打卡记录ID",
    "userId": "用户ID",
    "province": "贵州",
    "city": "贵阳",
    "image": "cloud://xxx.jpg",
    "desc": "甲秀楼打卡"
  }
}
```

---

### 4.2 获取打卡记录列表

**action**: `list`

**请求参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| userId | String | 是 | 用户ID |

**请求示例**:

```javascript
wx.cloud.callFunction({
  name: 'checkIn',
  data: {
    action: 'list',
    data: { userId: '用户ID' }
  }
})
```

**成功返回**:

```json
{
  "success": true,
  "data": [
    {
      "id": "打卡记录ID",
      "_id": "打卡记录ID",
      "userId": "用户ID",
      "province": "贵州",
      "city": "贵阳",
      "image": "cloud://xxx.jpg",
      "desc": "甲秀楼打卡",
      "createTime": "2026/7/12 10:00:00"
    }
  ]
}
```

> **说明**: 返回结果按创建时间倒序排列。

---

### 4.3 获取打卡记录详情

**action**: `get`

**请求参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | String | 是 | 打卡记录ID |

**成功返回**:

```json
{
  "success": true,
  "data": {
    "id": "打卡记录ID",
    "_id": "打卡记录ID",
    "userId": "用户ID",
    "province": "贵州",
    "city": "贵阳",
    "image": "cloud://xxx.jpg",
    "desc": "甲秀楼打卡",
    "createTime": "2026/7/12 10:00:00"
  }
}
```

---

### 4.4 删除打卡记录

**action**: `delete`

**请求参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | String | 是 | 打卡记录ID |

**成功返回**:

```json
{
  "success": true,
  "msg": "删除成功"
}
```

---

## 五、数据库集合结构

### users 集合

```json
{
  "_id": "用户ID",
  "username": "用户名",
  "password": "SHA256哈希密码",
  "avatar": "头像URL",
  "openid": "微信openid",
  "createTime": "创建时间"
}
```

### album 集合

```json
{
  "_id": "相册ID",
  "name": "相册名称",
  "uid": "用户ID",
  "fileList": [
    {
      "url": "图片URL",
      "title": "图片标题",
      "desc": "图片描述"
    }
  ],
  "photo_num": 5,
  "cover": "封面图URL",
  "desc": "相册简介",
  "createTime": "创建时间",
  "updateTime": "更新时间"
}
```

### recycle 集合

```json
{
  "_id": "回收记录ID",
  "uid": "用户ID",
  "type": "album 或 img",
  "item": { "原始数据对象" },
  "deleteTime": "删除时间",
  "expireTime": "过期时间（30天后）"
}
```

### checkIn 集合

```json
{
  "_id": "打卡记录ID",
  "userId": "用户ID",
  "province": "省份",
  "city": "城市",
  "image": "打卡图片URL",
  "desc": "打卡描述",
  "createTime": "打卡时间"
}
```

---

## 六、错误码说明

| 错误信息 | 说明 |
|----------|------|
| 参数不完整 / xxx不能为空 | 缺少必填参数 |
| 用户名已存在 | 注册时用户名重复 |
| 用户名或密码错误 | 登录失败 |
| 用户不存在 | 用户ID无效 |
| 无效的删除类型 | type 不是 album 或 img |
| 未知操作 | action 参数值无效 |
| 服务器内部错误，请稍后重试 | 云函数内部异常 |
