---
title: Claude Code - AI 编程助手总览
tags: [claude-code, ai, tools]
created: 2026-05-12T00:00:00.000Z
updated: 2026-05-12T00:00:00.000Z
---

# Claude Code — AI 编程助手总览

Claude Code 是 Anthropic 推出的命令行 AI 编程助手，基于 Claude 4 系列大模型，能在终端、IDE、网页等多种环境中协助开发者完成软件工程任务。

## 核心能力

- **代码编辑**：通过 Write/Edit 工具精确修改文件，支持单文件和批量替换。详见 [[claude-code-editing]]
- **终端操作**：通过 Bash 工具执行 shell 命令，支持后台任务、超时控制。详见 [[claude-code-terminal]]
- **代码分析**：使用 Glob/Grep 进行文件搜索和内容搜索，支持正则和 glob 模式。详见 [[claude-code-analysis]]
- **Git/版本控制**：自动生成 commit message、创建 PR、管理分支。详见 [[claude-code-git]]
- **AI Agent 系统**：可派生子 agent 处理复杂任务，支持并行执行。详见 [[claude-code-agents]]
- **持久记忆**：自动记忆用户偏好和项目上下文。详见 [[claude-code-memory]]
- **Web 能力**：WebSearch 搜索最新信息，WebFetch 获取网页内容。详见 [[claude-code-web]]
- **MCP 扩展**：通过 Model Context Protocol 连接外部工具和数据源。详见 [[claude-code-mcp]]
- **IDE 集成**：VS Code、JetBrains 原生扩展支持。详见 [[claude-code-ide]]
- **Plan Mode**：先规划再实施的设计模式，避免浪费。详见 [[claude-code-plan]]
- **Hooks 自动化**：在工具调用前后触发自定义脚本。详见 [[claude-code-hooks]]
- **丰富配置**：通过 settings.json 和 CLAUDE.md 定制行为。详见 [[claude-code-settings]]

## 安装方式

详见 [[claude-code-installation]]

## 最佳实践

详见 [[claude-code-tips]]

## 限制与注意事项

- 单次上下文窗口有限，超大任务可能被压缩
- CLI 模式下工具调用需用户审批（可通过权限系统配置）
- 无法访问需要认证的网页（需通过 MCP）
- 并非所有 slash command 在所有环境中可用
