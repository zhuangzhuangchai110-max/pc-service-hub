---
name: PC-ServiceHub 0-1
overview: 从 0 到 1 交付 PC-Service Hub：用户端 4 步预约表单 + 管理端 /admin 订单看板，满足 PRD/UI/技术架构文档约束，并在关键节点回看对应文档段落校准。
todos:
  - id: scope-and-route
    content: 确认存储路线（localStorage 先行或直接 SQLite+Prisma），并锁定订单号规则与地址必填规则。
    status: completed
  - id: init-next-tailwind-shadcn
    content: 初始化 Next.js(App Router)+Tailwind+Shadcn UI+Lucide，并建立全局视觉基线（主色/圆角/字体）。
    status: in_progress
  - id: build-multistep-form
    content: 实现用户端 4 步预约表单：服务选择/设备信息/服务方式+校验/日期+时段，提交成功页与防重复提交。
    status: pending
  - id: persistence-layer
    content: 实现订单持久化（按选定路线：localStorage 或 Prisma+SQLite dev.db），并提供读取列表与更新状态能力。
    status: pending
  - id: admin-dashboard
    content: 实现 /admin：门禁（环境变量密码）、订单表格、状态切换、搜索/筛选与状态 Badge。
    status: pending
  - id: ux-polish-and-checklist
    content: 移动端适配、交互反馈、错误提示与手工测试用例验证（创建订单/刷新仍在/后台改状态）。
    status: pending
isProject: false
---

# PC-Service Hub 从0到1开发计划

## 目标与验收（MVP）

- **用户端**：`/` 完成 4 步预约表单（服务选择→设备信息→服务方式/电话/地址→日期/时段），提交成功后提示线下结算。
- **管理端**：`/admin` 订单列表（表格）+ 状态更新（待处理/已完成/取消）+ 基础检索。
- **数据**：订单可持久化（先本地演示，后续可升级到本地 SQLite+Prisma）。

**回看文档**

- 产品范围/步骤与字段：`c:\Users\chai2\workbench\PRDs\PRD.md`（“2. 核心功能规范”“4. 数据库字段定义”）
- 视觉与组件：`c:\Users\chai2\workbench\PRDs\UI.md`（“视觉风格/色彩系统/核心页面草图/必备组件”）
- 本地化架构与 Prisma：`c:\Users\chai2\workbench\PRDs\development.md`（“核心技术栈选型/本地部署架构/Prisma Schema/关键组件调用指令”）

## 里程碑与步骤（含关键节点回看提示）

### Milestone A：项目初始化与基础骨架

- **A1 初始化 Next.js + Tailwind**（App Router 结构、基础页面路由 `/` 与 `/admin` 占位）
- **A2 引入 UI 体系**：按 Shadcn UI 方式生成基础组件（Button/Card/Input/Select/Calendar/Table/Badge），并建立全局样式与主题基线（圆角、主色、文字色）。
- **A3 定义领域模型**：建立 `Order` 类型（前端用）与订单状态枚举。

**关键节点回看**

- `UI.md`：色彩/圆角/字体/页面草图，确保整体是“极简企业风”。
- `PRD.md`：确认 4 步字段必填/选填与时段建议。

### Milestone B：用户端多步骤预约表单（核心转化链路）

- **B1 Stepper/进度条框架**：4 步导航、下一步/上一步、按钮 loading、防重复提交。
- **B2 Step 1 服务选择**：卡片式单选高亮，服务项与图标映射（Lucide）。
- **B3 Step 2 设备信息**：设备类型下拉 + 品牌型号必填 + 问题描述选填。
- **B4 Step 3 服务方式**：上门/到店单选；手机号 11 位校验；地址按服务方式要求（上门必填、到店可弱化或可选，按最终对齐决定）。
- **B5 Step 4 时间预约**：日期选择禁用历史日期；时段选择（09-12/13-18/19-22）。
- **B6 提交与成功页**：生成订单号（`PC-YYYYMMDD-随机数`）或使用 cuid；落库/落存储；展示“工程师联系、线下结算”提示。

**关键节点回看**

- `PRD.md`：Step 1-4 的交互要求（卡片高亮、手机号校验、禁用历史日期、推荐时段、线下支付文案）。
- `UI.md`：用户端草图布局与移动端单列适配要求。
- `development.md`：组件选型（Calendar、Zod、Framer Motion）与“避免手搓”原则。

### Milestone C：数据持久化（先演示可用，再升级稳定）

提供两条路线，需你最终拍板：

- **路线 C1（更快）**：先用 `localStorage` 存订单，/admin 直接读取；后续再迁移到 Prisma。
- **路线 C2（更稳）**：从一开始就上 **SQLite + Prisma**，表单提交走 Server Action/Route Handler 写入 `dev.db`。

**关键节点回看**

- `PRD.md`：允许前期 localStorage/JSON file，后期可对接数据库。
- `development.md`：本地化架构、`dev.db` 位置与 Prisma Schema 示例。

### Milestone D：管理端 /admin（订单看板）

- **D1 访问保护**：按文档建议做“环境变量密码”简单门禁（无复杂账号体系）。
- **D2 订单表格**：展示订单号、服务、预约时间、状态等；状态用 Badge。
- **D3 状态切换**：行内按钮切换 pending/completed/cancelled；乐观更新 + 错误提示。
- **D4 检索/筛选**：至少支持手机号搜索；可选支持按状态过滤（全部/待处理/完成）。

**关键节点回看**

- `PRD.md`：管理端功能点与状态按钮要求。
- `UI.md`：管理端草图（统计、搜索框、表格列）与状态色规范。
- `development.md`：建议使用 Shadcn Table/DataTable、Prisma Action 更新状态。

### Milestone E：体验打磨与质量门槛

- **E1 表单体验**：移动端适配、输入聚焦态、错误提示文案、loading/禁用态。
- **E2 数据一致性**：订单字段完整性校验；时间/手机号格式；防重复提交。
- **E3 基本测试**：手工测试用例覆盖主路径（创建订单、刷新仍存在、后台可改状态）。

**关键节点回看**

- `UI.md`：交互反馈（聚焦蓝色外边框、按钮反馈、移动端卡片单列）。
- `PRD.md`：用户路径与提交成功文案（线下结算）。

## 风险与对齐点（计划内预留）

- **存储路线选择**：C1 快速演示 vs C2 一步到位（影响提交接口、/admin 读写方式、后续迁移成本）。
- **订单号规则**：PRD 建议 `PC-YYYYMMDD-随机数`，development 示例 Prisma 用 cuid；需要统一。
- **上门/到店与地址必填规则**：PRD 中 Step3 同时列了地址/电话；若到店是否仍需地址需要明确。

## 产出物清单

- 页面：`/`、提交成功页（可 `/success` 或内联） 、`/admin`
- 组件：Stepper、服务卡片、日期选择、时段选择、订单表格
- 数据：`Order` 类型/Schema；本地存储实现（localStorage 或 SQLite+Prisma）

