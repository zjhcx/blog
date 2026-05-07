export default {
  // 网站标题
  Title: 'Chenxi Blog',
  // 网站地址
  Site: 'https://zjhcx.github.io/',
  // 网站副标题
  Subtitle: '114514',
  // 网站描述
  Description: 'Chenxi Blog',
  // 网站作者
  Author: 'chenxi',
  // 作者头像
  Avatar: '/assets/images/avatar.jpg',
  // 网站座右铭
  Motto: '114514',
  // Cover 网站缩略图
  Cover: '',
  // 网站侧边栏公告 (不填写即不开启)
  Tips: '',
  // 首页打字机文案列表
  TypeWriteList: [
    '114514',
    "191980",
  ],
  // 网站创建时间
  CreateTime: '2026-3-30',
  // 顶部 Banner 配置
  HomeBanner: {
    enable: true,
    // 首页高度
    HomeHeight: '38.88rem',
    // 其他页面高度
    PageHeight: '28.88rem',
    // 背景
    background: "url('/assets/images/b4847170889c59518a1d2861856ef2e5.jpg') no-repeat center 60%/cover",
  },
  // 博客主题配置
  Theme: {
    // 颜色请用 16 进制颜色码
    // 主题颜色
    "--vh-main-color": "#01C4B6",
    // 字体颜色
    "--vh-font-color": "#34495e",
    // 侧边栏宽度
    "--vh-aside-width": "318px",
    // 全局圆角
    "--vh-main-radius": "18px",
    // 主体内容宽度
    "--vh-main-max-width": "1458px",
  },
  // 深色模式主题配置
  DarkTheme: {
    // 主题颜色
    "--vh-main-color": "#00D4C4",
    // 字体颜色
    "--vh-font-color": "#E8E8E8",
    // 侧边栏宽度
    "--vh-aside-width": "318px",
    // 全局圆角
    "--vh-main-radius": "18px",
    // 主体内容宽度
    "--vh-main-max-width": "1458px",
    // 深色模式特有变量
    "--vh-white-color": "#1A1A1A",
    "--vh-body-bg": "#0D0D0D",
    "--vh-box-shadow": "0 3px 8px 6px rgba(0, 0, 0, 0.3)",
  },
  // 导航栏 (新窗口打开 newWindow: true)
  Navs: [
    // 仅支持 SVG 且 SVG 需放在 public/assets/images/svg/ 目录下，填入文件名即可 <不需要文件后缀名>（封装了 SVG 组件 为了极致压缩 SVG）
    // 建议使用 https://tabler.io/icons 直接下载 SVG
    { text: '友链', link: '/links', icon: 'Nav_friends' },
    //{ text: '圈子', link: '/friends', icon: 'Nav_rss' },
    //{ text: '动态', link: '/talking', icon: 'Nav_talking' },
    { text: '归档', link: '/archives', icon: 'Nav_archives' },
    //{ text: '留言', link: '/message', icon: 'Nav_message' },
    { text: '关于', link: '/about', icon: 'Nav_about' },
    //{ text: 'API', link: 'https://api.vvhan.com/', target: true, icon: 'Nav_link' },
  ],
  // 侧边栏个人网站
  WebSites: [
    // 仅支持 SVG 且 SVG 需放在 public/assets/images/svg/ 目录下，填入文件名即可 <不需要文件后缀名>（封装了 SVG 组件 为了极致压缩 SVG）
    // 建议使用 https://tabler.io/icons 直接下载 SVG
    { text: 'Github', link: 'https://github.com/zjhcx', icon: 'WebSite_github' },
    //{ text: '韩小韩API', link: 'https://api.vvhan.com', icon: 'WebSite_api' },
    //{ text: '每日热榜', link: 'https://hot.vvhan.com', icon: 'WebSite_hot' },
    //{ text: '骤雨重山图床', link: 'https://wp-cdn.4ce.cn', icon: 'WebSite_img' },
    //{ text: 'HanAnalytics', link: 'https://analytics.vvhan.com', icon: 'WebSite_analytics' },
  ],
  // 侧边栏展示
  AsideShow: {
    // 是否展示个人网站
    WebSitesShow: true,
    // 是否展示分类
    CategoriesShow: true,
    // 是否展示标签
    TagsShow: true,
    // 是否展示推荐文章
    recommendArticleShow: true
  },
  // DNS预解析地址
  DNSOptimization: [
    //'https://i0.wp.com',
    //'https://cn.cravatar.com',
    //'https://analytics.vvhan.com',
    //'https://vh-api.4ce.cn',
    //'https://registry.npmmirror.com',
    //'https://pagead2.googlesyndication.com'
  ],
  // 博客音乐组件解析接口
  vhMusicApi: '',
  // 评论组件（只允许同时开启一个）
  Comment: {
    // Twikoo 评论
    Twikoo: {
      enable: false,
      envId: ''
    },
    // Waline 评论
    Waline: {
      enable: false,
      serverURL: ''
    }
  },
  // Han Analytics 统计（https://github.com/uxiaohan/HanAnalytics）
  HanAnalytics: { enable: false, server: 'https://analytics.vvhan.com', siteId: 'Hello-HanHexoBlog' },
  // Google 广告
  GoogleAds: {
    ad_Client: '', //ca-pub-xxxxxx
    // 侧边栏广告(不填不开启)
    asideAD_Slot: ``,
    // 文章页广告(不填不开启)
    articleAD_Slot: ``
  },
  // 文章内赞赏码
  Reward: {
    // 支付宝收款码
    AliPay: '',
    // 微信收款码
    WeChat: ''
  },
  // 访问网页 自动推送到搜索引擎
  SeoPush: {
    enable: false,
    serverApi: '',
    paramsName: 'url'
  },
  // 页面阻尼滚动速度
  ScrollSpeed: 666
}