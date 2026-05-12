---
title: Claude Code Git/GitHub 集成
tags: [claude-code, git, github, version-control]
created: 2026-05-12T00:00:00.000Z
updated: 2026-05-12T00:00:00.000Z
---

# Claude Code Git/GitHub 集成

Claude Code 深度集成了 Git 和 GitHub 操作。

## Git 操作

### 智能提交

Claude Code 能自动分析变更内容，生成规范的 commit message：

- 自动检测变更类型（feat/fix/refactor/docs）
- 生成中文或英文的提交信息（聚焦"为什么"而非"是什么"）
- 遵循项目已有的 commit message 风格

### 安全协议

Claude Code 遵循严格的 Git 安全协议：

1. **永不**修改 git config
2. **永不**在未经确认的情况下执行破坏性操作（`push --force`、`reset --hard`、`checkout --`）
3. **永不**跳过 hooks（`--no-verify`、`--no-gpg-sign`）
4. **永不** force push 到 main/master 分支
5. 总是创建**新 commit**而非 amend（除非用户明确要求）
6. 优先使用 `git add <specific-files>` 而非 `git add -A`，避免意外提交敏感文件

### 常见工作流

```bash
# 查看状态
git status
git diff
git log

# 创建提交
git add <files>
git commit -m "feat: add new feature"

# 分支管理
git checkout -b feature/new-feature
```

## GitHub 集成

通过 `gh` CLI 工具实现 GitHub 操作：

### Pull Request 管理

- 自动生成 PR 标题（<70 字符）和描述
- 创建 PR 并返回链接
- 查看 PR 评论和状态

### Issues 管理

```bash
gh issue list
gh issue view <number>
gh issue create --title "..." --body "..."
```

### 其他操作

- 查看 Actions 运行状态
- 管理 Release

## 最佳实践

1. 在 push 前确认要推送的内容
2. 使用 descriptive 的 commit message
3. PR 描述聚焦于变更目的和测试计划
4. 提交前确保 pre-commit hooks 通过
