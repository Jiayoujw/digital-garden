---
title: Claude Code Web 能力
tags:
  - claude-code
  - web
  - search
  - fetch
created: 2026-05-12T00:00:00.000Z
updated: '2026-05-13T01:09:02.939Z'
---

# Claude Code Web 能力

Claude Code 通过 WebSearch 和 WebFetch 工具获取实时网络信息。

## WebSearch — 网络搜索

使用搜索引擎获取最新信息：

```bash
WebSearch query="Next.js 16 App Router documentation 2026"
```

### 特性

- 自动使用当前日期确定搜索时效
- 支持域名过滤（允许/阻止特定域名）
- 返回格式化搜索结果及可点击链接
- **必须**在回复末尾列出来源链接

### 适用场景

- 查询最新版本文档
- 搜索技术解决方案
- 获取当前事件信息
- 了解新发布的框架特性

### 域名过滤

```bash
# 只在特定域名搜索
WebSearch query="..." allowed_domains=["github.com", "npmjs.com"]

# 屏蔽特定域名
WebSearch query="..." blocked_domains=["example.com"]
```

## WebFetch — 网页内容获取

抓取并分析网页内容：

```bash
WebFetch url="https://example.com/docs" prompt="提取 API 参考部分的配置参数"
```

### 特性

- 自动将 HTML 转换为 Markdown
- 使用 AI 模型处理内容并提取所需信息
- 15 分钟缓存，重复请求更快
- HTTP URL 自动升级为 HTTPS

### 限制

- **无法访问需要认证的页面**（Google Docs、Confluence、Jira 等）
- 对于 GitHub 私有仓库，应使用 `gh` CLI 代替
- 内容过大时会被摘要

## 与 MCP 的比较

- WebSearch/WebFetch 适合公共网页内容
- MCP 工具适合需要认证的外部服务
- MCP 可提供更专业的 API 访问

详见 [[claude-code-mcp]]
