# Contributing / 协作指南

> 本文档主要面向**维护者与协作者**，涉及分支策略、Worktree 工作流及代码结构规范。
> 若仅需修改简历内容或样式并部署，请直接参考“快速上手”章节。

## 快速上手（私密内容工作流）

本仓库采用 **双分支 + Git Worktree** 策略，以隔离“公共代码”与“私密简历内容”。推荐操作流程如下：

1. **初始化 Content Worktree**：

   ```bash
   pnpm content:init
   ```

2. **编辑私密文件**（在 `main` 工作区）：
   这些文件仅存在于本地，不会被提交至 `main` 分支：

   - `content/resume/zh.md`
   - `content/resume/en.md`
   - `public/avatar.png`

3. **同步内容**：
   将私密内容同步至 Content Worktree（默认合并 `main` 的公共变更）：

   ```bash
   pnpm content:sync
   ```

4. **提交私密内容**（在 Content Worktree 中）：

   ```bash
   pnpm content:commit -- -m "chore(content): update resume"
   ```

5. **检查状态**：

   ```bash
   pnpm content:status
   ```

> Windows / PowerShell 提示：`--` 用于透传参数，请按原样使用。

## 分支管理策略

本仓库维护两条主要分支：

- `main`：公共代码（主题、样式、组件、示例内容）。可开源或提交 PR。
- `content`：私密内容（真实简历数据、头像）。仅在私有环境维护。

此策略旨在确保：

- `main` 分支不包含敏感个人信息。
- 本地开发时可使用真实内容预览。
- 私密内容的提交仅发生在 `content` 分支，不受 `main` 的 `.gitignore` 影响。

## 私密文件管理

在 `main` 分支中，以下文件被 `.gitignore` 忽略：

- `content/resume/zh.md`
- `content/resume/en.md`
- `public/avatar.png`

`main` 分支提供对应的示例文件（可开源）：

- `content/resume/zh.sample.md`
- `content/resume/en.sample.md`
- `public/avatar.sample.svg`

系统逻辑：若未找到真实文件，将自动回退至示例文件。

## Worktree 目录结构

建议的目录布局（相对路径）：

- `./`：本仓库（`main` worktree）
- `../HSResume-content/`：`content` worktree（默认路径）

**关于工作区切换的说明**：
不建议在同一工作区直接切换分支，因为 `main` 忽略了私密文件，切换分支容易导致文件丢失、冲突或误提交。使用 Worktree 可确保两个分支拥有独立的工作目录。

## 脚本工具说明

脚本位于 `scripts/content-worktree.mjs`。

### 初始化

创建或确认 `content` 分支对应的 Worktree 存在：

```bash
pnpm content:init
```

### 同步内容

当在 `main` 工作区修改了私密文件后，运行：

```bash
pnpm content:sync
```

默认行为：

1. 在 `content` worktree 中合并 `main` 的公共变更。
2. 将 `main` 工作区的私密文件复制到 `content` worktree。
3. 打印 `content` 的 Git 状态。

跳过合并（不推荐）：

```bash
pnpm content:sync -- --no-merge
```

### 提交更改

```bash
pnpm content:commit -- -m "chore(content): update resume"
```

### 查看状态

```bash
pnpm content:status
```

### 自定义目录

指定相对路径（以仓库根目录为基准）：

```bash
pnpm content:init -- --dir ..\\my-content-worktree
```

## 代码结构与开发规范

本节为**目录结构、组件职责及布局约束**的权威参考。

> 目标：保持 `app/pages/index.vue` 作为“装配层”，确保 SSR、预渲染及打印行为的稳定性。

### 目录分层

#### `app/pages/`

- 页面路由入口。
- **约定**：仅负责数据获取、组件装配及少量布局测量，避免包含大量业务模板。

#### `app/components/`

组件按职责分类：

- `layout/`：页面级布局与框架组件（Header, Footer, ActionBar, Skeleton）。
- `sections/`：页面版块组件。
  - **约定**：默认一文件对应一个瀑布流 Item。如需输出多个 Item，请使用多根模板。
- `cards/`：列表条目/卡片组件，仅渲染单条数据。
- `ui/`：通用 UI 组件（SectionHeader, BadgePills）。
- `content/`：内容渲染器（Markdown）。

#### `app/composables/`

- 可复用的组合式函数。
- **约定**：页面数据组装逻辑优先置于此处。

#### `app/types/`

- 项目共享 TypeScript 类型。

### 自动导入约定

- 组件自动导入已启用，且**不带路径前缀**。
- `app/composables/` 下的函数默认自动导入，优先避免显式 Import。

### 布局开发规范

瀑布流布局依赖 `:scope > .waterfall-item` 选择器：

1. `.waterfall-item` **必须**是容器的直接子元素。
2. `sections/` 组件不应在外层包裹额外的 Wrapper。
3. `AwardsSection` 必须保留 `id="awards-section"` 以保证布局稳定性。

### 打印与样式规范

- 影响布局与打印的关键 CSS 须置于 `app/assets/css/main.css`。
- 避免在 Scoped 样式中编写全局布局规则。
- 优先使用 Tailwind 的 `print:*` 工具类处理打印差异。

### 导入路径

- 统一使用 `~/` 作为绝对导入前缀。
- 尽量移除可自动导入的显式 Import。

### 验证流程

重构后必须执行：

1. `pnpm -s build`：确保构建无误。
2. 人工验证：
   - 瀑布流布局是否正常。
   - 打印预览是否符合预期。

## 常见问题

### 关于私密内容提交的安全性

`main` 分支已通过 `.gitignore` 忽略私密文件。建议仅在 `content` worktree 中执行提交操作。

### Content Worktree 创建失败

常见原因：

- `content` 分支已被其他 Worktree 占用。
- 目标目录已存在但非 Worktree。

解决方案：

- 运行 `pnpm content:status` 查看当前 Worktree 列表。
- 使用 `--dir` 指定其他目录。
