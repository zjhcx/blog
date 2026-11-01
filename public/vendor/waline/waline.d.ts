//#region ../api/dist/index.d.ts
//#region src/utils.d.ts
interface BaseAPIOptions {
  /**
   * Waline 服务端地址
   *
   * Waline serverURL
   */
  serverURL: string;
  /**
   * 错误信息所使用的语言
   *
   * Language used in error text
   */
  lang: string;
}
interface ErrorStatusResponse {
  /**
   * 错误代码
   *
   * Error number
   */
  errno: number;
  /**
   * 错误消息
   *
   * Error msg
   */
  errmsg: string;
}
//#endregion
//#region src/articleCounter.d.ts
export interface GetArticleCounterOptions extends BaseAPIOptions {
  /**
   * 待获取计数器的 path
   *
   * Path of counters
   */
  paths: string[];
  /**
   * 待获取计数器的类型
   *
   * Counter type to be fetched
   */
  type: string[];
  /**
   * 取消请求的信号
   *
   * AbortSignal to cancel request
   */
  signal?: AbortSignal;
}
export interface CounterFields {
  time?: number;
  reaction0?: number;
  reaction1?: number;
  reaction2?: number;
  reaction3?: number;
  reaction4?: number;
  reaction5?: number;
  reaction6?: number;
  reaction7?: number;
  reaction8?: number;
}
export type GetArticleCounterResponseItem = Record<string, number> & CounterFields;
export type GetArticleCounterResponse = GetArticleCounterResponseItem[];
export declare const getArticleCounter: ({ serverURL, lang, paths, type, signal }: GetArticleCounterOptions) => Promise<GetArticleCounterResponse>;
export interface UpdateArticleCounterOptions extends BaseAPIOptions {
  /**
   * 待更新计数器的 path
   *
   * Path of counter to be updated
   */
  path: string;
  /**
   * 待更新计数器的类型
   *
   * Counter type to be updated
   */
  type: string;
  /**
   * 更新操作
   *
   * Update operation
   *
   * @default 'inc'
   */
  action?: 'inc' | 'desc';
}
export declare const updateArticleCounter: ({ serverURL, lang, path, type, action }: UpdateArticleCounterOptions) => Promise<GetArticleCounterResponse>;
//#endregion
//#region src/typings.d.ts
type WalineCommentStatus = 'approved' | 'waiting' | 'spam';
type WalineUserType = 'administrator' | 'guest';
interface WalineCommentData {
  /** User Nickname */
  nick: string;
  /** User email */
  mail?: string;
  /** User link */
  link?: string;
  /** Content of comment */
  comment: string;
  /** User Agent */
  ua: string;
  /** Comment page path */
  url: string;
  /**
   * Parent comment id
   *
   * Only available when replying comment
   */
  pid?: number;
  /**
   * Root comment id
   *
   * Only available when replying comment
   */
  rid?: number;
  /**
   * User id being at
   *
   * Only available when replying comment
   */
  at?: string;
  /** Recaptcha Token */
  recaptchaV3?: string;
  /** Turnstile Token */
  turnstile?: string;
  /** Cap CAPTCHA token */
  cap?: string;
}
interface BaseWalineResponseComment {
  /** Comment object ID */
  objectId: number;
  /** Timestamp of the comment */
  time: number;
  /** Content of comment */
  comment: string;
  /**
   * Original comment content
   *
   * 原始评论内容
   */
  orig: string;
  /**
   * Comment like number
   *
   * 评论喜欢数
   */
  like: number;
  /** User Nickname */
  nick: string;
  /** User link */
  link: string;
  /** User avatar */
  avatar: string;
  /**
   * User type
   *
   * Only available with logged in user 用户类型
   *
   * 仅在登录用户时可用
   */
  type?: WalineUserType;
  /**
   * User ID
   *
   * Only available with logged in user 用户 ID
   *
   * 仅在登录用户时可用
   */
  user_id?: number;
  /**
   * User location
   *
   * Not available with `DISABLE_REGION=true` 用户位置
   *
   * `DISABLE_REGION=true` 时不可用
   */
  addr?: string;
  /**
   * User browser
   *
   * Not available with `DISABLE_USERAGENT=true` 用户浏览器
   *
   * `DISABLE_USERAGENT=true` 时不可用
   */
  browser?: string;
  /**
   * User location
   *
   * Not available with `DISABLE_USERAGENT=true` 用户位置
   *
   * `DISABLE_USERAGENT=true` 时不可用
   */
  os?: string;
  /**
   * User level
   *
   * Only available when `LEVELS` is set 用户等级
   *
   * 仅在 `LEVELS` 设置时可用
   */
  level?: number;
  /**
   * User label
   *
   * 用户标签
   */
  label?: string;
  /**
   * Comment status
   *
   * For administrators, `approved` `spam` `waiting` can be get, for others, the only value is
   * `approved` 评论状态
   *
   * 管理员可获得 `approved`、`spam` 和 `waiting`，其他用户只能获得 `approved`
   */
  status?: WalineCommentStatus;
}
interface WalineChildComment extends BaseWalineResponseComment {
  /** Parent comment id */
  pid: number;
  /** Root comment id */
  rid: number;
  /** User id being at */
  at?: string;
  /** Reply user information */
  reply_user?: {
    nick: string;
    link: string;
    avatar: string;
  };
}
interface WalineRootComment extends BaseWalineResponseComment {
  /**
   * Whether the comment is sticky
   *
   * 是否置顶
   */
  sticky: boolean;
  /**
   * Child comments
   *
   * 子评论
   */
  children: WalineChildComment[];
}
type WalineComment = WalineRootComment | WalineChildComment;
//#endregion
//#region src/comment.d.ts
export interface GetCommentOptions extends BaseAPIOptions {
  /**
   * 待获取评论列表的 path
   *
   * Path of comment list
   */
  path: string;
  /**
   * 评论分页数
   *
   * Comment pagination number
   */
  page: number;
  /**
   * 每页评论个数
   *
   * Comment number per page
   */
  pageSize: number;
  /**
   * 排序方式
   *
   * Sort method
   */
  sortBy: string;
  /**
   * 用户令牌
   *
   * User token
   */
  token?: string;
  /**
   * 取消请求的信号
   *
   * AbortSignal to cancel request
   */
  signal?: AbortSignal;
}
export interface GetCommentResponse {
  /**
   * 评论数量
   *
   * Comment number
   */
  count: number;
  /**
   * 评论分页数
   *
   * Comment pagination number
   */
  page: number;
  /**
   * 每页评论个数
   *
   * Comment number per page
   */
  pageSize: number;
  /**
   * 评论数据
   *
   * Comment Data
   */
  data: WalineRootComment[];
  /**
   * 页面总数
   *
   * Page number
   */
  totalPages: number;
}
export declare const getComment: ({ serverURL, lang, path, page, pageSize, sortBy, signal, token }: GetCommentOptions) => Promise<GetCommentResponse>;
export interface AddCommentOptions extends BaseAPIOptions {
  /**
   * 用户令牌
   *
   * User token
   */
  token?: string;
  /**
   * 用户待提交的评论数据
   *
   * Comment data being submitted by user
   */
  comment: WalineCommentData;
}
export interface AddCommentResponse extends ErrorStatusResponse {
  /**
   * 渲染好的评论数据
   *
   * Comment data rendered
   */
  data?: WalineComment;
}
export declare const addComment: ({ serverURL, lang, token, comment }: AddCommentOptions) => Promise<AddCommentResponse>;
export interface DeleteCommentOptions extends BaseAPIOptions {
  /**
   * Auth token
   *
   * 认证令牌
   */
  token: string;
  /**
   * Comment objectId to be deleted
   *
   * 待删除的评论对象 ID
   */
  objectId: number;
}
export interface DeleteCommentResponse extends ErrorStatusResponse {
  data: '';
}
export declare const deleteComment: ({ serverURL, lang, token, objectId }: DeleteCommentOptions) => Promise<DeleteCommentResponse>;
interface UpdateWalineCommentData extends Partial<WalineCommentData> {
  /**
   * 点赞还是取消点赞
   *
   * Like or dislike
   */
  like?: boolean;
  /**
   * 评论的状态
   *
   * Comment status
   */
  status?: 'approved' | 'waiting' | 'spam';
  /**
   * 评论指定状态
   *
   * Comment sticky status
   *
   * 0 means not sticky and 1 means sticky
   */
  sticky?: 0 | 1;
}
export interface UpdateCommentOptions extends BaseAPIOptions {
  /**
   * 用户令牌
   *
   * User token
   */
  token: string;
  /**
   * 评论的 ID
   *
   * Comment ID
   */
  objectId: number;
  /**
   * 评论数据
   *
   * Comment data
   */
  comment?: UpdateWalineCommentData;
}
export interface UpdateCommentResponse extends ErrorStatusResponse {
  /**
   * 更新后的评论数据
   *
   * Comment data rendered
   */
  data: WalineComment;
}
export declare const updateComment: ({ serverURL, lang, token, objectId, comment }: UpdateCommentOptions) => Promise<UpdateCommentResponse>;
//#endregion
//#region src/commentCount.d.ts
export interface GetCommentCountOptions extends BaseAPIOptions {
  /**
   * 待获取评论数的 path
   *
   * Path of pages to be fetched
   */
  paths: string[];
  /**
   * 取消请求的信号
   *
   * AbortSignal to cancel request
   */
  signal?: AbortSignal;
}
export declare const fetchCommentCount: ({ serverURL, lang, paths, signal }: GetCommentCountOptions) => Promise<number[]>;
//#endregion
//#region src/login.d.ts
export interface UserInfo {
  /**
   * 显示姓名
   *
   * User name displayed
   */
  display_name: string;
  /**
   * 用户电子邮件地址
   *
   * User email
   */
  email: string;
  /**
   * 用户网站地址
   *
   * User website
   */
  url: string;
  /**
   * 用户令牌
   *
   * User token
   */
  token: string;
  /**
   * 用户头像
   *
   * User avatar
   */
  avatar: string;
  /**
   * 用户对象 ID
   *
   * User object ID
   */
  objectId: number;
  /**
   * 用户身份
   *
   * User role
   */
  type: 'administrator' | 'guest';
}
export declare const login: ({ lang, serverURL }: BaseAPIOptions) => Promise<UserInfo & {
  remember: boolean;
}>;
//#endregion
//#region src/pageview.d.ts
interface GetPageviewOptions extends BaseAPIOptions {
  /**
   * 待获取页面的 path
   *
   * Path of pages
   */
  paths: string[];
  /**
   * 取消请求的信号
   *
   * AbortSignal to cancel request
   */
  signal?: AbortSignal;
}
export declare const getPageview: ({ serverURL, lang, paths, signal }: GetPageviewOptions) => Promise<GetArticleCounterResponse>;
export interface UpdatePageviewOptions extends BaseAPIOptions {
  /**
   * 待更新页面的 path
   *
   * Path of pages
   */
  path: string;
}
export declare const updatePageview: (options: UpdatePageviewOptions) => Promise<GetArticleCounterResponse>;
//#endregion
//#region src/recentComment.d.ts
export interface GetRecentCommentOptions extends BaseAPIOptions {
  /**
   * 获取评论的数量
   *
   * Comment number to be fetched
   */
  count: number;
  /**
   * 取消请求的信号
   *
   * AbortSignal to cancel request
   */
  signal?: AbortSignal;
  /**
   * 用户令牌
   *
   * User token
   */
  token?: string;
}
export interface RecentCommentData extends BaseWalineResponseComment {
  /**
   * Page url where comment locales
   *
   * 评论所在页面地址
   */
  url: string;
}
export declare const getRecentComment: ({ serverURL, lang, count, signal, token }: GetRecentCommentOptions) => Promise<RecentCommentData[]>;
//#endregion
//#region src/user.d.ts
export interface GetUserListOptions extends BaseAPIOptions {
  /**
   * 每页个数
   *
   * Number per page
   */
  pageSize: number;
  /**
   * 取消请求的信号
   *
   * AbortSignal to cancel request
   */
  signal?: AbortSignal;
}
export interface WalineUser extends Pick<WalineComment, 'nick' | 'link' | 'avatar' | 'label' | 'level'> {
  count: number;
}
export interface GetUserListResponse extends ErrorStatusResponse {
  data: WalineUser[];
}
export declare const getUserList: ({ serverURL, signal, pageSize, lang }: GetUserListOptions) => Promise<WalineUser[]>;
//#endregion
//#region src/typings/base.d.ts
type WalineCommentSorting = 'latest' | 'oldest' | 'hottest';
type WalineEmojiPresets = `//${string}` | `http://${string}` | `https://${string}`;
interface WalineEmojiInfo {
  /**
   * 选项卡上的 Emoji 名称
   *
   * Emoji name show on tab
   */
  name: string;
  /**
   * 所在文件夹链接
   *
   * Current folder link
   */
  folder?: string;
  /**
   * Emoji 通用路径前缀
   *
   * Common prefix of Emoji icons
   */
  prefix?: string;
  /**
   * Emoji 图片的类型，会作为文件扩展名使用
   *
   * Type of Emoji icons, will be regarded as file extension
   */
  type?: string;
  /**
   * 选项卡显示的 Emoji 图标
   *
   * Emoji icon show on tab
   */
  icon: string;
  /**
   * Emoji 图片列表
   *
   * Emoji image list
   */
  items: string[];
}
type WalineEmojiMaps = Record<string, string>;
type WalineLoginStatus = 'enable' | 'disable' | 'force';
interface WalineSearchImageData extends Record<string, unknown> {
  /**
   * 图片链接
   *
   * Image link
   */
  src: string;
  /**
   * 图片标题
   *
   * 用于图片的 alt 属性
   *
   * Image title
   *
   * Used for alt attribute of image
   */
  title?: string;
  /**
   * 图片缩略图
   *
   * 为了更好的加载性能，我们会优先在列表中使用此缩略图
   *
   * Image preview link
   *
   * For better loading performance, we will use this thumbnail first in the list
   *
   * @default src
   */
  preview?: string;
}
type WalineSearchResult = WalineSearchImageData[];
interface WalineSearchOptions {
  /**
   * 搜索操作
   *
   * Search action
   */
  search: (word: string) => Promise<WalineSearchResult>;
  /**
   * 打开列表时展示的默认结果
   *
   * Default result when opening list
   *
   * @default () => search('')
   */
  default?: () => Promise<WalineSearchResult>;
  /**
   * 获取更多的操作
   *
   * 会在列表滚动到底部时触发，如果你的搜索服务支持分页功能，你应该设置此项实现无限滚动
   *
   * Fetch more action
   *
   * It will be triggered when the list scrolls to the bottom. If your search service supports
   * paging, you should set this to achieve infinite scrolling
   *
   * @default (word) => search(word)
   */
  more?: (word: string, currentCount: number) => Promise<WalineSearchResult>;
}
type WalineMeta = 'nick' | 'mail' | 'link';
type WalineImageUploader = (image: File) => Promise<string>;
type WalineHighlighter = (code: string, lang: string) => string;
type WalineTeXRenderer = (blockMode: boolean, tex: string) => string;
//#endregion
//#region src/typings/locale.d.ts
interface WalineDateLocale {
  seconds: string;
  minutes: string;
  hours: string;
  days: string;
  now: string;
}
type WalineLevelLocale = Record<`level${number}`, string>;
interface WalineReactionLocale {
  reactionTitle: string;
  reaction0: string;
  reaction1: string;
  reaction2: string;
  reaction3: string;
  reaction4: string;
  reaction5: string;
  reaction6: string;
  reaction7: string;
  reaction8: string;
}
interface WalineLocale extends WalineDateLocale, WalineLevelLocale, WalineReactionLocale {
  nick: string;
  mail: string;
  link: string;
  optional: string;
  placeholder: string;
  sofa: string;
  submit: string;
  comment: string;
  refresh: string;
  more: string;
  uploading: string;
  login: string;
  admin: string;
  sticky: string;
  word: string;
  anonymous: string;
  gif: string;
  gifSearchPlaceholder: string;
  // manage
  approved: string;
  waiting: string;
  spam: string;
  unsticky: string;
  // sorting
  oldest: string;
  latest: string;
  hottest: string;
  // hint
  nickError: string;
  mailError: string;
  wordHint: string;
  // i18n
  like: string;
  cancelLike: string;
  reply: string;
  cancelReply: string;
  preview: string;
  emoji: string;
  uploadImage: string;
  profile: string;
  logout: string;
  commentUnderReview: string;
  subPostComment: string;
  subSiteComment: string;
  subscribeToReplies: string;
}
//#endregion
//#region src/typings/waline.d.ts
interface WalineProps {
  /**
   * Waline 的服务端地址
   *
   * Waline server address url
   */
  serverURL: string;
  /**
   * 当前 _文章页_ 路径，用于区分不同的 _文章页_ ，以保证正确读取该 _文章页_ 下的评论列表
   *
   * 你可以将其设置为 `window.location.pathname`
   *
   * Article path id. Used to distinguish different _article pages_ to ensure loading the correct
   * comment list under the _article page_.
   *
   * You can set it to `window.location.pathname`
   */
  path: string;
  /**
   * 评论者相关属性
   *
   * `Meta` 可选值: `'nick'`, `'mail'`, `'link'`
   *
   * Reviewer attributes.
   *
   * Optional values for `Meta`: `'nick'`, `'mail'`, `'link'`
   *
   * @default ['nick', 'mail', 'link']
   */
  meta?: WalineMeta[];
  /**
   * 设置**必填项**，默认昵称为匿名
   *
   * Set required fields, default anonymous with nickname
   *
   * @default [ ]
   */
  requiredMeta?: WalineMeta[];
  /**
   * 评论字数限制。填入单个数字时为最大字数限制
   *
   * 设置为 `0` 时无限制
   *
   * Comment word s limit. When a single number is filled in, it 's the maximum number of comment
   * words.
   *
   * No limit when set to `0`.
   *
   * @default 0
   */
  wordLimit?: number | [number, number];
  /**
   * 评论列表分页，每页条数
   *
   * Number of pages per page
   *
   * @default 10
   */
  pageSize?: number;
  /**
   * Waline 显示语言
   *
   * 可选值:
   *
   * - `'zh'`
   * - `'zh-cn'`
   * - `'zh-CN'`
   * - `'zh-tw'`
   * - `'zh-TW'`
   * - `'en'`
   * - `'en-US'`
   * - `'en-us'`
   * - `'jp'`
   * - `'jp-jp'`
   * - `'jp-JP'`
   * - `'pt-br'`
   * - `'pt-BR'`
   * - `'ru'`
   * - `'ru-ru'`
   * - `'ru-RU'`
   * - `'fr-FR'`
   * - `'fr'`
   *
   * Display language for waline
   *
   * Optional value:
   *
   * - `'zh'`
   * - `'zh-cn'`
   * - `'zh-CN'`
   * - `'zh-tw'`
   * - `'zh-TW'`
   * - `'en'`
   * - `'en-US'`
   * - `'en-us'`
   * - `'jp'`
   * - `'jp-jp'`
   * - `'jp-JP'`
   * - `'pt-br'`
   * - `'pt-BR'`
   * - `'ru'`
   * - `'ru-ru'`
   * - `'ru-RU'`
   * - `'fr-FR'`
   * - `'fr'`
   *
   * @default navigator.language
   */
  lang?: string;
  /**
   * 自定义 waline 语言显示
   *
   * @see [自定义语言](https://waline.js.org/client/i18n.html)
   *
   * Custom display language in waline
   * @see [I18n](https://waline.js.org/en/client/i18n.html)
   */
  locale?: Partial<WalineLocale>;
  /**
   * 评论列表排序方式
   *
   * Sorting method for comment list
   *
   * @default 'latest'
   */
  commentSorting?: WalineCommentSorting;
  /**
   * 是否启用暗黑模式适配
   *
   * 设置 `'auto'` 会根据设备暗黑模式自适应。填入 CSS 选择器会在对应选择器生效时启用夜间模式。
   *
   * Whether to enable darkmode support
   *
   * Setting `'auto'` will display darkmode due to device settings. Filling in CSS selector will
   * enable darkmode only when the selector match waline ancestor nodes.
   */
  dark?: string | boolean;
  /**
   * 登录模式状态，可选值:
   *
   * - `'enable'`: 启用登录 (默认)
   * - `'disable'`: 禁用登录，用户只能填写信息评论
   * - `'force'`: 强制登录，用户必须注册并登录才可发布评论
   *
   * Login mode status, optional values:
   *
   * - `'enable'`: enable login (default)
   * - `'disable'`: Login is disabled, users should fill in information to comment
   * - `'force'`: Forced login, users must login to comment
   *
   * @default 'enable'
   */
  login?: WalineLoginStatus;
  /**
   * 是否在页脚隐藏版权信息
   *
   * 为了支持 Waline，我们强烈建议你开启它
   *
   * Whether hide copyright in footer
   *
   * We strongly recommended you to keep it on to support waline
   */
  noCopyright?: boolean;
  /**
   * 是否隐藏 RSS 订阅入口
   *
   * Whether to hide RSS subscription links
   *
   * @default false
   */
  noRss?: boolean;
  /**
   * Recaptcha v3 客户端 key
   *
   * Recaptcha v3 client key
   */
  recaptchaV3Key?: string;
  /**
   * Turnstile 客户端 key
   *
   * Turnstile client key
   */
  turnstileKey?: string;
  /** Cap Standalone site endpoint, including site key */
  capApiEndpoint?: string;
  /** URL of the Cap widget script; supports self-hosting */
  capWidgetUrl?: string;
  /**
   * 文章反应
   *
   * Article reaction
   *
   * @default false
   */
  reaction?: string[] | boolean;
  /**
   * 设置表情包
   *
   * Set Emojis
   *
   * @default ['//unpkg.com/@waline/emojis@1.1.0/weibo']
   */
  emoji?: (WalineEmojiInfo | WalineEmojiPresets)[];
  /**
   * 设置搜索功能
   *
   * Customize Search feature
   */
  search?: WalineSearchOptions | boolean;
  /**
   * 代码块高亮器
   *
   * Code fence highlighter
   */
  highlighter?: WalineHighlighter;
  /**
   * 自定义图片上传方法，方便更好的存储图片
   *
   * 方法执行时会将图片对象传入。
   *
   * Custom image upload callback to manage picture by yourself.
   *
   * We will pass a picture file object when execute it.
   */
  imageUploader?: WalineImageUploader | 's3';
  /**
   * 自定义数学公式处理方法，用于预览。
   *
   * Custom math formula parse callback for preview.
   */
  texRenderer?: WalineTeXRenderer;
}
//#endregion
//#region src/typings/options.d.ts
interface WalineInitOptions extends Omit<WalineProps, 'path' | 'emoji' | 'search' | 'highlighter' | 'imageUploader' | 'texRenderer'> {
  /**
   * Waline 的初始化挂载器。必须是一个**有效的** CSS 选择器 或 HTML 元素
   *
   * The DOM element to be mounted on initialization. It must be a **valid** CSS selector string or
   * HTML Element.
   */
  el?: string | HTMLElement | null;
  /**
   * 评论数统计
   *
   * Comment number support
   *
   * @default true
   */
  comment?: string | boolean;
  /**
   * 页面访问量统计
   *
   * Pageview number support
   *
   * @default true
   */
  pageview?: string | boolean;
  /**
   * 当前 _文章页_ 路径，用于区分不同的 _文章页_ ，以保证正确读取该 _文章页_ 下的评论列表
   *
   * 你可以将其设置为 `window.location.pathname`
   *
   * Article path id. Used to distinguish different _article pages_ to ensure loading the correct
   * comment list under the _article page_.
   *
   * You can set it to `window.location.pathname`
   *
   * @default window.location.pathname
   */
  path?: string;
  /**
   * 设置表情包
   *
   * Set Emojis
   *
   * @default ['//unpkg.com/@waline/emojis@1.1.0/weibo']
   */
  emoji?: (WalineEmojiInfo | WalineEmojiPresets)[] | boolean;
  /**
   * 设置搜索功能
   *
   * Customize Search feature
   *
   * @default true
   */
  search?: WalineSearchOptions | boolean;
  /**
   * 代码高亮
   *
   * Code highlighting
   *
   * @default true
   */
  highlighter?: WalineHighlighter | boolean;
  /**
   * 自定义图片上传方法，方便更好的存储图片
   *
   * 方法执行时会将图片对象传入。
   *
   * Custom image upload callback to manage picture by yourself.
   *
   * We will pass a picture file object when execute it.
   *
   * @default true
   */
  imageUploader?: WalineImageUploader | boolean | 's3';
  /**
   * 自定义数学公式处理方法，用于预览。
   *
   * Custom math formula parse callback for preview.
   *
   * @default true
   */
  texRenderer?: WalineTeXRenderer | boolean;
}
// oxlint-disable-next-line typescript/no-explicit-any
type WalineAbort = (reason?: any) => void;
//#endregion
//#region src/config/i18n/index.d.ts
type Locales = Record<string, WalineLocale>;
declare const DEFAULT_LOCALES: Locales;
//#endregion
//#region src/comment.d.ts
export interface WalineCommentCountOptions {
  /**
   * Waline 服务端地址
   *
   * Waline server url
   */
  serverURL: string;
  /**
   * 评论数 CSS 选择器
   *
   * Comment count CSS selector
   *
   * @default '.waline-comment-count'
   */
  selector?: string;
  /**
   * 需要获取的默认路径
   *
   * Path to be fetched by default
   *
   * @default window.location.pathname
   */
  path?: string;
  /**
   * 错误提示消息所使用的语言
   *
   * Language of error message
   *
   * @default navigator.language
   */
  lang?: string;
}
export declare const commentCount: ({ serverURL, path, selector, lang }: WalineCommentCountOptions) => WalineAbort;
//#endregion
//#region src/init.d.ts
export interface WalineInstance {
  /**
   * Waline 被挂载到的元素
   *
   * 当通过 `el: null` 初始化，值为 `null` Element where Waline is mounted
   *
   * When initialized with `el: null`, it will be `null`
   */
  el: HTMLElement | null;
  /**
   * 更新 Waline 实例
   *
   * 只要不设置`path` 选项，更新时它就会被重置为 `windows.location.pathname` Update Waline instance
   *
   * When not setting `path` option, it will be reset to `window.location.pathname`
   */
  update: (newOptions?: Partial<Omit<WalineInitOptions, 'el'>>) => void;
  /**
   * 取消挂载并摧毁 Waline 实例
   *
   * Unmount and destroy Waline instance
   */
  destroy: () => void;
}
export declare const init: ({ el, path, comment, pageview, ...initProps }: WalineInitOptions) => WalineInstance | null;
//#endregion
//#region src/pageview.d.ts
export interface WalinePageviewCountOptions {
  /**
   * Waline 服务端地址
   *
   * Waline server url
   */
  serverURL: string;
  /**
   * 浏览量 CSS 选择器
   *
   * Pageview CSS selector
   *
   * @default '.waline-pageview-count'
   */
  selector?: string;
  /**
   * 需要更新和获取的路径
   *
   * Path to be fetched and updated
   *
   * @default window.location.pathname
   */
  path?: string;
  /**
   * 是否在查询时更新 path 的浏览量
   *
   * Whether update pageviews when fetching path result
   *
   * @default true
   */
  update?: boolean;
  /**
   * 错误提示消息所使用的语言
   *
   * Language of error message
   *
   * @default navigator.language
   */
  lang?: string;
}
export declare const pageviewCount: ({ serverURL, path, selector, update, lang }: WalinePageviewCountOptions) => WalineAbort;
//#endregion
//#region src/version.d.ts
export declare const version: string;
//#endregion
//#region src/widgets/recentComments.d.ts
export interface WalineRecentCommentsOptions {
  /**
   * Waline 服务端地址
   *
   * Waline serverURL
   */
  serverURL: string;
  /**
   * 获取最新评论的数量
   *
   * Fetch number of latest comments
   */
  count: number;
  /**
   * 需要挂载的元素
   *
   * Element to be mounted
   */
  el?: string | HTMLElement;
  /**
   * 错误提示消息所使用的语言
   *
   * Language of error message
   *
   * @default navigator.language
   */
  lang?: string;
}
export interface WalineRecentCommentsResult {
  /**
   * 评论数据
   *
   * Comment Data
   */
  comments: RecentCommentData[];
  /**
   * 取消挂载挂件
   *
   * Umount widget
   */
  destroy: () => void;
}
export declare const RecentComments: ({ el, serverURL, count, lang }: WalineRecentCommentsOptions) => Promise<WalineRecentCommentsResult>;
//#endregion
//#region src/widgets/userList.d.ts
export interface WalineUserListOptions {
  /**
   * Waline 服务端地址
   *
   * Waline serverURL
   */
  serverURL: string;
  /**
   * 获取用户列表的数量
   *
   * Fetch number of user list
   */
  count: number;
  /**
   * 需要挂载的元素
   *
   * Element to be mounted
   */
  el?: string | HTMLElement;
  /**
   * 错误提示消息所使用的语言
   *
   * Language of error message
   *
   * @default navigator.language
   */
  lang?: string;
  /**
   * 自定义 waline 语言显示
   *
   * @see [自定义语言](https://waline.js.org/client/i18n.html)
   *
   * Custom display language in waline
   * @see [I18n](https://waline.js.org/en/client/i18n.html)
   */
  locale?: WalineLocale;
  /**
   * 列表模式还是头像墙模式
   *
   * List mode or avatar wall mode
   *
   * @default 'list'
   */
  mode?: 'list' | 'wall';
}
export interface WalineUserListResult {
  /**
   * 用户数据
   *
   * User Data
   */
  users: WalineUser[];
  /**
   * 取消挂载挂件
   *
   * Umount widget
   */
  destroy: () => void;
}
export declare const UserList: ({ el, serverURL, count, locale, lang, mode }: WalineUserListOptions) => Promise<WalineUserListResult>;
//#endregion
//#region src/widgets/star/index.d.ts
/** Options for the star rating widget. */
export interface WalineStarOptions {
  /** Element or CSS selector on which to mount the widget. */
  el?: string | HTMLElement;
  /** Path identifying the current page or article. */
  path: string;
  /** Language code used by the widget, such as `en` or `zh-CN`. */
  lang?: string;
  /** Waline server URL. */
  serverURL: string;
  /**
   * Callback invoked after the user submits a rating.
   *
   * @param score The score selected by the user.
   */
  onRate?: (score: number) => void;
}
/** Star widget result. */
export interface WalineStarResult {
  /** Destroy star widget instance. */
  destroy: () => void;
}
export declare const Star: ({ el, path, lang, serverURL, onRate }: WalineStarOptions) => WalineStarResult;
//#endregion
export { type BaseWalineResponseComment, type WalineAbort, type WalineChildComment, type WalineComment, type WalineCommentData, type WalineCommentSorting, type WalineCommentStatus, type WalineDateLocale, type WalineEmojiInfo, type WalineEmojiMaps, type WalineEmojiPresets, type WalineHighlighter, type WalineImageUploader, type WalineInitOptions, type WalineLevelLocale, type WalineLocale, type WalineLoginStatus, type WalineMeta, type WalineProps, type WalineReactionLocale, type WalineRootComment, type WalineSearchImageData, type WalineSearchOptions, type WalineSearchResult, type WalineTeXRenderer, type WalineUserType, DEFAULT_LOCALES as defaultLocales };
//# sourceMappingURL=waline.d.ts.map