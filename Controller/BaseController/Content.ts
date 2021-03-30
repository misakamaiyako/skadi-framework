import { Skadi } from "../../types";
import App from "../../app";
import { IncomingMessage, ServerResponse } from "http";
import bodyParser from "body-parser";
import qs from "qs";
import ContentInterface = Skadi.ContentInterface;
import cookie = Skadi.cookie;

export class Content implements ContentInterface {
	app: App;
	baseUrl: string;
	body: { [p: string]: any } | BinaryType = {};
	cookies: { [p: string]: cookie } = {};
	fresh: Boolean = true;
	hostname: string;
	ip: string;
	ips: Array<string>;
	method: Skadi.SafeRequest | Skadi.NotSafeRequest;
	originalUrl: string;
	params: { [p: string]: string };
	path: string;
	protocol: "HTTP" | "HTTPS"; //todo: | "FTP" | "FTPS";
	query: { [p: string]: string | Array<string> };
	secure: boolean;
	signedCookies: { [p: string]: string };
	stale: boolean;
	subdomains: Array<string>;
	xhr: boolean;

	accept(...type: string[]): string | false {
		return false;
	}

	acceptsCharsets(...charset: string[]): string | false {
		return undefined;
	}

	acceptsLanguages(...languages: string[]): string | false {
		return undefined;
	}

	get(field: string): string | undefined {
		return undefined;
	}

	is(type: string): boolean {
		return false;
	}
	constructor(app: App, req: IncomingMessage, res: ServerResponse) {
		this.app = app;
		const appConfig = app.appConfig;
		this.baseUrl = appConfig.baseURL;
		///{
		//   "host": "127.0.0.1",
		//   "connection": "keep-alive",
		//   "accept": "application/json, text/plain, */*",
		//   "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36",
		//   "dnt": "1",
		//   "sec-fetch-site": "same-origin",
		//   "sec-fetch-mode": "cors",
		//   "sec-fetch-dest": "empty",
		//   "referer": "http://127.0.0.1/",
		//   "accept-encoding": "gzip, deflate, br",
		//   "accept-language": "zh-CN,zh;q=0.9,en;q=0.8"
		// }
		this.hostname = req.headers.host || "";
		this.ip = req.connection.remoteAddress || "";
		bodyParser.json({ type: ["application/json"] })(req, res, () => {
			console.log(qs.parse(req.url || ""));
			res.statusCode = 200;
			// @ts-ignore
			this.body = res.body;
			res.end();
		});
	}
}
