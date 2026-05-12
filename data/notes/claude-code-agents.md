---
title: Claude Code AI Agent 系统
tags: [claude-code, agents, subagents, parallel]
created: 2026-05-12T00:00:00.000Z
updated: 2026-05-12T00:00:00.000Z
---

# Claude Code AI Agent 系统

Claude Code 能派生子 agent 处理复杂任务，支持并行执行和结果汇总。

## Agent 类型

### Explore Agent
快速搜索型 agent，适用于代码定位：

- 按模式查找文件
- 搜索符号和关键字
- 回答"X 在哪里定义"和"哪些文件引用了 Y"

**参数**：
- `quick`：单个目标查找
- `medium`：中等范围探索
- `very thorough`：全面搜索

### Plan Agent
软件架构师 agent，设计实施方案：

- 分析需求和现有架构
- 比较多种实现方案
- 输出分步实施计划
- 识别关键文件和风险点

详见 [[claude-code-plan]]

### General-Purpose Agent
通用型 agent，处理任意复杂任务：

- 研究型任务（搜索、读取、分析）
- 多步骤执行任务
- 需要独立判断的任务

### Claude Code Guide Agent
专门回答关于 Claude Code 本身的问题：

- CLI 功能、hooks、slash 命令
- MCP 服务器、配置
- IDE 集成、快捷键
- Claude Agent SDK、Claude API

## 使用方式

```bash
# 基本用法
Agent(
  description="搜索认证代码",
  prompt="找到所有与用户认证相关的文件，包括中间件、路由、hooks...",
  subagent_type="Explore"
)

# 后台执行
Agent(
  description="独立代码审查",
  prompt="审查 PR 变更的安全性...",
  run_in_background=true
)
```

## 并行执行

多个独立 Agent 可在单条消息中并发启动：

```
# 同时启动 3 个 agent
Agent(description="检查前端代码", ...)
Agent(description="检查后端代码", ...)
Agent(description="检查测试覆盖", ...)
```

## 隔离模式

使用 `isolation: "worktree"` 在临时 git worktree 中执行：

- 自动创建隔离的工作副本
- agent 无变更时自动清理
- 有变更时返回路径和分支

## 设计原则

1. **自包含的 prompt**：Agent 不共享会话上下文，prompt 需包含所有必要信息
2. **明确期望**：清楚说明是需要研究还是需要写代码
3. **结果验证**：Agent 报告的是意图而非实际操作，重要变更需核实
4. **适度使用**：简单任务直接使用 Glob/Grep/Read，复杂任务才委派给 Agent
