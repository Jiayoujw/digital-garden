---
title: Claude Code 持久记忆系统
tags: [claude-code, memory, claude-md, personalization]
created: 2026-05-12T00:00:00.000Z
updated: 2026-05-12T00:00:00.000Z
---

# Claude Code 持久记忆系统

Claude Code 拥有持久化的文件记忆系统，能在不同会话间保持上下文。

## 记忆存储位置

记忆存储在 `~/.claude/projects/<project>/memory/` 目录下。

## 记忆类型

### User 记忆
关于用户的角色、目标、偏好、知识水平：

- 用户是资深后端工程师还是初学者
- 用户偏好的技术栈
- 用户的沟通风格偏好

### Feedback 记忆
用户给出的工作方式指导：

- "不要 mock 数据库"
- "提交前总是运行测试"
- "使用函数式编程风格"
- 包含 **Why** 和 **How to apply** 说明

### Project 记忆
项目相关的事实和决策：

- 合并冻结日期
- 功能背后的业务动机
- 团队分工和时间节点

### Reference 记忆
外部系统资源的指针：

- Bug 追踪系统（Linear 项目名）
- Grafana 监控面板
- Slack 频道
- 设计文档链接

## 记忆格式

每个记忆文件使用 markdown 格式，带有 YAML frontmatter：

```markdown
---
name: short-kebab-case-slug
description: 一行摘要，用于未来相关性判断
metadata:
  type: feedback
---

规则描述
**Why:** 原因说明
**How to apply:** 应用场景
```

## MEMORY.md 索引

`MEMORY.md` 文件是所有记忆的索引，不是记忆本身。每行一个链接，约 150 字符。

## CLAUDE.md 项目指令

`CLAUDE.md` 是项目级配置文件（应签入 git），定义：

- 代码规范和架构约定
- 技术栈说明
- 特殊注意事项
- 构建和测试命令

CLAUDE.md 的内容会在每次对话开始时加载。

## 什么**不**需要记忆

- 代码模式、架构、文件路径 — 可从当前项目状态推导
- Git 历史 — `git log` / `git blame` 更权威
- 已修复的 bug 方案 — fix 在代码中，commit message 有上下文
- CLAUDE.md 已有的内容
- 临时任务状态

## 使用原则

1. 在采纳记忆建议前验证其时效性
2. 过期记忆要及时更新或删除
3. 不要重复写入已存在的记忆
4. 链接相关记忆形成知识网络
