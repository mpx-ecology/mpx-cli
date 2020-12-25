# mpx-cli-service

mpx-cli service 服务。

内部依赖 `@vue/cli-service`，针对 `mpx` 跨平台编译构建做一些约定性处理。

通过读取不同插件内部暴露的 `platform` 变量来决定是否加载对应的插件。
