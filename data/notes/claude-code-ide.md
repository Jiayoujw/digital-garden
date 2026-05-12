---
title: Claude Code IDE 集成
tags: [claude-code, ide, vscode, jetbrains]
created: 2026-05-12T00:00:00.000Z
updated: 2026-05-12T00:00:00.000Z
---

# Claude Code IDE 集成

Claude Code 原生集成 VS Code 和 JetBrains IDE。

## VS Code 集成

### 安装

在 VS Code 扩展市场搜索 "Claude Code" 安装。

### 功能

- **内联编辑**：直接在编辑器中修改代码，显示 diff 预览
- **右键菜单**：选中代码右键调用 Claude Code
- **侧边栏聊天**：在侧边栏与 Claude Code 对话
- **终端集成**：在 VS Code 终端中使用 `claude` 命令
- **文件链接**：Claude Code 输出中的文件路径可点击跳转

### 代码引用

在 VS Code 中，Claude Code 使用标准 markdown 链接引用文件：

```
[filename.ts](src/filename.ts)
[filename.ts:42](src/filename.ts#L42)
[filename.ts:42-51](src/filename.ts#L42-L51)
```

### 选中上下文

用户在编辑器中选中的代码会作为上下文传递给 Claude Code。

## JetBrains 集成

### 安装

在 JetBrains 插件市场搜索 "Claude Code" 安装。

### 功能

- 与 VS Code 类似的内联编辑体验
- 项目结构自动感知
- 支持 IntelliJ IDEA、WebStorm、PyCharm 等

## IDE 环境特性

在 IDE 环境中，Claude Code 具有：

- **项目结构感知**：自动读取项目文件树
- **git 状态整合**：自动获取当前分支和变更状态
- **workspace 感知**：了解工作区根目录和文件结构
- **原生通知**：通过 IDE 通知系统推送消息

## 快捷键

- 打开 Claude Code 面板：取决于 IDE 配置
- 内联编辑接受/拒绝：与 IDE 的 diff 视图快捷键一致

## 与 CLI 的比较

| 功能 | CLI | IDE 扩展 |
|------|-----|---------|
| 文件编辑 | Read/Write/Edit 工具 | 内联 diff + 工具 |
| 终端命令 | Bash 工具 | 终端 + 工具 |
| 视觉反馈 | 文本输出 | diff 预览、高亮 |
| 项目感知 | 通过工具探索 | 自动感知 |
| 网络隔离 | 需要审批 | 继承 IDE 设置 |
