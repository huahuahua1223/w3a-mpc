# Web3Auth MPC 钱包 Demo

这是一个基于 Web3Auth MPC CoreKit 的功能完整的钱包 Demo，支持邮箱/手机号无密码登录、完整的区块链操作（包括智能合约交互）以及多因素认证（MFA）。

## ✨ 核心特性

- 🔐 **无密码登录**: 通过 Supabase OTP 支持邮箱和手机号登录
- 🔑 **MPC 钱包**: 基于 Web3Auth MPC CoreKit 的非托管钱包
- ⛓️ **完整区块链功能**: 
  - 查询账户地址和余额
  - 发送交易
  - 签名消息
  - 智能合约交互（读取/写入）
- 🛡️ **多因素认证**: 支持设备因子、社交因子、助记词因子
- 🎨 **现代化 UI**: 基于 React + TypeScript + Vite

## 🏗️ 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **Web3 库**: Viem（类封装）
- **认证服务**: Supabase Auth (Email OTP + SMS OTP)
- **MPC SDK**: @web3auth/mpc-core-kit
- **区块链**: Ethereum Sepolia Testnet

## 📦 安装

```bash
# 安装依赖
pnpm install

# 或使用 npm
npm install
```

## ⚙️ 配置

### 1. 复制环境变量文件

```bash
# Windows PowerShell
Copy-Item env.example .env

# 或者手动复制 env.example 文件并重命名为 .env
```

### 2. 配置 Supabase

1. 访问 [Supabase Dashboard](https://app.supabase.com/)
2. 创建新项目
3. 获取 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY`
4. 配置 Email OTP:
   - 前往 `Authentication` -> `Email Templates`
   - 修改 "Confirm signup" 模板
   - 将 `{{ .ConfirmationURL }}` 改为 `{{ .Token }}`
5. 配置 SMS OTP (可选):
   - 前往 `Authentication` -> `Providers` -> `Phone`
   - 配置 SMS 提供商（推荐 Twilio）

### 3. 配置 Web3Auth

1. 访问 [Web3Auth Dashboard](https://dashboard.web3auth.io/)
2. 创建新项目
3. 获取 `WEB3AUTH_CLIENT_ID`
4. 创建 JWT Verifier:
   - Verifier Type: `JWT`
   - Verifier Name: `supabase-verifier`
   - JWKS Endpoint: `https://{your-project-ref}.supabase.co/.well-known/jwks.json`
   - JWT Field: `sub` (或 `email` / `phone`)

### 4. 更新 .env 文件

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_WEB3AUTH_CLIENT_ID=your_web3auth_client_id
VITE_VERIFIER_NAME=supabase-verifier
```

## 🚀 运行

```bash
# 开发模式
pnpm dev

# 或使用 npm
npm run dev
```

应用将在 http://localhost:5173 运行

## 📖 使用说明

### 登录流程

#### 邮箱登录
1. 输入邮箱地址
2. 点击"发送邮箱验证码"
3. 检查邮箱，获取 6 位验证码
4. 输入验证码并点击"验证并登录"

#### 手机号登录
1. 输入手机号（需包含国家代码，如 `+8613800138000`）
2. 点击"发送短信验证码"
3. 检查短信，获取 6 位验证码
4. 输入验证码并点击"验证并登录"

### 多因素认证（MFA）

首次登录后，建议启用 MFA 以增强安全性：

1. 点击"启用 MFA"按钮
2. 系统会生成一个备份因子密钥（助记词格式）
3. **务必保存此助记词**，用于账户恢复

### 区块链操作

登录后可以执行以下操作：

- **获取账户地址**: 显示您的钱包地址
- **获取余额**: 查询 ETH 余额
- **发送交易**: 发送测试交易（需要测试网 ETH）
- **签名消息**: 对消息进行数字签名
- **合约交互**: 读取和写入智能合约

### 获取测试币

在 Sepolia 测试网上操作需要测试币，可以从以下水龙头获取：

- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Alchemy Sepolia Faucet](https://www.alchemy.com/faucets/ethereum-sepolia)
- [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)

## 🏗️ 项目结构

```
w3a-mpc/
├── src/
│   ├── config/              # 配置文件
│   │   ├── supabase.ts      # Supabase 配置
│   │   └── chainConfig.ts   # 链配置
│   ├── rpc/                 # RPC 封装
│   │   └── viemRPC.ts       # Viem RPC 类
│   ├── App.tsx              # 主应用组件
│   ├── App.css              # 样式文件
│   ├── index.tsx            # 入口文件
│   └── index.css            # 全局样式
├── public/                  # 静态资源
├── .env.example             # 环境变量示例
├── package.json             # 依赖配置
├── tsconfig.json            # TypeScript 配置
├── vite.config.ts           # Vite 配置
└── README.md                # 项目文档
```

## 🔧 核心依赖

```json
{
  "@web3auth/mpc-core-kit": "3.4.3",
  "@web3auth/ethereum-mpc-provider": "9.7.0",
  "@supabase/supabase-js": "^2.39.0",
  "viem": "^2.21.18",
  "react": "^18.3.1"
}
```

## ⚠️ 注意事项

1. **环境变量**: 请勿将 `.env` 文件提交到版本控制系统
2. **测试网络**: 本项目默认使用 Sepolia 测试网，生产环境需修改链配置
3. **API 密钥**: Supabase Anon Key 可以暴露在前端，但建议配置 Row Level Security (RLS)
4. **助记词安全**: 务必妥善保管 MFA 生成的助记词，遗失将无法恢复账户
5. **SMS 配置**: SMS OTP 需要在 Supabase 中配置短信服务商（如 Twilio）

## 📚 参考文档

- [Web3Auth MPC Core Kit 文档](https://web3auth.io/docs/sdk/core-kit/mpc-core-kit/)
- [Supabase Auth 文档](https://supabase.com/docs/guides/auth)
- [Viem 文档](https://viem.sh/)
- [Web3Auth Dashboard](https://dashboard.web3auth.io/)
- [Supabase Dashboard](https://app.supabase.com/)

## 🐛 常见问题

### 1. 邮箱收到的是链接而不是验证码

**解决方案**: 在 Supabase Dashboard 的 Email Templates 中，将 `{{ .ConfirmationURL }}` 改为 `{{ .Token }}`

### 2. 短信验证码发送失败

**解决方案**: 
- 确保在 Supabase 中配置了 SMS 提供商（如 Twilio）
- 检查手机号格式是否正确（需包含国家代码，如 `+86`）

### 3. Web3Auth 登录失败

**解决方案**:
- 确认 Web3Auth Dashboard 中的 JWT Verifier 配置正确
- 检查 JWKS Endpoint 是否可访问
- 验证 `verifierId` 是否匹配（email / phone / user.id）

### 4. 交易失败

**解决方案**:
- 确认账户有足够的测试网 ETH
- 检查网络连接
- 查看浏览器控制台的详细错误信息

## 📝 License

MIT

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**重要提示**: 这是一个演示项目，不应直接用于生产环境。在生产环境使用前，请进行充分的安全审计和测试。

