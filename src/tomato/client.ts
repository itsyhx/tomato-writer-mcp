/**
 * 番茄作家后台 HTTP 客户端。
 *
 * 鉴权 = Cookie + X-Secsdk-Csrf-Token（会话级固定）。实测读/写接口均不需要
 * 风控签名 a_bogus/msToken（那是前端风控 SDK 在网络层注入的，服务端对带
 * cookie + csrf 的作家接口不强制校验）。所有接口返回 {code, message, data}，
 * code===0 为成功。
 */

const BASE = "https://fanqienovel.com";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36";
// 所有作家接口都带的公共参数
const COMMON = { aid: "2503", app_name: "muye_novel" };

export interface TomatoAuth {
  cookie: string;
  csrfToken: string;
}

export type Params = Record<string, string | number | boolean>;

export class TomatoApiError extends Error {
  constructor(
    public readonly path: string,
    public readonly code: number,
    message: string,
  ) {
    super(message);
    this.name = "TomatoApiError";
  }
}

export class TomatoClient {
  constructor(private readonly auth: TomatoAuth) {}

  private headers(extra: Record<string, string> = {}): Record<string, string> {
    return {
      Cookie: this.auth.cookie,
      "User-Agent": UA,
      Accept: "application/json, text/plain, */*",
      Origin: BASE,
      Referer: `${BASE}/main/writer/`,
      "X-Secsdk-Csrf-Token": this.auth.csrfToken,
      ...extra,
    };
  }

  /** GET，参数走 query string。 */
  async get(path: string, params: Params = {}): Promise<any> {
    const qs = new URLSearchParams({ ...COMMON, ...flatten(params) }).toString();
    const res = await fetch(`${BASE}${path}?${qs}`, { headers: this.headers() });
    return this.parse(res, path);
  }

  /** POST，参数走 application/x-www-form-urlencoded。 */
  async post(path: string, params: Params = {}): Promise<any> {
    const body = new URLSearchParams({ ...COMMON, ...flatten(params) }).toString();
    const res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: this.headers({
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      }),
      body,
    });
    return this.parse(res, path);
  }

  private async parse(res: Response, path: string): Promise<any> {
    const text = await res.text();
    let j: any;
    try {
      j = JSON.parse(text);
    } catch {
      throw new TomatoApiError(
        path,
        res.status,
        `返回非 JSON（HTTP ${res.status}）：${text.slice(0, 120)}`,
      );
    }
    if (j.code !== 0) {
      const msg: string = j.message || j.msg || "未知错误";
      const hint =
        j.code === -2
          ? "（参数有误）"
          : /登录|登陆|csrf|权限|未授权|token/i.test(msg)
            ? "（鉴权可能失效，请更新 .env 里的 TOMATO_COOKIE / TOMATO_CSRF_TOKEN）"
            : "";
      throw new TomatoApiError(path, j.code, `${msg}${hint}`);
    }
    return j.data;
  }
}

function flatten(p: Params): Record<string, string> {
  const r: Record<string, string> = {};
  for (const k of Object.keys(p)) r[k] = String(p[k]);
  return r;
}
