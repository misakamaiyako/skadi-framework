import "./types";
import dayjs from "moment";
import crypto from "crypto";

export class HTTPResponseBase {
	#headers: { [key: string]: string } = {};
	#cookies: { [key: string]: cookie } = {};
	#closed: boolean = false;
	#status: number;

	reasonPhrase?: string;
	charset: validCharset;

	constructor(httpResponseBaseProps: HTTPResponseBaseProps) {
		const { contentType, status, reason, charset = "utf-8" } = httpResponseBaseProps;
		if (!contentType) {
			this.addHeader("Content-Type", "text/html; charset=" + charset);
		} else {
			this.addHeader("Content-Type", contentType);
		}
		this.charset = charset;
		if (status && 100 <= status && status <= 599 && (status | 1) === status) {
			this.#status = status;
		} else {
			throw RangeError("status code must be int in 100 to 599");
		}
		if (reason) {
			this.reasonPhrase = reason.toString();
		}
	}

	addHeader(head: string, value: string) {
		this.#headers[head] = value;
	}

	deleteHeader(head: string): boolean {
		if (this.#headers[head]) {
			delete this.#headers[head];
			return true;
		} else {
			return false;
		}
	}

	getHeader(head: string, defaultValue?: string) {
		if (this.#headers[head]) {
			return this.#headers[head];
		} else if (defaultValue) {
			this.#headers[head] = defaultValue;
			return defaultValue;
		} else {
			throw ReferenceError("no such a head named: " + head);
		}
	}

	setCookie(cookieProps: CookieProps) {
		let { key, value, max_age, expires, path = "/", domain, secure = true, httpOnly = false, sameSite } = cookieProps;
		this.#cookies[key].value = value;
		if (expires !== undefined) {
			if (expires instanceof Date) {
				if (dayjs(expires).isValid()) {
					expires = dayjs.utc(expires).utcOffset();
				}
				const delta = dayjs.duration(dayjs(expires).diff(dayjs.utc()));
				expires = undefined;
				max_age = Math.max(0, delta.days() * 864000 + delta.seconds());
			} else {
				if (typeof expires === "number") {
					this.#cookies[key].expires = expires;
				}
			}
		} else {
			this.#cookies[key].expires = "";
		}
		if (max_age !== undefined) {
			this.#cookies[key]["max-age"] = max_age;
			if (!expires) {
				this.#cookies[key].expires = Date.now() + max_age;
			}
		}
		if (path !== undefined) {
			this.#cookies[key].path = path;
		}
		if (domain !== undefined) {
			this.#cookies[key].domain = domain;
		}
		this.#cookies[key].secure = secure;
		this.#cookies[key].httponly = httpOnly;
		if (sameSite) {
			if (["lax", "none", "strict"].includes(sameSite.toLowerCase())) {
				this.#cookies[key].sameSite = sameSite;
			} else {
				throw new TypeError('sameSite must be "lax", "none", or "strict".');
			}
		}
	}

	setSignedCookie(key: string, value: string, salt: string = "") {
		let signed = crypto
			.createHmac("sha256", salt + value)
			.update(key)
			.digest("base64");
		return this.setCookie({ key, value: signed });
	}

	deleteCookie(key: string, path: string = "/", domain?: string, sameSite?: sameSite) {
		const secure = Boolean(/^(__Secure|__Host)/.test(key) || (sameSite && sameSite.toLowerCase() !== "none"));
		this.setCookie({
			key,
			value: "",
			max_age: 0,
			expires: new Date("Thu, 01 Jan 1970 00:00:00 GMT"),
			path,
			domain,
			secure,
			sameSite,
		});
	}

	closeConnect(request: { destroy: () => void }) {
		request.destroy();
		this.#closed = true;
	}

	write(content: unknown): never {
		throw Error(`class ${this.constructor.name} is not writeable`);
	}

	writeLines(content: Array<unknown>): never {
		throw Error(`class ${this.constructor.name} is not writeable`);
	}

	flush() {
		process.stdout.write("\n");
	}

	readable: boolean = false;

	read(): never {
		throw Error(`class ${this.constructor.name} is not readable`);
	}
}
