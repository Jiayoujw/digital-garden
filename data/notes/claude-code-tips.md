---
title: Claude Code 最佳实践与技巧
tags: [claude-code, tips, best-practices]
created: 2026-05-12T00:00:00.000Z
updated: 2026-05-12T00:00:00.000Z
---

# Claude Code 最佳实践与技巧

## 编写有效的 CLAUDE.md

项目级的 `CLAUDE.md` 是提升 Claude Code 效率的最重要文件：

```markdown
# 项目指令

## 技术栈
- Next.js 16 App Router
- TypeScript strict mode
- Tailwind CSS v4

## 代码规范
- 函数组件使用 named export
- 类型定义放在 types.ts
- API 路由使用 NextRequest/NextResponse

## 注意事项
- 不要修改 next.config.ts
- 数据库迁移需要手动审批
```

## Prompt 技巧

### 对 Agent 编写自包含的 Prompt

错误的 prompt：
```
"找到认证代码然后修复 bug"
```

正确的 prompt：
```
"找到所有与用户认证相关的文件（中间件、hooks、路由）。
我注意到登录后 redirect 不正确，怀疑是 middleware.ts 
中的 matcher 配置问题。请搜索相关代码并报告发现。"
```

### 给出具体范围

- 不好："优化代码"
- 好："优化 ProductList 组件的渲染性能，重点关注 useMemo 的使用"

### 说明约束条件

- "不要引入新的 npm 依赖"
- "保持向后兼容"
- "只在 src/components/ 下修改"

## 渐进式任务

对于大型任务，分阶段进行：

1. **第一阶段**：澄清需求和范围
2. **第二阶段**：进入 [[claude-code-plan]] 设计架构
3. **第三阶段**：逐步实施，每步验证
4. **第四阶段**：整体测试和修复

## 善用记忆系统

- 在 CLAUDE.md 中写清楚项目约定
- 让 Claude Code 记住你的偏好（代码风格、命名习惯）
- 定期检查和更新记忆

详见 [[claude-code-memory]]

## 工具使用技巧

### 编辑

- 使用 Edit 工具（非 Write）进行局部修改
- 批量替换使用 `replace_all: true`
- 编辑前确保已 Read 文件

### 搜索

- 有明确目标时直接用 Glob/Grep
- 探索性搜索委托给 Explore Agent
- 多个独立搜索并发执行

### 终端

- 长时间任务使用 `run_in_background`
- 有依赖的命令用 `&&` 连接
- 优先使用专用工具而非 shell 命令

## 常见模式

### 重构模式

1. Grep 搜索所有引用
2. Plan mode 设计方案
3. 逐个文件 Edit
4. 运行测试验证

### Bug 修复模式

1. 理解预期行为
2. Grep 定位相关代码
3. Read 深入理解逻辑
4. Edit 修复
5. 验证修复

### 新功能模式

1. 理解现有架构
2. Enter Plan Mode 设计方案
3. 获得用户批准
4. 逐步实施
5. 构建和测试

## 避免的反模式

1. 不问清楚就实施模糊需求
2. 过度抽象（为不存在未来需求设计）
3. 添加不必要的错误处理
4. 在未验证的情况下声称完成
5. 使用破坏性操作绕过问题而非解决根因
