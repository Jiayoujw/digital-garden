---
title: Claude Code MCP 服务器与扩展
tags:
  - claude-code
  - mcp
  - extensions
  - tools
created: 2026-05-12T00:00:00.000Z
updated: '2026-05-13T01:36:58.506Z'
---

# Claude Code MCP 服务器与扩展

MCP（Model Context Protocol）允许 Claude Code 连接外部工具和数据源。

## 什么是 MCP

MCP 是一个开放协议，定义了 AI 模型与外部工具/数据源之间的标准通信方式。通过 MCP 服务器，Claude Code 可以：

- 访问专业 API（如数据库、第三方服务）
- 连接内部工具（如 Jira、Confluence）
- 集成自定义数据源

## 内置 MCP 工具

### Context7
查询最新编程文档和代码示例：

- 先调用 `resolve-library-id` 获取库 ID
- 再调用 `query-docs` 获取具体文档
- 支持数千个开源库的实时文档

**使用示例**：
```bash
# 1. 解析库 ID
mcp__context7__resolve-library-id query="React hooks" libraryName="React"

# 2. 查询文档
mcp__context7__query-docs libraryId="/reactjs/react" query="useEffect cleanup"
```

### Sequential Thinking
用于复杂问题的逐步分析推理：

- 动态调整思路数量
- 支持思路的修正和分支
- 适合架构设计、复杂 bug 排查

## 配置自定义 MCP 服务器

在 `~/.claude/settings.json` 中配置：

```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["path/to/server.js"],
      "env": {}
    }
  }
}
```

## MCP 工具调用

MCP 工具命名格式：`mcp__<server-name>__<tool-name>`

例如：
- `mcp__context7__query-docs`
- `mcp__sequential-thinking__sequentialthinking`

## 安全注意事项

- MCP 服务器可执行任意代码，只安装可信来源的服务器
- MCP 工具调用遵循与内置工具相同的权限模型
- 用户可在权限设置中控制 MCP 工具的审批策略
