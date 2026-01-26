/**
 * 主题切换 UI
 * 在 Butterfly 主题中添加主题切换按钮
 * 通过 URL 参数或 localStorage 实现主题切换
 */

(function() {
  'use strict';

  const THEME_STORAGE_KEY = 'preferred_theme';
  const THEMES = {
    butterfly: {
      name: 'Butterfly',
      icon: '🦋',
      description: '当前主题'
    },
    fluid: {
      name: 'Fluid',
      icon: '💧',
      description: '简洁流畅'
    }
  };

  /**
   * 获取当前主题
   */
  function getCurrentTheme() {
    // 首先根据路径判断当前实际使用的主题
    const currentPath = window.location.pathname;
    const isFluidPath = currentPath.startsWith('/fluid') || currentPath.startsWith('/fluid-blog');
    
    // 如果路径是 Fluid 路径，当前主题是 fluid
    if (isFluidPath) {
      return 'fluid';
    }
    
    // 否则当前主题是 butterfly（根路径）
    return 'butterfly';
  }

  /**
   * 切换到指定主题
   */
  function switchToTheme(themeName) {
    if (!THEMES[themeName]) {
      console.error('未知主题:', themeName);
      return;
    }

    // 保存到 localStorage
    localStorage.setItem(THEME_STORAGE_KEY, themeName);

    // 获取当前路径（保留路径和查询参数）
    const currentPath = window.location.pathname + window.location.search;
    
    // 检测是否在本地预览环境
    const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' ||
                        window.location.hostname === '0.0.0.0';

    // 方案1: 如果配置了不同部署地址，直接跳转
    // 配置说明：
    // - 如果使用不同仓库：fluid 填写新仓库的 GitHub Pages 地址
    // - 如果使用不同分支：fluid 可以填写相同域名（但需要配置不同的路径）
    // - 如果使用子域名：fluid 填写子域名地址，如 'https://fluid.linn0813.github.io'
    // GitHub Pages 说明：
    // - Butterfly：用户页面，访问地址是 https://linn0813.github.io（根域名）
    // - Fluid：项目页面，访问地址是 https://linn0813.github.io/fluid-blog（子路径）
    //   注意：项目仓库可以是任意名称，不需要 username.github.io 格式
    
    // 本地预览环境：使用 /fluid 路径
    // 生产环境：使用 /fluid-blog 路径
    const fluidPath = isLocalhost ? '/fluid' : '/fluid-blog';
    
    const themeUrls = {
      butterfly: window.location.origin, // Butterfly：根路径
      fluid: window.location.origin + fluidPath // Fluid：子路径
    };

    // 检查当前路径
    const currentIsFluid = window.location.pathname.startsWith('/fluid') || 
                           window.location.pathname.startsWith('/fluid-blog');
    const targetIsFluid = themeName === 'fluid';
    
    // 如果当前在 Fluid 路径下，点击 Butterfly 需要移除 Fluid 路径前缀
    if (currentIsFluid && themeName === 'butterfly') {
      const pathWithoutFluid = currentPath.replace(/^\/fluid(-blog)?/, '') || '/';
      window.location.href = themeUrls.butterfly + pathWithoutFluid;
      return;
    }
    
    // 如果当前不在 Fluid 路径下，点击 Fluid 需要添加 Fluid 路径前缀
    if (!currentIsFluid && themeName === 'fluid') {
      window.location.href = themeUrls.fluid + currentPath;
      return;
    }
    
    // 如果已经在目标主题的路径下，不需要跳转
    if (currentIsFluid === targetIsFluid) {
      console.log('已经在目标主题路径下');
      return;
    }
  }

  /**
   * 显示主题切换提示
   */
  function showThemeSwitchNotice(themeName) {
    const notice = document.createElement('div');
    notice.id = 'theme-switch-notice';
    notice.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      z-index: 10000;
      max-width: 400px;
      text-align: center;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;

    notice.innerHTML = `
      <h3 style="margin-top: 0;">🎨 切换主题</h3>
      <p>要切换到 <strong>${THEMES[themeName].name}</strong> 主题，需要重新生成静态文件。</p>
      <p style="color: #666; font-size: 14px;">
        请在本地运行：<br>
        <code id="copy-command" style="background: #f5f5f5; padding: 5px 10px; border-radius: 4px; display: inline-block; margin: 10px 0; cursor: pointer;" title="点击复制">
          npm run switch:${themeName}
        </code><br>
        <small style="color: #999;">或手动运行：</small><br>
        <code style="background: #f5f5f5; padding: 5px 10px; border-radius: 4px; display: inline-block; font-size: 12px;">
          node tools/theme-switcher.js ${themeName} && hexo clean && hexo generate
        </code>
      </p>
      <p style="color: #999; font-size: 12px; margin-top: 15px;">
        💡 提示：如果配置了独立部署地址，点击切换会自动跳转
      </p>
      <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: center;">
        <button id="copy-btn" style="
          padding: 8px 20px;
          background: #49b1f5;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        ">📋 复制命令</button>
        <button id="close-notice" style="
          padding: 8px 20px;
          background: #e0e0e0;
          color: #333;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        ">知道了</button>
      </div>
    `;

    document.body.appendChild(notice);

    // 添加遮罩
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 9999;
    `;
    document.body.appendChild(overlay);

    // 复制命令功能
    const copyCommand = `npm run switch:${themeName}`;
    document.getElementById('copy-btn').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(copyCommand);
        const btn = document.getElementById('copy-btn');
        const originalText = btn.textContent;
        btn.textContent = '✅ 已复制';
        btn.style.background = '#52c41a';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '#49b1f5';
        }, 2000);
      } catch (err) {
        // 降级方案：选中文本
        const code = document.getElementById('copy-command');
        const range = document.createRange();
        range.selectNode(code);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        alert('已选中命令，请手动复制（Ctrl+C / Cmd+C）');
      }
    });

    // 代码块点击复制
    document.getElementById('copy-command').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(copyCommand);
        const code = document.getElementById('copy-command');
        const originalBg = code.style.background;
        code.style.background = '#d4edda';
        code.textContent = '✅ 已复制！';
        setTimeout(() => {
          code.style.background = originalBg;
          code.textContent = copyCommand;
        }, 1500);
      } catch (err) {
        // 降级方案
        const range = document.createRange();
        range.selectNode(document.getElementById('copy-command'));
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
      }
    });

    // 关闭按钮事件
    document.getElementById('close-notice').addEventListener('click', () => {
      notice.remove();
      overlay.remove();
    });

    // 点击遮罩关闭
    overlay.addEventListener('click', () => {
      notice.remove();
      overlay.remove();
    });
  }

  /**
   * 创建主题切换按钮
   */
  function createThemeSwitcher() {
    // 检查是否已存在
    if (document.getElementById('theme-switcher-btn')) {
      return;
    }

    // 创建按钮容器
    const container = document.createElement('div');
    container.id = 'theme-switcher-container';
    container.style.cssText = `
      position: fixed;
      bottom: 80px;
      right: 20px;
      z-index: 999;
    `;

    const button = document.createElement('button');
    button.id = 'theme-switcher-btn';
    button.innerHTML = '🎨 切换主题';
    button.style.cssText = `
      padding: 10px 15px;
      background: rgba(73, 177, 245, 0.9);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      transition: all 0.3s;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;

    // 悬停效果
    button.addEventListener('mouseenter', () => {
      button.style.background = 'rgba(73, 177, 245, 1)';
      button.style.transform = 'translateY(-2px)';
      button.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.background = 'rgba(73, 177, 245, 0.9)';
      button.style.transform = 'translateY(0)';
      button.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
    });

    // 创建下拉菜单
    let menuVisible = false;
    const menu = document.createElement('div');
    menu.id = 'theme-switcher-menu';
    menu.style.cssText = `
      position: absolute;
      bottom: 50px;
      right: 0;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      padding: 10px 0;
      min-width: 180px;
      display: none;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;

    Object.keys(THEMES).forEach(themeName => {
      const item = document.createElement('div');
      item.className = 'theme-switcher-item';
      const isCurrent = getCurrentTheme() === themeName;
      
      item.innerHTML = `
        <div style="
          padding: 10px 15px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          ${isCurrent ? 'background: #f0f9ff;' : ''}
          transition: background 0.2s;
        ">
          <div>
            <span style="font-size: 18px; margin-right: 8px;">${THEMES[themeName].icon}</span>
            <span style="font-weight: ${isCurrent ? '600' : '400'};">${THEMES[themeName].name}</span>
          </div>
          ${isCurrent ? '<span style="color: #49b1f5;">✓</span>' : ''}
        </div>
      `;

      item.addEventListener('mouseenter', () => {
        if (!isCurrent) {
          item.querySelector('div').style.background = '#f5f5f5';
        }
      });

      item.addEventListener('mouseleave', () => {
        if (!isCurrent) {
          item.querySelector('div').style.background = '';
        }
      });

      item.addEventListener('click', () => {
        if (!isCurrent) {
          switchToTheme(themeName);
        }
        menuVisible = false;
        menu.style.display = 'none';
      });

      menu.appendChild(item);
    });

    // 按钮点击事件
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      menuVisible = !menuVisible;
      menu.style.display = menuVisible ? 'block' : 'none';
    });

    // 点击外部关闭菜单
    document.addEventListener('click', (e) => {
      if (!container.contains(e.target)) {
        menuVisible = false;
        menu.style.display = 'none';
      }
    });

    container.appendChild(button);
    container.appendChild(menu);
    document.body.appendChild(container);
  }

  // 初始化 - 延迟执行确保 Fluid 主题完全加载
  function initThemeSwitcher() {
    // 检测是否在 Fluid 主题的子路径下
    const isFluidSubpath = window.location.pathname.startsWith('/fluid-blog');
    
    // 等待页面完全加载
    const initDelay = isFluidSubpath ? 1500 : 500; // Fluid 主题需要更长的加载时间
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(createThemeSwitcher, initDelay);
      });
    } else {
      setTimeout(createThemeSwitcher, initDelay);
    }
  }
  
  // 如果 Fluid 主题已加载，等待 boot.js 执行完成
  if (typeof Fluid !== 'undefined' && Fluid.ctx) {
    // Fluid 主题已加载，延迟初始化
    setTimeout(createThemeSwitcher, 1500);
  } else {
    initThemeSwitcher();
  }

  // 导出到全局
  window.ThemeSwitcher = {
    switchTo: switchToTheme,
    getCurrent: getCurrentTheme,
    getThemes: () => Object.keys(THEMES)
  };

})();
