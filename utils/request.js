const baseUrl = "http://localhost/backend/api";

export function apiPost(url, data) {
    const token = wx.getStorageSync('user')?.token || '';
    return new Promise((resolve, reject) => {
        wx.request({
            url: baseUrl + url,
            method: "POST",
            timeout: 10000,
            header: {
                "Content-Type": "application/x-www-form-urlencoded",
                "token": token
            },
            data: data,
            success: res => {
                if(res.data.code === 401){
                    wx.showToast({title:'请重新登录',icon:'none'});
                    wx.clearStorageSync('user');
                    wx.switchTab({url:'/pages/mine/mine'});
                    return;
                }
                resolve(res.data);
            },
            fail: err => reject(err)
        })
    })
}

export function uploadFile(albumId, userId, desc, tempPath) {
    const token = wx.getStorageSync('user')?.token || '';
    return new Promise((resolve, reject) => {
        wx.uploadFile({
            url: baseUrl + "/file.php",
            filePath: tempPath,
            name: "file",
            timeout: 10000,
            header:{token:token},
            formData: {
                action: "upload",
                user_id: userId,
                album_id: albumId,
                file_desc: desc
            },
            success: res => {
                try {
                    let data = JSON.parse(res.data);
                    resolve(data);
                } catch (e) {
                    reject(res.data);
                }
            },
            fail: err => reject(err)
        })
    })
}