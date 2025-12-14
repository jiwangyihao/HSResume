# <img src="./public/favicon.svg" width="24" height="24" alt="HSResume" /> HSResume

基于 **Nuxt v4** 构建的简历展示与打印页面。内容由 Markdown/YAML 驱动，支持静态生成与部署。

## Why HSResume?

**HSResume** stands for **Human‑centric & Structured Resume**:

- **Human‑centric**：强调以候选人的真实故事和特点为中心，而不是只堆技术关键词。模板支持用 Markdown 自由组织内容，让你的经历更贴近「人」而不是「机器生成的列表」。
- **Structured**：通过模块化配置和响应式布局，把信息组织成清晰的层级与版块，在网页和打印视图中都保持一致、专业的展示效果。

## 主要特性

- **数据驱动**：通过 Markdown Frontmatter 管理简历数据，便于版本控制。
- **打印优化**：针对打印场景进行了样式适配，支持自动隐藏交互元素与链接处理。
- **双语支持**：内置中英文切换功能。

## 快速开始

```bash
pnpm install
pnpm dev
# 浏览器访问 http://localhost:3000
```

## 生成静态站点

```bash
pnpm generate
# 输出位于 .output/public，可直接推送至 GitHub Pages / 静态托管
```

## 目录结构

```text
.
├── app/                # Nuxt 应用源码 (组件, 页面, 布局)
├── content/            # 简历内容 (Markdown/YAML)
├── public/             # 静态资源 (头像, 图标)
├── schemas/            # 数据校验 Schema
├── scripts/            # 辅助脚本 (Worktree 管理, 资源缓存)
└── nuxt.config.ts      # Nuxt 配置文件
```

## 配置指南

简历内容位于 `content/resume/` 目录下，支持 `zh.md` (中文) 和 `en.md` (英文)。

### 基础字段

支持的字段如下（详细定义见 `schemas/resume-frontmatter.schema.json`）：

- **基础信息**：`name`, `subtitle`, `highlights`, `nationality`, `email`, `homepages`, `summary`
- **教育经历**：`education` (包含 `period`, `school`, `city`, `degree`, `major`, `form`, `roles`, `honors`, `scholarships`)
- **工作/实习**：`work`, `internships`
- **项目经历**：`projects` (包含 `period`, `name`, `role`, `description`, `responsibilities`, `links`)
- **游戏经历**：`games` (包含 `name`, `detail`, `notes`)
- **奖项荣誉**：`awards` (包含 `date`, `title`)
- **语言能力**：`languages` (包含 `name`, `certificate`)

### 高级配置

#### 奖项折叠 (Awards Folding)

当奖项较多时，可通过正则规则自动折叠“不重要”的奖项，保持版面整洁。

```yaml
awardsFoldingRules:
  # 匹配该正则的奖项会被折叠
  unimportantTitlePattern: (校级|省级|区域|creative group)
  # 匹配该正则的奖项会强制开始新分组
  importantTitlePattern: (全国|全球|international|national)
```

#### 主题配色 (Colors)

支持为不同版块指定颜色，可使用 Tailwind CSS 颜色名（如 `primary`, `blue`, `gray`）或 Hex 色值。

```yaml
colors:
  profile: primary
  education: blue
  projects: emerald
  awards: amber
```

#### GitHub 贡献图

在页脚展示 GitHub 贡献热力图。

```yaml
github:
  user: your-username
  orgs: [] # 可选：包含的组织
```

## 自定义与扩展

### 样式定制

- **全局样式**：修改 `app/assets/css/main.css` 可调整字体、间距等全局 CSS 变量。
- **组件样式**：项目使用 Tailwind CSS，可直接在组件类名中修改样式。

### 图标系统

项目集成了 Iconify，支持在 YAML 配置中直接使用图标类名（如 `homepages` 或 `projects` 的 `icon` 字段）：

- `i-heroicons-envelope`
- `i-simple-icons-github`
- `i-ph-globe`

## 界面与打印

- **多语言**：右上角支持中/英切换。
- **打印优化**：
  - 点击打印按钮或使用浏览器打印 (Ctrl+P) 即可输出 PDF。
  - 打印模式下会自动隐藏交互元素（按钮、切换器）。
  - 链接会自动处理显示格式，适应纸质阅读。
  - 自动调整双栏布局比例。

## 部署指引（GitHub Pages 示例）

推荐方式（GitHub Actions 自动部署）：

1. 在仓库设置中将 Pages 的 Source 选择为 **GitHub Actions**。
2. 推送到 `content` 分支后，会自动执行 `pnpm generate` 并发布到 Pages。

手动方式（发布到 `gh-pages` 分支）：

1. `pnpm install && pnpm generate`
2. 将 `.output/public` 发布到 `gh-pages` 分支。
3. 在仓库设置里启用 Pages，指向 `gh-pages`。

## 依赖

- Nuxt 4
- @nuxt/content
- @nuxt/ui
- @nuxt/image

如需开发调试，可开启 Nuxt DevTools。
