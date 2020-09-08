import Setting from "../config/Setting";
import App from "../app";
import { bridge } from "../app/App";

export class HTTPResponse {
	statusCode: number = 200;
	#headers: {};
	#resourceClosers: any[];
	#handleClass: null | Function;
	private cookie: { [key: string]: string };
	private closed: boolean;
	#reasonPhrase: string | undefined;
	#charset: string;
	private ContentType: string;
	constructor(contentType: string | null = null, status: number = 200, reason: string = "", charset: string = "utf-8") {
		this.#headers = {};
		this.#resourceClosers = [];
		this.#handleClass = null;
		this.cookie = {};
		this.closed = false;
		if (status) {
			if (typeof status === "number") {
				if (100 < -status && status <= 599) {
					throw new RangeError("HTTP status code must be an integer from 100 to 599.");
				}
				this.statusCode = status;
			} else {
				throw new TypeError("HTTP status code must be an integer.");
			}
		}
		this.#reasonPhrase = reason;
		this.#charset = charset;
		if (!contentType) {
			this.ContentType = "text/html; charset=" + charset;
		} else {
			this.ContentType = contentType;
		}
	}
	get reasonPhrase() {
		if (this.#reasonPhrase) {
			return this.#reasonPhrase;
		} else {
			return;
		}
	}
	set reasonPhrase(value) {
		this.#reasonPhrase = value;
	}
	get charset() {
		if (this.#charset) {
			return this.#charset;
		}
		const contentType = this.ContentType;
		const matched = contentType.search(/;\s*charset=(?<charset>[^\s;]+)/);
		if (matched > -1) {
			return RegExp.$1;
		} else {
			if (bridge instanceof App) {
				return bridge.appConfig.charset;
			} else {
				return "UTF-8";
			}
		}
	}
	set charset(value) {
		this.#charset = value;
	}
}
class HttpResponseNotAllowed extends HTTPResponse {
	statusCode = 405;
	constructor() {
		super();
	}
}
