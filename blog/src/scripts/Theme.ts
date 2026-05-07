/**
 * 主题切换功能
 * 支持深色/浅色模式切换，自动保存用户偏好
 */

const THEME_KEY = 'blog-theme';
const DARK_THEME = 'dark';
const LIGHT_THEME = 'light';

// 获取当前主题
export const getCurrentTheme = (): string => {
  if (typeof window === 'undefined') return LIGHT_THEME;
  
  // 1. 优先从 localStorage 读取
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme) return savedTheme;
  
  // 2. 检测系统偏好
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return DARK_THEME;
  }
  
  return LIGHT_THEME;
};

// 应用主题
export const applyTheme = (theme: string): void => {
  if (typeof window === 'undefined') return;
  
  const root = document.documentElement;
  
  if (theme === DARK_THEME) {
    root.classList.add('dark-theme');
    root.classList.remove('light-theme');
  } else {
    root.classList.add('light-theme');
    root.classList.remove('dark-theme');
  }
  
  // 保存用户偏好
  localStorage.setItem(THEME_KEY, theme);
  
  // 更新按钮图标
  updateThemeIcon(theme);
};

// 切换主题
export const toggleTheme = (): void => {
  const currentTheme = getCurrentTheme();
  const newTheme = currentTheme === DARK_THEME ? LIGHT_THEME : DARK_THEME;
  applyTheme(newTheme);
};

// 更新主题图标
const updateThemeIcon = (theme: string): void => {
  const themeBtn = document.querySelector('.theme-toggle-btn');
  if (!themeBtn) return;
  
  const sunIcon = themeBtn.querySelector('.sun-icon');
  const moonIcon = themeBtn.querySelector('.moon-icon');
  
  if (theme === DARK_THEME) {
    sunIcon?.classList.remove('hidden');
    moonIcon?.classList.add('hidden');
  } else {
    sunIcon?.classList.add('hidden');
    moonIcon?.classList.remove('hidden');
  }
};

// 初始化主题
const initTheme = (): void => {
  // 应用初始主题
  const theme = getCurrentTheme();
  applyTheme(theme);
  
  // 监听系统主题变化
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      // 只有在用户没有手动设置主题时才跟随系统
      if (!localStorage.getItem(THEME_KEY)) {
        applyTheme(e.matches ? DARK_THEME : LIGHT_THEME);
      }
    });
  }
  
  // 绑定切换按钮事件
  const themeBtn = document.querySelector('.theme-toggle-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', toggleTheme);
  }
};

export default initTheme;
