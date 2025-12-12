# HSResume

基于 **Nuxt v4 + Nuxt Content/Image/UI** 打造的双语简历展示与打印页面，可直接静态生成部署（兼容 GitHub Pages）。内容由 Markdown/YAML 驱动，便于版本化管理与二次编辑。

## Why HSResume?

**HSResume** stands for **Human‑centric & Structured Resume**:

- **Human‑centric**：强调以候选人的真实故事和特点为中心，而不是只堆技术关键词。模板支持用 Markdown 自由组织内容，让你的经历更贴近「人」而不是「机器生成的列表」。
- **Structured**：通过模块化配置和响应式布局，把信息组织成清晰的层级与版块，在网页和打印视图中都保持一致、专业的展示效果。

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

## 内容结构

- `content/resume/zh.md`：中文简历内容（主语言）
- `content/resume/en.md`：英文简历内容

字段说明（示例见文件内）：

- 基础信息：`name / highlights / nickname / birth / nationality / location / hometown / phone / email / homepages / im / adjustment / source / summary`
- 教育：`education[{ period, school, city, degree, major, form, roles, honors, scholarships }]`
- 项目：`projects[{ period, name, role, description[], responsibilities[], links[] }]`
- 游戏经历：`games[{ name, duration, level, notes }]`
- 奖项：`awards[{ date, title }]`
- 语言：`languages[{ name, level, certificate }]`
- 自述：`selfDescription`

修改内容后无需改动页面逻辑，重新运行 `pnpm dev` 或 `pnpm generate` 即可。

> 维护者协作（可选）：见 `CONTRIBUTING.md`。

## 界面与打印

- 右上角语言切换（中文 / English），打印/导出 PDF 按钮一键调用浏览器打印。
- 打印模式自动隐藏交互控件、两栏排版、链接后追加 URL，适合线下提交。
- 自定义样式位于 `app/assets/css/main.css`，可根据配色/间距需求微调。

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
- @nuxt/content：内容数据来源
- @nuxt/ui：UI 组件与主题色
- @nuxt/image：静态站图片优化（当前页面未强依赖，可扩展头像等）

如需开发调试，可开启 Nuxt DevTools（已在 `nuxt.config.ts` 启用）。
