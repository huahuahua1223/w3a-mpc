import { createWalletClient, createPublicClient, custom, formatEther, parseEther } from 'viem';
import { mainnet, polygonAmoy, sepolia } from 'viem/chains';
import type { IProvider } from "@web3auth/base";

/**
 * Viem RPC 类封装
 * 提供完整的区块链交互功能，包括账户、余额、交易、合约等操作
 */
export default class ViemRPC {
  private provider: IProvider;

  // 智能合约 ABI（示例合约：简单的存储合约）
  private contractABI = [
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "initMessage",
          "type": "string"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "message",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "newMessage",
          "type": "string"
        }
      ],
      "name": "update",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

  constructor(provider: IProvider) {
    this.provider = provider;
  }

  /**
   * 根据链 ID 获取对应的 Viem 链配置
   */
  getViewChain() {
    switch (this.provider.chainId) {
      case "1":
        return mainnet;
      case "0x13882":
        return polygonAmoy;
      case "0xaa36a7":
        return sepolia;
      default:
        return sepolia; // 默认使用 Sepolia
    }
  }

  /**
   * 获取链 ID
   */
  async getChainId(): Promise<string> {
    try {
      const walletClient = createWalletClient({
        transport: custom(this.provider)
      });

      const chainId = await walletClient.getChainId();
      return chainId.toString();
    } catch (error) {
      console.error("Error getting chain ID:", error);
      throw error;
    }
  }

  /**
   * 获取账户地址列表
   */
  async getAddresses(): Promise<string[]> {
    try {
      const walletClient = createWalletClient({
        chain: this.getViewChain(),
        transport: custom(this.provider)
      });

      return await walletClient.getAddresses();
    } catch (error) {
      console.error("Error getting addresses:", error);
      throw error;
    }
  }

  /**
   * 获取账户地址（返回第一个地址）
   */
  async getAccounts(): Promise<string[]> {
    try {
      const addresses = await this.getAddresses();
      return addresses;
    } catch (error) {
      console.error("Error getting accounts:", error);
      throw error;
    }
  }

  /**
   * 获取账户余额
   */
  async getBalance(): Promise<string> {
    try {
      const publicClient = createPublicClient({
        chain: this.getViewChain(),
        transport: custom(this.provider)
      });

      const addresses = await this.getAccounts();
      const balance = await publicClient.getBalance({ address: addresses[0] as `0x${string}` });
      
      return formatEther(balance);
    } catch (error) {
      console.error("Error getting balance:", error);
      throw error;
    }
  }

  /**
   * 发送交易
   */
  async sendTransaction(): Promise<any> {
    try {
      const publicClient = createPublicClient({
        chain: this.getViewChain(),
        transport: custom(this.provider)
      });

      const walletClient = createWalletClient({
        chain: this.getViewChain(),
        transport: custom(this.provider)
      });

      // 交易数据
      const destination = "0x40e1c367Eca34250cAF1bc8330E9EddfD403fC56"; // 示例目标地址
      const amount = parseEther("0.0001");
      const addresses = await this.getAccounts();

      // 提交交易到区块链
      const hash = await walletClient.sendTransaction({
        account: addresses[0] as `0x${string}`,
        to: destination as `0x${string}`,
        value: amount,
      });

      console.log("Transaction hash:", hash);

      // 等待交易确认
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      return this.toObject(receipt);
    } catch (error) {
      console.error("Error sending transaction:", error);
      throw error;
    }
  }

  /**
   * 签名消息
   */
  async signMessage(): Promise<string> {
    try {
      const walletClient = createWalletClient({
        chain: this.getViewChain(),
        transport: custom(this.provider)
      });

      // 签名数据
      const addresses = await this.getAccounts();
      const originalMessage = "Hello from Web3Auth MPC Wallet!";

      // 签名消息
      const hash = await walletClient.signMessage({
        account: addresses[0] as `0x${string}`,
        message: originalMessage
      });

      console.log("Signed message:", hash);
      return hash.toString();
    } catch (error) {
      console.error("Error signing message:", error);
      throw error;
    }
  }

  /**
   * 读取智能合约
   */
  async readContract(): Promise<any> {
    try {
      const publicClient = createPublicClient({
        chain: this.getViewChain(),
        transport: custom(this.provider)
      });

      // 合约地址（Sepolia 测试网示例合约）
      const contractAddress = "0x04cA407965D60C2B39d892a1DFB1d1d9C30d0334";

      const result = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: this.contractABI,
        functionName: 'message'
      });

      return this.toObject(result);
    } catch (error) {
      console.error("Error reading contract:", error);
      throw error;
    }
  }

  /**
   * 写入智能合约
   */
  async writeContract(): Promise<any> {
    try {
      const publicClient = createPublicClient({
        chain: this.getViewChain(),
        transport: custom(this.provider)
      });

      const walletClient = createWalletClient({
        chain: this.getViewChain(),
        transport: custom(this.provider)
      });

      // 合约数据
      const addresses = await this.getAccounts();
      const contractAddress = "0x04cA407965D60C2B39d892a1DFB1d1d9C30d0334";
      const randomNumber = Math.floor(Math.random() * 9000) + 1000;

      // 提交交易到区块链
      const hash = await walletClient.writeContract({
        account: addresses[0] as `0x${string}`,
        address: contractAddress as `0x${string}`,
        abi: this.contractABI,
        functionName: 'update',
        args: [`Web3Auth MPC is awesome ${randomNumber} times!`]
      });

      console.log("Contract write transaction hash:", hash);

      // 等待交易确认
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      return this.toObject(receipt);
    } catch (error) {
      console.error("Error writing contract:", error);
      throw error;
    }
  }

  /**
   * 将 BigInt 对象转换为可序列化的 JSON 对象
   */
  private toObject(data: any): any {
    // 无法序列化 BigInt，所以需要这个技巧
    return JSON.parse(JSON.stringify(data, (_key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));
  }
}

