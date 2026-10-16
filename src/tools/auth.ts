import type { McpTool } from "./types.js";

export const getLoginQrCode: McpTool = {
  definition: {
    name: "get_login_qrcode",
    description: "获取番茄作家后台官方实时扫码登录二维码数据源 (Base64 PNG) 与会话 Token",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  async run() {
    try {
      const res = await fetch("https://sso.toutiao.com/get_qrcode/?service_id=2503&aid=2503");
      const json: any = await res.json();
      if (json && json.data && json.data.qrcode) {
        return {
          status: "success",
          qrcode_base64: `data:image/png;base64,${json.data.qrcode}`,
          token: json.data.token,
          check_url: json.data.check_url,
          instructions: "请使用手机【番茄免费小说 APP】或【抖音 APP】扫描此二维码以完成作家后台授权。"
        };
      }
      return {
        status: "error",
        message: "未能从官方接口获取到二维码数据",
        raw: json
      };
    } catch (err: any) {
      return {
        status: "error",
        message: err.message || "请求官方二维码接口失败"
      };
    }
  },
};
