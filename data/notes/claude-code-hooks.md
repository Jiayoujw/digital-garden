---
title: Claude Code Hooks 自动化钩子
tags: [claude-code, hooks, automation, events]
created: 2026-05-12T00:00:00.000Z
updated: 2026-05-12T00:00:00.000Z
---

# Claude Code Hooks 自动化钩子

Hooks 系统允许在 Claude Code 的工具调用前后触发自定义脚本，实现自动化工作流。

## Hook 事件类型

### 工具相关事件

- **PreToolUse**：工具调用前触发
- **PostToolUse**：工具调用成功后触发
- **PostToolUseFailure**：工具调用失败后触发

### 会话相关事件

- **UserPromptSubmit**：用户提交消息时触发
- **SessionStart**：会话开始时触发
- **SessionEnd**：会话结束时触发

### 通知事件

- **Notification**：发送通知（如任务完成提醒）

## Hook 配置

在 `.claude/settings.json` 中配置 hooks：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "command": "npm run lint",
        "workingDir": "${projectDir}"
      }
    ]
  }
}
```

## 典型场景

1. **代码格式化**：Write/Edit 后自动运行 prettier
2. **类型检查**：文件修改后执行 tsc --noEmit
3. **安全扫描**：git 操作前检查敏感信息
4. **通知提醒**：长任务完成后发送桌面通知
5. **自定义日志**：记录所有工具调用到日志文件

## 环境变量

Hook 脚本可访问以下环境变量：

- `CLAUDE_PROJECT_DIR`：项目根目录
- `CLAUDE_TOOL_NAME`：被调用的工具名
- `CLAUDE_TOOL_INPUT`：工具输入参数（JSON）
- `CLAUDE_CONVERSATION_ID`：当前会话 ID

## 安全注意事项

- Hooks 的 stdout/stderr 会显示给用户（可用于通知）
- 返回非 0 退出码会阻止操作（PreToolUse）/在输出中标记（PostToolUse）
- Hooks 脚本的权限与当前用户相同
- 避免在 hooks 中执行耗时操作（会阻塞主流程）

## 与 CI/CD 的区别

- Hooks 在**本地**运行，每次使用工具时触发
- CI/CD 在**远程**运行，在 push 时触发
- Hooks 适合快速反馈（格式检查、类型检查）
- CI/CD 适合完整验证（测试套件、构建）
