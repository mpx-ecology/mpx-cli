# 项目开发与测试

## 基本约定

- 以 `package.json`、`mpx.config.js` 和源码中的应用配置为准；调整脚本或平台配置后同步更新本文。
- 修改前查看 `git status --short`，保留已有未提交改动。修改源码，不直接修改 `dist/` 中的编译产物。
- 源码方言为 `<%= srcMode %>`。除特别标注外，命令均在项目根目录执行；按项目使用的包管理器和锁文件安装依赖，不混用锁文件。
<%_ if (cloudFunc || isPlugin) { _%>
- 小程序源码位于 `src/miniprogram/`，从 `src/miniprogram/app.mpx` 的页面配置确定测试入口。
<%_ } else { _%>
- 页面和组件位于 `src/`，从 `src/app.mpx` 的页面配置确定测试入口。
<%_ } _%>
- 开发构建是持续监听进程；修改后等待本轮编译成功再测试。结束后只停止本次启动的进程。

## 构建命令

| 目标 | 开发构建 | 生产构建 | 产物目录 |
| --- | --- | --- | --- |
<%_ miniModes.forEach(mode => { _%>
| <%= platformNames[mode] || mode %>小程序 | `npm run serve -- --targets=<%= mode %>` | `npm run build -- --targets=<%= mode %>` | `dist/<%= mode %>` |
<%_ }) _%>

执行命令时显式指定目标，避免将默认微信构建误用于其他源码平台。生产构建完成后复测本次修改涉及的功能。
<%_ if (miniModes.includes('wx')) { _%>

## 微信小程序

1. 执行 `npm run serve -- --targets=wx`，等待编译成功。
2. 微信开发者工具导入 `dist/wx`，确认测试 AppID；项目配置来源为 `static/wx/project.config.json`。
<%_ if (cloudFunc || isPlugin) { _%>
3. 工具导入目录仍为 `dist/wx`，由项目配置中的 `miniprogramRoot` 指向内部小程序目录，不要只导入 `dist/wx/miniprogram`。
<%_ } _%>
- 从应用配置中的首页测试页面进入、返回、视图和交互，检查 Console/Network。需要真机结论时另外预览验证，并记录基础库、工具及微信版本。
<%_ if (cloudFunc) { _%>
- 云函数源码位于 `src/functions/`；测试前配置实际云环境，核对函数部署版本、调用参数、返回值和错误日志。
<%_ } _%>
<%_ if (isPlugin) { _%>
- 插件源码位于 `src/plugin/`；通过开发者工具的插件调试模式和宿主小程序验证导出组件、接口与调用行为。
<%_ } _%>
<%_ } _%>
<%_ if (miniModes.includes('ali')) { _%>

## 支付宝小程序

1. 执行 `npm run serve -- --targets=ali`，等待编译成功。
2. 支付宝开发者工具导入 `dist/ali`，确认项目设置已启用 `component2`，再编译运行。模板的 `static/ali/mini.project.json` 默认包含 `component2: true`。
3. 使用真实测试小程序进行关联和真机预览；检查路由、事件参数、样式、字体和图片。微信专属 API 不能作为支付宝端的通过标准。
<%_ } _%>
<%_ const otherMiniModes = miniModes.filter(mode => mode !== 'wx' && mode !== 'ali'); _%>
<%_ if (otherMiniModes.length) { _%>

## 其他小程序平台

适用目标：<%= otherMiniModes.map(mode => `${platformNames[mode] || mode}（${mode}）`).join('、') %>。

按上表执行对应目标的开发构建，再用该平台开发者工具导入 `dist/<目标>`。检查 `static/<目标>/` 中的平台配置和实际 AppID；缺少配置时按工具生成的真实配置补齐。分别验证页面、组件、路由、平台 API 和资源加载，不能用其他平台的结果替代。
<%_ } _%>

<%_ if (needWeb) { _%>

## Web

| 目标 | 开发构建 | 生产构建 | 产物目录 |
| --- | --- | --- | --- |
| Web | `npm run serve:web` | `npm run build:web` | `dist/web` |

1. 执行 `npm run serve:web`，访问终端打印的实际 URL。
2. 检查桌面及移动视口下的布局、滚动、输入、点击、路由返回和刷新，查看浏览器 Console/Network。
3. 执行 `npm run build:web`，通过本地 HTTP 服务访问 `dist/web` 验证生产产物；不要使用 `file://`。history 路由需配置入口回退后再测试深链接刷新。
<%_ } _%>

<%_ if (needRn) { _%>

## RN 构建命令

| 目标 | 开发构建 | 生产构建 | 产物目录 |
| --- | --- | --- | --- |
| RN iOS（仅 Mpx 编译） | `npm run serve -- --targets=ios` | `npm run build -- --targets=ios` | `dist/ios` |
| RN Android（仅 Mpx 编译） | `npm run serve -- --targets=android` | `npm run build -- --targets=android` | `dist/android` |

## RN iOS

原生宿主目录为 `<%= rnProjectName %>/`。准备 Xcode 和模拟器，Node、Ruby 等版本以宿主配置为准。

1. 根目录执行 `npm run serve -- --targets=ios`，等待 Mpx 编译成功。
2. 模拟器已安装可连接 Metro 的开发版 App，且原生依赖和配置未变时：另一终端执行 `cd <%= rnProjectName %> && npm start`，再打开 App 或 Reload；已有该项目 Metro 时直接复用。
3. 首次安装或原生依赖、字体、配置变更时，先安装宿主依赖，并在宿主目录执行以下命令，再运行 App：

   ```sh
   cd <%= rnProjectName %>
   bundle install
   cd ios
   bundle exec pod install
   cd ..
   npm run ios
   ```

   `npm run ios` 包含启动 Metro，无需另行执行 `npm start`。第 2、3 步按情况选择其一；选择模拟器时可在宿主执行 `npm run ios -- --simulator="实际设备名称"`。
4. 测试启动、路由返回、滚动、键盘、安全区、字体和本次修改的交互。修改 Mpx 源码后等待编译并 Reload；涉及原生变更时重新安装 Pods 并构建 App。

## RN Android

1. 按宿主 `<%= rnProjectName %>/android/` 配置准备 JDK、SDK 和模拟器或调试真机，执行 `adb devices` 确认设备可用。
2. 根目录执行 `npm run serve -- --targets=android`，等待编译成功。
3. 已安装开发版 App 且原生依赖和配置未变时：另一终端执行 `cd <%= rnProjectName %> && npm start`，再打开 App 或 Reload；已有该项目 Metro 时直接复用。
4. 首次安装或原生依赖、字体、配置变更时：安装宿主依赖后执行 `cd <%= rnProjectName %> && npm run android`，构建并安装 App。该命令包含启动 Metro，无需另行执行 `npm start`；与第 3 步按情况选择其一。
5. 检查系统返回键、键盘遮挡、安全区、字体及修改功能。设备无法连接 Metro 时检查端口；USB 调试可执行 `adb -s <设备序列号> reverse tcp:8081 tcp:8081`。

两端共用原生宿主目录和 Metro，编译产物分别同步到宿主的 `mpx-build/ios/`、`mpx-build/android/`，由 `mpx-entry.ios.js`、`mpx-entry.android.js` 选择对应产物。两端 Mpx watcher 可以同时运行，也可以只启动需要测试的一端；不要同时启动同一端的多个 watcher。根目录的 `serve:ios/android` 包含原生 App 构建；日常复用已安装 App 时使用上述仅 Mpx 编译命令。`build:ios/android` 还会执行宿主的 JS bundle 打包，生成 IPA/APK 需另行使用原生工程构建工具。
<%_ } _%>

## 校验与交付

- 至少覆盖本次修改涉及的页面/组件：首次进入、交互更新、路由返回、资源加载、边界输入和错误处理；跨端改动应在受影响的各端分别构建和运行。
- 编译通过不等于运行通过，模拟器通过不等于真机通过；无可用环境时记录未验证项目和具体阻塞原因。
- 交付时记录目标平台、执行命令、设备/工具版本、实际操作及结果、日志或截图位置。不要将历史测试结果写成本次结论。
