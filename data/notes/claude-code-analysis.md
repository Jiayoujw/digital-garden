---
title: Claude Code 代码分析工具
tags: [claude-code, analysis, search, glob, grep]
created: 2026-05-12T00:00:00.000Z
updated: 2026-05-12T00:00:00.000Z
---

# Claude Code 代码分析工具

Claude Code 提供两个专用的代码搜索工具：Glob 和 Grep。

## Glob — 文件模式匹配

按文件名模式快速搜索文件：

```bash
# 查找所有 TypeScript 文件
Glob pattern="**/*.ts"

# 在特定目录中搜索
Glob pattern="src/components/**/*.tsx"

# 查找特定命名模式
Glob pattern="**/*.test.ts"
```

**特性**：
- 支持标准 glob 模式
- 按修改时间排序结果
- 适用于大型代码库，性能优于 `find`

## Grep — 内容搜索

基于 ripgrep 的强大内容搜索工具：

```bash
# 基本搜索
Grep pattern="interface.*Props" path="/src"

# 按文件类型过滤
Grep pattern="useState" type="tsx" path="/src"

# 按 glob 过滤
Grep pattern="TODO" glob="*.ts" path="/src"

# 正则搜索
Grep pattern="function\s+\w+Component" path="/src"
```

### 输出模式

- `files_with_matches`（默认）— 仅列出匹配文件
- `content` — 显示匹配行（支持上下文：-A、-B、-C）
- `count` — 显示匹配计数

### 高级特性

- **大小写不敏感**：`-i` 参数
- **多行搜索**：`multiline: true` 用于跨行模式
- **结果限制**：`head_limit` 控制输出量
- **偏移量**：`offset` 跳过前 N 个结果

## Agent 搜索

对于需要多轮搜索的开放性问题，使用 Agent 工具委托给子代理：

```bash
Agent description="搜索认证相关代码" prompt="在整个项目中找到所有与用户认证相关的文件..."
```

详见 [[claude-code-agents]]

## 搜索策略建议

1. **明确目标**时直接用 Glob/Grep
2. **探索性搜索**时用 Agent 委托
3. **并行搜索**：多个独立搜索可在同一轮中并行发起
4. **逐步细化**：先用宽泛的模式，再根据结果收缩范围
