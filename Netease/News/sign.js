/******************************************
# 网易新闻签到脚本
# 来自: https://github.com/keenl/QuantumultX-1/blob/master/chavyleung/neteasenews/neteasenews.js
# 打开 APP 然后手动签到 1 次
###########################################
[mitm] 
hostname = *.m.163.com

[rewrite_local]
# 获取Cookie
^https:\/\/(.*?)c\.m\.163\.com\/uc\/api\/sign\/v3\/commit url script-request-body https://raw.githubusercontent.com/braumhuang/QuantumultX/master/Netease/News/cookie.js

[task_local]
# 网易新闻签到
0 8 * * * https://raw.githubusercontent.com/braumhuang/QuantumultX/master/Netease/News/sign.js, tag=网易新闻签到, img-url=https://raw.githubusercontent.com/braumhuang/QuantumultX/master/Netease/News/icon.png, enabled=true
******************************************/

const cookieName = '网易新闻'
const cookieKey = 'chavy_cookie_neteasenews'
const bodyKey = 'chavy_body_neteasenews'
const chavy = init()
const cookieVal = JSON.parse(chavy.getdata(cookieKey))
const bodyVal = chavy.getdata(bodyKey)

sign()

function sign() {
  if (bodyVal) {
    let url = { url: `https://c.m.163.com/uc/api/sign/v2/commit`, headers: cookieVal }
    url["body"] = bodyVal
    chavy.post(url, (error, response, data) => {
      chavy.log(`${cookieName}, data: ${data}`)
      let result = JSON.parse(data)
      const title = `${cookieName}`
      let subTitle = ``
      let detail = ``
      if (result.code == 200) {
        subTitle = '签到结果: 成功'
        detail = `连签: +${result.data.serialDays}, 金币: ${result.data.awardGoldCoin}, 说明: ${result.msg}`
      } else if (result.code == 700) {
        subTitle = '签到结果: 成功 (重复签到)'
        detail = `说明: ${result.msg}`
      } else {
        subTitle = '签到结果: 失败'
        detail = `编码: ${result.code}, 说明: ${result.msg}`
      }
      if (error) {
        subTitle = '请求错误'
      }
      chavy.msg(title, subTitle, detail)
      chavy.log(subTitle)
    })
  } else {
    const title = `${cookieName}`
    let subTitle = `签到结果: 失败`
    let detail = `说明: body参数为空`
    if (isQuanX()) detail += `, QuanX用户请手动抓包 body 参数!`
    chavy.msg(title, subTitle, detail)
    chavy.log(subTitle)
  }

  chavy.done()
}

function init() {
  isSurge = () => {
    return undefined === this.$httpClient ? false : true
  }
  isQuanX = () => {
    return undefined === this.$task ? false : true
  }
  getdata = (key) => {
    if (isSurge()) return $persistentStore.read(key)
    if (isQuanX()) return $prefs.valueForKey(key)
  }
  setdata = (key, val) => {
    if (isSurge()) return $persistentStore.write(key, val)
    if (isQuanX()) return $prefs.setValueForKey(key, val)
  }
  msg = (title, subtitle, body) => {
    if (isSurge()) $notification.post(title, subtitle, body)
    if (isQuanX()) $notify(title, subtitle, body)
  }
  log = (message) => console.log(message)
  get = (url, cb) => {
    if (isSurge()) {
      $httpClient.get(url, cb)
    }
    if (isQuanX()) {
      url.method = 'GET'
      $task.fetch(url).then((resp) => cb(null, {}, resp.body))
    }
  }
  post = (url, cb) => {
    if (isSurge()) {
      $httpClient.post(url, cb)
    }
    if (isQuanX()) {
      url["method"] = 'POST'
      $task.fetch(url).then((resp) => cb(null, {}, resp.body), (reason) => cb(reason.error, null, null))
    }
  }
  done = (value = {}) => {
    $done(value)
  }
  return { isSurge, isQuanX, msg, log, getdata, setdata, get, post, done }
}