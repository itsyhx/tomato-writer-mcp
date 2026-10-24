<div align="center">

# 🍅 tomato-writer-mcp

**AI 帮你写小说 —— 在 Claude / Cursor 里用一句话发章节、管书、盯数据。**

番茄小说作家后台 MCP Server | Fanqie Novel (番茄小说) Writer MCP Server for Claude, Cursor & Any MCP Client

<p>
  <a href="https://github.com/itsyhx/tomato-writer-mcp"><img src="https://img.shields.io/badge/GitHub-tomato--writer--mcp-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License"></a>
  <img src="https://img.shields.io/badge/Node-%E2%89%A518-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node">
  <img src="https://img.shields.io/badge/MCP-2.0.0-8250DF?style=for-the-badge&logo=anthropic&logoColor=white" alt="MCP">
  <img src="https://img.shields.io/badge/20%2B%20Tools-FF6B35?style=for-the-badge" alt="Tools">
</p>

### ⭐ If this helps you, please star it — it's the only payment open-source authors get.

</div>

---

## 💬 你能用它做什么 / What You Can Do

装好之后，你不再需要打开作家后台网页。直接对 AI 说话：

| 你说 / You say | AI 做 / AI does |
|---|---|
| 💬「看看我这几本书的数据怎么样」 | `list_novels` + `get_novel_stats` 对比各书阅读量 |
| 💬「把第 16 章发上去」 | `publish_chapter` 从 Markdown 稿件提取该章并发布 |
| 💬「明早 8 点定时发第 17 章」 | `publish_chapter` 带 `publish_time` 定时发布 |
| 💬「哪章追读掉得最狠？」 | `get_novel_stats` 拉全章追读数据并分析趋势 |
| 💬「有审核结果了吗」 | `list_notices` 查通知 / `get_banned_info` 查违规状态 |
| 💬「给我几个热词参考，想开新书」 | `get_hot_words` + `get_douyin_hot_list` 拉选题灵感 |
| 💬「删掉那章测试稿」 | `delete_chapter`（需确认，防误删） |
| 💬「Cookie 是不是过期了」 | `check_login` 一键探活 |

> 📷 Demo GIF / 演示动图 — **PR welcome**（这是本项目最需要的贡献）

---

## 🚀 30 秒快速开始 / Quick Start

### ① 获取鉴权（一次性）

1. 浏览器登录 [番茄小说作家后台](https://fanqienovel.com/main/writer/)
2. `F12 → Network` → 选中任意 `/api/author/...` 请求
3. 复制请求头 **`Cookie`** 和 **`X-Secsdk-Csrf-Token`**

```bash
cp .env.example .env
# 填入上面两个值
```

> Cookie 有效期约 1~2 个月，失效时用 `check_login` 秒级发现。

### ② 启动

```bash
npx tomato-writer-mcp        # 一行启动，无需安装
```

或本地开发：
```bash
git clone https://github.com/itsyhx/tomato-writer-mcp.git
cd tomato-writer-mcp
npm install && npm run build && npm start
```

### ③ 接入 AI 客户端 / Connect to Your AI Client

<details open>
<summary><b>Claude Desktop</b>（最常用 / Most popular）</summary>

配置文件 config file：
- macOS：`~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows：`%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "tomato-writer": {
      "command": "npx",
      "args": ["-y", "tomato-writer-mcp"],
      "env": {
        "TOMATO_COOKIE": "your-cookie",
        "TOMATO_CSRF_TOKEN": "your-token"
      }
    }
  }
}
```
</details>

<details>
<summary><b>Cursor</b></summary>

`.cursor/mcp.json`：
```json
{
  "mcpServers": {
    "tomato-writer": {
      "command": "npx",
      "args": ["-y", "tomato-writer-mcp"],
      "env": {
        "TOMATO_COOKIE": "your-cookie",
        "TOMATO_CSRF_TOKEN": "your-token"
      }
    }
  }
}
```
</details>

<details>
<summary><b>Cline / Continue / Cherry Studio / 其它 MCP 客户端</b></summary>

任意支持 MCP stdio 的客户端：`command: npx`，`args: ["-y","tomato-writer-mcp"]`，两个环境变量塞进 `env`。
</details>

重启客户端 → 对 AI 说「**看看我有哪些书**」✅

---

## 🛠️ 20+ 工具一览 / Tools

### 📚 书籍管理 / Book Management
| Tool | 说明 |
|---|---|
| `list_novels` | 列出所有小说（book_id、书名、字数、阅读数、连载状态） |
| `switch_novel` | 切换当前操作的书 |
| `get_current_novel` | 查看当前选中的书 |

### ✍️ 发布 / Publishing
| Tool | 说明 |
|---|---|
| `publish_chapter` | **发布 / 定时发布一章**（支持直接传正文，或从 Markdown 稿件按章节号提取） |
| `list_chapters` | 各分卷章节列表（含定时待发 / 已发布状态） |
| `list_drafts` | 草稿箱列表 |
| `delete_chapter` | 删除章节（**需 `confirm=true`**，防误删） |

### 📊 数据与分析 / Analytics
| Tool | 说明 |
|---|---|
| `get_novel_stats` | 书级概览 + 各章阅读/追读/读完率明细 |
| `get_author_overview` | 作者级数据总览 |
| `get_attend_calendar` | 打卡 / 全勤日历 |
| `get_checkin_tickets` | 剩余打卡券 |

### 🔔 监控与灵感 / Monitoring & Inspiration
| Tool | 说明 |
|---|---|
| `list_notices` | 站内通知（审核结果监控） |
| `get_banned_info` | 违规 / 封禁状态（可做自动告警） |
| `get_hot_words` | 站内热词（起书名 / 蹭流量） |
| `get_douyin_hot_list` | 抖音热点榜（选题参考） |
| `get_medal_summary` | 任务勋章概览 |
| `get_ai_qualification` | AI 功能资格（AI 插画/命名/咨询是否开放） |

### 🔐 账号 / Account
| Tool | 说明 |
|---|---|
| `check_login` | 登录态探针（Cookie 失效早知道） |
| `get_account_info` | 账号信息 |
| `get_login_qrcode` | 扫码登录二维码（Base64 PNG） |

---

## 🔬 技术要点 / How It Works

本项目最有价值的部分 —— **我们摸清了番茄作家后台的私有协议**：

| 要点 | 说明 |
|---|---|
| **鉴权 / Auth** | `Cookie` + `X-Secsdk-Csrf-Token` 两个请求头 |
| **无需风控签名** | ❌ 不需要 `a_bogus` / `msToken`（前端风控 SDK 注入，服务端对作家接口不强制校验） |
| **POST 编码** | 必须 `application/x-www-form-urlencoded`（JSON body 会得到空响应） |
| **公共参数** | `aid=2503&app_name=muye_novel` |
| **响应格式** | 统一 `{ code, message, data }`；`code===0` 成功，`-2` 参数有误，`-3` 鉴权失效 |

已实测覆盖 `/api/author/**` 共 **22 个端点**。

---

## 🧪 冒烟测试 / Smoke Test

```bash
npm run smoke              # 只读接口逐个体检
npm run smoke -- --write   # 额外测「建草稿→删草稿」安全写链路
```

```
✅ check_login（登录态）  (312 bytes)
✅ list_novels（书单）  (2841 bytes)
✅ get_hot_words（热词）  (12053 bytes)
结果：15 通过 / 0 失败
```

---

## 🏗️ 架构 / Architecture

```
src/
├── index.ts              # MCP Server 入口（stdio）
├── tomato/
│   ├── client.ts         # HTTP 客户端（鉴权 / 编码 / 错误归一）
│   ├── config.ts         # .env 加载 + 当前书状态持久化
│   ├── service.ts        # 书籍 / 章节 / 发布核心服务
│   ├── author.ts         # 账号 / 通知 / 违规 / 打卡 / 删除扩展
│   └── content.ts        # Markdown → 番茄正文 HTML
└── tools/                # MCP 工具定义
```

**零重依赖** —— 仅 MCP SDK + dotenv，单进程 stdio，树莓派可跑。

---

## ❓ FAQ

**Q: 需要安装浏览器或 Playwright 吗？**
A: 不需要。纯 HTTP + Cookie，零浏览器依赖。

**Q: Cookie 会泄露吗？**
A: 只存在你本地 `.env`，代码不会上传到任何服务器。`.gitignore` 已排除。

**Q: 支持哪些 AI 客户端？**
A: 任意支持 MCP stdio 的客户端：Claude Desktop、Cursor、Cline、Continue、Cherry Studio、Zed 等。

**Q: 接口失效了怎么办？**
A: 跑 `npm run smoke` 体检，然后提 issue，我们一起维护。

---

## 🤝 贡献 / Contributing

急需：
- [ ] **演示 GIF / 截图**（最重要的贡献！）
- [ ] 更多 MCP 客户端配置示例
- [ ] 接口变动时提 issue

```bash
git clone https://github.com/itsyhx/tomato-writer-mcp.git
cd tomato-writer-mcp && npm install && npm run build && npm run smoke
```

---

## ⚠️ 免责声明 / Disclaimer

- 本项目**仅调用作者本人账号**的后台接口，用于自动化自己的创作工作流
- 请遵守平台规则，**勿用于刷量、批量注册等灰产场景**
- Cookie 等同账号密码，**切勿提交到仓库**（`.gitignore` 已排除 `.env`）
- 平台接口随时可能变更，发现失效欢迎提 issue
- 本项目与番茄小说官方无关，非官方 API / Not affiliated with Fanqie Novel official

---

## 🔎 关键词 / Keywords

`番茄小说` `番茄免费小说` `番茄小说作家后台` `番茄作家助手` `网文写作` `小说发布` `MCP` `Model Context Protocol` `MCP Server` `Claude MCP` `Cursor MCP` `AI 写作` `AI写小说` `网文作者工具` `fanqienovel` `fanqie novel` `tomato novel` `web novel` `Chinese web novel` `novel publishing automation` `AI agent`

---

## 📄 License

[MIT](LICENSE) © 2026 Harrison Yin

---

<div align="center">

**⭐ Star 一下，让更多网文作者看到这个项目**

<sub>Your star is the only payment open-source authors receive.</sub>

</div>
