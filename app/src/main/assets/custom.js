window.addEventListener("DOMContentLoaded",()=>{const t=document.createElement("script");t.src="https://www.googletagmanager.com/gtag/js?id=G-W5GKHM0893",t.async=!0,document.head.appendChild(t);const n=document.createElement("script");n.textContent="window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-W5GKHM0893');",document.body.appendChild(n)});// ================= 配置区 =================

// 白名单（永远不拦）
const WHITE_LIST = [
    location.origin,
    'accounts.google.com',
    'github.com',
    'paypal.com',
]

// 广告 / 弹窗特征
const BLOCK_PATTERNS = [
    /ads?/i,
    /doubleclick/i,
    /tracker/i,
    /popunder/i,
    /affiliate/i,
]

// 判断是否命中白名单
const isWhiteListed = (url) =>
    WHITE_LIST.some((d) => url.includes(d))

// 判断是否像广告
const isAdLike = (url) =>
    BLOCK_PATTERNS.some((re) => re.test(url))

// ================= 用户手势标记 =================

let lastUserClickTime = 0

document.addEventListener(
    'click',
    () => {
        lastUserClickTime = Date.now()
    },
    true
)

// ================= 拦截 <a target="_blank"> =================

const hookClick = (e) => {
    const a = e.target.closest('a')
    if (!a || !a.href) return

    const isBlank =
        a.target === '_blank' ||
        document.querySelector('head base[target="_blank"]')

    if (!isBlank) return

    if (isWhiteListed(a.href)) return

    if (isAdLike(a.href)) {
        e.preventDefault()
        console.warn('[AdGuard-like] blocked link:', a.href)
        return
    }

    // 正常用户点击：允许，但转为当前页
    e.preventDefault()
    location.href = a.href
}

document.addEventListener('click', hookClick, { capture: true })

// ================= 拦截 window.open =================

const nativeOpen = window.open

window.open = function (url = '', target, features) {
    const now = Date.now()
    const isUserGesture = now - lastUserClickTime < 500

    if (!url) return null

    if (isWhiteListed(url)) {
        return nativeOpen.call(window, url, target, features)
    }

    // 非用户触发 or 广告特征 → 拦
    if (!isUserGesture || isAdLike(url)) {
        console.warn('[AdGuard-like] blocked window.open:', url)
        return null
    }

    // 用户真实行为：降级为当前页跳转
    location.href = url
    return null
}
