# Contributing / 协作指南

> 说明：本指南主要面向**维护者/协作者的开发流程**。对下游使用者（只想拿来改内容/改样式然后部署）来说，一般不需要关心分支与 worktree 细节。

这个仓库采用 **双分支 + Git worktree** 的方式管理简历内容：

- `main`：公共代码（主题/样式/组件/示例内容）。可以放心开源/PR。
- `content`：私密内容（真实 `zh.md` / `en.md` / `avatar.png`）。只在你自己的仓库/私密环境维护。

这样能同时满足：

- `main` 不提交真实简历与头像
- 本地开发时仍然可以用真实内容预览
- 切到 `content` 分支可以“自然地”提交私密内容（不会因为切分支把文件删掉/覆盖）

## 私密文件清单

在 `main` 分支中，这些文件应被 `.gitignore` 忽略（仅本地存在）：

- `content/resume/zh.md`
- `content/resume/en.md`
- `public/avatar.png`

`main` 分支提供对应的示例文件：

- `content/resume/zh.sample.md`
- `content/resume/en.sample.md`
- `public/avatar.sample.svg`

页面逻辑会在找不到真实文件时自动回退到 sample。

## 目录结构（两个工作区）

建议的布局（均为相对路径表达）：

- `./`：本仓库（`main` worktree）
- `../HSResume-content/`：content worktree（默认脚本路径）

> 为什么不建议“同一个工作区直接切分支”？
> 因为 `main` 忽略私密文件后，切分支/合并容易造成文件被删除、冲突或误提交；worktree 可以让两个分支各自有独立工作目录，最省心。

## 一键脚本（推荐）

仓库提供脚本：`scripts/content-worktree.mjs`。

### 初始化 content 工作区

- 创建/确保 `content` 分支对应的 worktree 存在（默认目录：`../HSResume-content`）。

运行：

- `pnpm content:init`

### 同步私密内容到 content worktree

当你在 `main` 工作区修改了本地私密文件（例如更新 `zh.md/en.md`、替换 `avatar.png`），运行：

- `pnpm content:sync`

它会把 `main` 工作区的私密文件复制到 `content` worktree，并打印 `content` 的 git 状态。

### 在 content worktree 里提交

- `pnpm content:commit -- -m "chore(content): update resume"`

> 注意：`--` 是把参数透传给脚本；Windows / PowerShell 下也适用。

### 查看状态

- `pnpm content:status`

## 自定义 worktree 目录（相对路径）

如果你不想用默认的 `../HSResume-content`，可以指定相对路径：

- `pnpm content:init -- --dir ..\\my-content-worktree`

脚本会以“仓库根目录”为基准解析相对路径。

## 常见问题

### 1) 我担心误把私密内容提交到 main

- `main` 已通过 `.gitignore` 忽略私密文件。
- 建议只在 `content` worktree 做提交（用 `pnpm content:commit`）。

### 2) content worktree 创建失败

常见原因：

- `content` 分支已经被其它 worktree 占用
- `../HSResume-content` 目录已存在但不是 worktree

解决：

- 运行 `pnpm content:status` 看当前 worktree 列表
- 或用 `--dir` 换一个目录
