---
title: Claude Code 设置与配置
tags: [claude-code, settings, configuration, claude-md]
created: 2026-05-12T00:00:00.000Z
updated: 2026-05-12T00:00:00.000Z
---

# Claude Code 设置与配置

Claude Code 提供多层次配置系统，从全局到项目级。

## 配置文件

### settings.json

位于 `.claude/settings.json`（项目级）或 `~/.claude/settings.json`（全局）。

主要配置项：

```json
{
  "permissions": {
    "allow": ["Read", "Edit", "Glob", "Grep"],
    "deny": ["Bash(rm -rf *)"],
    "ask": ["Bash(git push *)"]
  },
  "hooks": {
    "PostToolUse": [...]
  },
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["server.js"]
    }
  },
  "model": "claude-opus-4-7",
  "enableAllProjectMcpServers": false,
  "statusLine": {
    "type": "default"
  }
}
```

### CLAUDE.md

项目级指令文件，签入 git 供团队共享：

- 代码规范和架构约定
- 项目结构说明
- 技术栈和依赖
- 构建/测试/部署命令
- 特殊注意事项和限制

**位置**：项目根目录（或 `AGENTS.md` 作为别名）

### .env 文件

Claude Code 会读取项目 `.env` 文件中的环境变量。

## 权限系统

### 权限类型

- `allow`：自动允许，不询问
- `deny`：自动拒绝
- `ask`：每次询问用户确认

### 权限粒度

可按工具、命令模式、参数值进行精细控制：

```json
{
  "permissions": {
    "allow": [
      "Read",
      "Edit(src/**)"
    ],
    "ask": [
      "Bash(git push)"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Write(.env)"
    ]
  }
}
```

## 模型选择

可指定使用的模型：

- `claude-opus-4-7`：最强模型，适合复杂任务
- `claude-sonnet-4-6`：均衡模型，适合日常开发
- `claude-haiku-4-5`：轻量模型，适合简单任务

## 工作树（Worktree）配置

```json
{
  "worktree": {
    "baseRef": "fresh"
  }
}
```

- `fresh`：从远程默认分支创建
- `head`：从当前本地 HEAD 创建

## 状态栏配置

```json
{
  "statusLine": {
    "type": "default"
  }
}
```

## 环境变量

关键环境变量：

- `CLAUDE_CODE_API_KEY`：API 密钥
- `CLAUDE_PROJECT_DIR`：项目目录
- `DISABLE_AUTONOMOUS_MODE`：禁用自主模式
