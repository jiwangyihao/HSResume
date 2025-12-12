import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const repoRoot = process.cwd()

/** @typedef {{ worktree: string, branch?: string }} Worktree */

function die(message, code = 1) {
  // eslint-disable-next-line no-console
  console.error(`\n[content-worktree] ${message}\n`)
  process.exit(code)
}

function runGit(args, options = {}) {
  const res = spawnSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: options.stdio ?? 'pipe',
  })
  return res
}

function runGitIn(dir, args, options = {}) {
  const res = spawnSync('git', args, {
    cwd: dir,
    encoding: 'utf8',
    stdio: options.stdio ?? 'pipe',
  })
  return res
}

function assertGitRepoRoot() {
  if (!fs.existsSync(path.join(repoRoot, '.git'))) {
    die('请在仓库根目录运行（找不到 .git）。')
  }
}

function parseArgs(argv) {
  const out = {
    _: [],
    dir: null,
    branch: 'content',
    message: null,
    dryRun: false,
  }

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--dir') out.dir = argv[++i]
    else if (a === '--branch') out.branch = argv[++i]
    else if (a === '--dry-run') out.dryRun = true
    else if (a === '-m' || a === '--message') out.message = argv[++i]
    else out._.push(a)
  }

  return out
}

function defaultWorktreeDir() {
  // 使用相对路径：默认放到仓库同级目录：../HSResume-content
  return path.resolve(repoRoot, '..', 'HSResume-content')
}

function getWorktrees() {
  const res = runGit(['worktree', 'list', '--porcelain'])
  if (res.status !== 0) {
    die(`无法读取 worktree 列表：${res.stderr || res.stdout || 'unknown error'}`)
  }

  /** @type {Worktree[]} */
  const worktrees = []
  const lines = res.stdout.split(/\r?\n/)
  let cur = null

  for (const line of lines) {
    if (!line.trim()) continue
    const [k, ...rest] = line.split(' ')
    const v = rest.join(' ').trim()

    if (k === 'worktree') {
      if (cur) worktrees.push(cur)
      cur = { worktree: v }
    } else if (k === 'branch' && cur) {
      cur.branch = v
    }
  }
  if (cur) worktrees.push(cur)

  return worktrees
}

function findWorktreeByBranch(branchName) {
  const want = `refs/heads/${branchName}`
  const wts = getWorktrees()
  return wts.find((w) => w.branch === want)
}

function ensureBranchExists(branchName) {
  const res = runGit(['rev-parse', '--verify', branchName])
  if (res.status === 0) return

  const create = runGit(['branch', branchName], { stdio: 'inherit' })
  if (create.status !== 0) {
    die(`创建分支失败：${branchName}`)
  }
}

function ensureWorktree(branchName, dirAbs, dryRun) {
  const existing = findWorktreeByBranch(branchName)
  if (existing) return existing.worktree

  if (fs.existsSync(dirAbs)) {
    // 目录存在但不一定是 worktree。这里保守处理：要求为空或者已经是 worktree（.git 文件/目录）。
    const gitMarker = path.join(dirAbs, '.git')
    if (!fs.existsSync(gitMarker)) {
      die(`目标目录已存在但不是 worktree：${path.relative(repoRoot, dirAbs)}\n请删除/改名该目录，或用 --dir 指向空目录。`)
    }
    // 有 .git marker 的情况：可能是旧 worktree，也可能是普通 clone；交给 git worktree add 会报错，我们先尝试读取。
  }

  ensureBranchExists(branchName)

  if (dryRun) {
    // eslint-disable-next-line no-console
    console.log(`[dry-run] git worktree add ${path.relative(repoRoot, dirAbs)} ${branchName}`)
    return dirAbs
  }

  const res = runGit(['worktree', 'add', dirAbs, branchName], { stdio: 'inherit' })
  if (res.status !== 0) {
    die('worktree add 失败（可能分支已被其它 worktree 占用，或目录不可用）。')
  }

  return dirAbs
}

const PRIVATE_FILES = [
  'content/resume/zh.md',
  'content/resume/en.md',
  'public/avatar.png',
]

function copyPrivateFilesToWorktree(worktreeDir, dryRun) {
  let copied = 0
  for (const rel of PRIVATE_FILES) {
    const src = path.join(repoRoot, rel)
    const dst = path.join(worktreeDir, rel)

    if (!fs.existsSync(src)) {
      // eslint-disable-next-line no-console
      console.warn(`[content-worktree] 跳过：源文件不存在：${rel}`)
      continue
    }

    if (dryRun) {
      // eslint-disable-next-line no-console
      console.log(`[dry-run] copy ${rel} -> ${path.relative(repoRoot, dst)}`)
      copied++
      continue
    }

    fs.mkdirSync(path.dirname(dst), { recursive: true })
    fs.copyFileSync(src, dst)
    copied++
  }

  return copied
}

function cmdInit(opts) {
  assertGitRepoRoot()
  const dirAbs = opts.dir ? path.resolve(repoRoot, opts.dir) : defaultWorktreeDir()
  const wt = ensureWorktree(opts.branch, dirAbs, opts.dryRun)

  // eslint-disable-next-line no-console
  console.log(`[content-worktree] content worktree 就绪：${path.relative(repoRoot, wt)}`)
}

function cmdSync(opts) {
  assertGitRepoRoot()
  const dirAbs = opts.dir ? path.resolve(repoRoot, opts.dir) : defaultWorktreeDir()
  const wt = ensureWorktree(opts.branch, dirAbs, opts.dryRun)

  const copied = copyPrivateFilesToWorktree(wt, opts.dryRun)
  // eslint-disable-next-line no-console
  console.log(`[content-worktree] 同步完成：${copied} 个文件`) 

  if (!opts.dryRun) {
    runGitIn(wt, ['status', '-sb'], { stdio: 'inherit' })
  }
}

function cmdCommit(opts) {
  assertGitRepoRoot()
  const dirAbs = opts.dir ? path.resolve(repoRoot, opts.dir) : defaultWorktreeDir()
  const wt = ensureWorktree(opts.branch, dirAbs, opts.dryRun)

  copyPrivateFilesToWorktree(wt, opts.dryRun)

  if (opts.dryRun) {
    // eslint-disable-next-line no-console
    console.log('[dry-run] git add/commit will be executed in content worktree')
    return
  }

  const status = runGitIn(wt, ['status', '--porcelain'])
  if (status.status !== 0) {
    die(`读取 content worktree 状态失败：${status.stderr || status.stdout || 'unknown error'}`)
  }

  if (!status.stdout.trim()) {
    // eslint-disable-next-line no-console
    console.log('[content-worktree] content worktree 无变更，跳过提交。')
    return
  }

  const add = runGitIn(wt, ['add', ...PRIVATE_FILES], { stdio: 'inherit' })
  if (add.status !== 0) {
    die('git add 失败（请检查文件是否存在/权限）。')
  }

  const msg = opts.message || 'chore(content): update private resume content'
  const commit = runGitIn(wt, ['commit', '-m', msg], { stdio: 'inherit' })
  if (commit.status !== 0) {
    die('git commit 失败（可能没有 staged 变更）。')
  }
}

function cmdStatus(opts) {
  assertGitRepoRoot()
  const dirAbs = opts.dir ? path.resolve(repoRoot, opts.dir) : defaultWorktreeDir()

  // eslint-disable-next-line no-console
  console.log('[content-worktree] worktree 列表：')
  runGit(['worktree', 'list'], { stdio: 'inherit' })

  const wt = findWorktreeByBranch(opts.branch)
  if (!wt) {
    // eslint-disable-next-line no-console
    console.log(`\n[content-worktree] 未找到分支 ${opts.branch} 对应的 worktree；可运行 init 创建。`)
    return
  }

  // eslint-disable-next-line no-console
  console.log(`\n[content-worktree] ${opts.branch} worktree 状态：${wt.worktree}`)
  runGitIn(wt.worktree, ['status', '-sb'], { stdio: 'inherit' })

  // eslint-disable-next-line no-console
  console.log('\n[content-worktree] 私密文件清单（同步目标）：')
  for (const f of PRIVATE_FILES) {
    // eslint-disable-next-line no-console
    console.log(`- ${f}`)
  }

  // eslint-disable-next-line no-console
  console.log(`\n[content-worktree] 提示：默认 worktree 目录为 ../HSResume-content（相对仓库根目录）。`)
  // eslint-disable-next-line no-console
  console.log('[content-worktree] 你也可以用 --dir 指定相对路径，例如：--dir ..\\content-worktree')
}

function cmdHelp() {
  // eslint-disable-next-line no-console
  console.log(`\nHSResume content worktree helper\n\n用法：\n  node scripts/content-worktree.mjs <command> [options]\n\nCommands:\n  init     初始化/确保 content worktree 存在\n  sync     将 main 工作区的私密文件同步到 content worktree\n  commit   sync 后在 content worktree 内 add + commit\n  status   查看 worktree 与 content 状态\n\nOptions:\n  --dir <path>       worktree 目录（相对路径或绝对路径；建议相对）\n  --branch <name>    分支名（默认 content）\n  -m, --message <m>  commit message（仅 commit）\n  --dry-run          只打印将要执行的动作\n\n示例：\n  node scripts/content-worktree.mjs init\n  node scripts/content-worktree.mjs sync\n  node scripts/content-worktree.mjs commit -m "chore(content): update resume"\n  node scripts/content-worktree.mjs status\n`)
}

const opts = parseArgs(process.argv.slice(2))
const command = opts._[0] || 'help'

switch (command) {
  case 'init':
    cmdInit(opts)
    break
  case 'sync':
    cmdSync(opts)
    break
  case 'commit':
    cmdCommit(opts)
    break
  case 'status':
    cmdStatus(opts)
    break
  case 'help':
  default:
    cmdHelp()
    break
}
