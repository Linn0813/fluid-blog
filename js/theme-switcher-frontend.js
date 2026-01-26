/**
 * 前端主题切换器
 * 通过动态加载不同主题的 CSS 和 JS 实现前端切换
 * 
 * 注意：此方案需要两个主题的资源都存在于 public 目录中
 */

(function() {
  'use strict';

  const THEME_STORAGE_KEY = 'blog_theme';
  const THEMES = {
    butterfly: {
      name: 'Butterfly',
      css: '/css/butterfly-theme.css', // 需要提取 butterfly 的 CSS
      active: true
    },
    fluid: {
      name: 'Fluid',
      css: '/css/fluid-theme.css', // 需要提取 fluid 的 CSS
      active: false
    }
  };

  /**
   * 获取当前主题
   */
  function getCurrentTheme() {
    return localStorage.getItem(THEME_STORAGE_KEY) || 'butterfly';
  }

  /**
   * 设置主题
   */
  function setTheme(themeName) {
    if (!THEMES[themeName]) {
      console.error('未知主题:', themeName);
      return;
    }

    localStorage.setItem(THEME_STORAGE_KEY, themeName);
    applyTheme(themeName);
  }

  /**
   * 应用主题
   */
  function applyTheme(themeName) {
    // 移除所有主题样式
    document.querySelectorAll('link[data-theme]').forEach(link => {
      link.remove();
    });

    // 添加新主题样式
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = THEMES[themeName].css;
    link.setAttribute('data-theme', themeName);
    document.head.appendChild(link);

    // 更新 body 的 data-theme 属性
    document.body.setAttribute('data-theme', themeName);

    // 触发主题切换事件
    window.dispatchEvent(new CustomEvent('themeChanged', { 
      detail: { theme: themeName } 
    }));
  }

  /**
   * 创建主题切换按钮
   */
  function createThemeSwitcher() {
    // 检查是否已存在切换器
    if (document.getElementById('theme-switcher')) {
      return;
    }

    const switcher = document.createElement('div');
    switcher.id = 'theme-switcher';
    switcher.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 8px;
      padding: 10px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;

    const label = document.createElement('label');
    label.textContent = '主题: ';
    label.style.marginRight = '8px';

    const select = document.createElement('select');
    select.style.cssText = `
      padding: 5px 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
    `;

    Object.keys(THEMES).forEach(themeName => {
      const option = document.createElement('option');
      option.value = themeName;
      option.textContent = THEMES[themeName].name;
      if (getCurrentTheme() === themeName) {
        option.selected = true;
      }
      select.appendChild(option);
    });

    select.addEventListener('change', (e) => {
      setTheme(e.target.value);
    });

    switcher.appendChild(label);
    switcher.appendChild(select);
    document.body.appendChild(switcher);
  }

  // 初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      applyTheme(getCurrentTheme());
      createThemeSwitcher();
    });
  } else {
    applyTheme(getCurrentTheme());
    createThemeSwitcher();
  }

  // 导出到全局
  window.ThemeSwitcher = {
    setTheme,
    getCurrentTheme,
    getThemes: () => Object.keys(THEMES)
  };

})();
