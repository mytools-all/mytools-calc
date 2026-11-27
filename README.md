# 计算稿纸

首次运行测试先执行 npm install --ignore-scripts，安装固定的开发测试依赖；这些依赖不进入运行包。

版本 0.1.1：导出通过 fs.exporttext 打开宿主保存对话框，清空使用网页内确认，不调用浏览器 confirm 或 Tauri dialog IPC。被拒绝或取消时显示结果，不产生未处理的 Promise 错误。早期同样标记 0.1.0 的安装内容可能比仓库源码旧，建议更新至 0.1.1。

本地执行 npm test、npm pack，在宿主“插件中心 → 开发者 → 安装插件包（.zip / .tgz）”安装，并关闭重开插件。必须更新清单以声明 fs.exporttext；宿主仍需对实际导出请求询问授权。若旧宿主的权限询问本身报 plugin:dialog|confirm ACL 错误，需重建升级宿主，不能靠给插件开放 Tauri 内部接口解决。

计算稿纸：表达式求值 + 稿纸记录，一键复制结果。

源码版本：0.1.1；适用于 MyTools，不能作为独立网页调用宿主能力。

## 安装

在 MyTools 插件管理的 npm 安装入口输入 `@mytools-all/mytools-calc@0.1.1`。也可以下载本仓库，在开发者页面选择“安装本地目录”。

## 开发

直接编辑本目录的 HTML、JavaScript 和样式，无需依赖宿主源码或其他插件仓库。修改后重新安装本地目录。运行 `npm test` 检查包内契约和逻辑。插件 API 规范见 [mytools](https://github.com/mytools-all/mytools/tree/main/docs)。

## 权限

声明的宿主能力：fs.exporttext、clipboard.write、storage.get、storage.set。目录和危险操作仍需用户授权。

## 许可

项目代码使用 MIT；随附的第三方代码遵循各自随附的许可证。

## MyTools 兼容范围

版本 0.1.2 声明支持 MyTools >=0.2.0 <0.3.0（0.2.x 稳定版），插件 API 为 v1。主程序超出范围时应更新插件或使用受支持的主程序版本。旧版主程序可能不识别此声明，请先升级到提供兼容检查的 MyTools。
