---
title: Claude Code 终端与 Shell 能力
tags: [claude-code, terminal, shell, bash]
created: 2026-05-12T00:00:00.000Z
updated: 2026-05-12T00:00:00.000Z
---

# Claude Code 终端与 Shell 能力

Claude Code 通过 Bash 工具执行 shell 命令，可运行任何命令行操作。

## 基本用法

```bash
# 简单命令
Bash command="npm install"

# 复杂命令链（用 && 连接依赖操作）
Bash command="npm run build && npm test"

# 不要用 ; 连接无关命令（用多个 Bash 调用代替）
```

## 后台任务

通过 `run_in_background: true` 参数启动后台任务，适用场景：

- 长时间运行的构建命令
- 开发服务器
- 测试套件

```bash
# 启动开发服务器
Bash command="npm run dev" run_in_background=true
```

任务完成后会通过通知提醒，无需轮询。

## 超时控制

默认超时 2 分钟，可设置最长 10 分钟（600000ms）：

```bash
Bash command="npm run long-build" timeout=600000
```

## 安全注意事项

Claude Code 对以下操作会请求用户确认：

- 破坏性操作（rm -rf、git reset --hard）
- 对外部系统的修改（git push、数据库操作）
- 可能影响共享状态的操作

## Git 安全协议

Claude Code 内置了 Git 安全协议：

1. **永不**跳过 hooks（--no-verify、--no-gpg-sign）
2. **永不**修改 git config
3. **永不**在未经确认的情况下执行破坏性 git 命令
4. **永不** force push 到 main/master 分支
5. 总是创建**新 commit**而非 amend（除非用户明确要求）

## 推荐用法

1. **优先使用专用工具**：用 Read/Write/Edit/Glob/Grep 代替 cat/echo/ls/grep 等命令
2. **并行执行**：多个独立命令可在同一轮中并发执行
3. **链式依赖**：有依赖关系的命令用 `&&` 连接
4. **绝对路径**：使用绝对路径避免 `cd` 带来的状态管理问题
