---
title: Claude Code 安装与配置
tags: [claude-code, setup, installation]
created: 2026-05-12T00:00:00.000Z
updated: 2026-05-12T00:00:00.000Z
---

# Claude Code 安装与配置

## 系统要求

- **操作系统**: macOS、Linux、Windows 11
- **Node.js**: 18.x 或更高版本
- **Git**: 2.x 或更高版本（可选，用于版本控制功能）

## 安装方式

### npm 全局安装

```bash
npm install -g @anthropic-ai/claude-code
```

### 一键安装脚本

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

### 通过 IDE 扩展

- **VS Code**: 在扩展市场搜索 "Claude Code" 安装
- **JetBrains**: 在插件市场搜索 "Claude Code" 安装

在 IDE 中使用时，Claude Code 会自动读取项目结构并提供内联编辑建议。详见 [[claude-code-ide]]

## 认证

首次使用时需要认证：

```bash
claude login
```

这会打开浏览器完成 OAuth 流程，关联你的 Anthropic 账号。

## 验证安装

```bash
claude --version
```

## 启动交互会话

在项目目录中启动：

```bash
claude
```

或直接提问：

```bash
claude "解释这个项目的结构"
```

## 配置

Claude Code 的行为可通过以下文件定制：

- **CLAUDE.md**：项目级指令文件（签入 git），定义代码规范、架构约定
- **settings.json**：全局或项目级设置文件（`.claude/settings.json`）
- **.claude/` 目录**：存放 hooks、plans、memory 等持久化数据

详见 [[claude-code-settings]]
