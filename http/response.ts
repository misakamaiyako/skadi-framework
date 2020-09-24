import * as path from "path";

const moment = require("moment");
const iri = require("iri");
import crypto from "crypto";
import App from "../app";
import { bridge } from "../app/App";
import * as fs from "fs";
import mime from "mime-types";

type cookie = {
	value: string;
	expires: number | "";
	"max-age": number;
	path: string | null;
	domain: null | string;
	secure: boolean;
	httponly: boolean;
	sameSite: sameSite;
};
type sameSite = "lax" | "none" | "strict" | null;
type validCharset =
	| "utf-8"
	| "ascii"
	| "utf8"
	| "utf16le"
	| "ucs2"
	| "ucs-2"
	| "base64"
	| "latin1"
	| "binary"
	| "hex"
	| undefined;
type fileLike = {
	name?: string;
	getBuffer?: () => Buffer;
};
type json = {
	[key in string | number]: any;
};
export class HTTPResponseBase {
	statusCode: number = 200;
	#headers: { [key: string]: string[] };
	resourceClosers: any[];
	#handleClass: null | Function;
	#cookie: { [key: string]: cookie };
	private closed: boolean;
	#reasonPhrase: string | undefined;
	#charset: validCharset;
	constructor(
		contentType: string | null = null,
		status: number = 200,
		reason: string = "",
		charset: validCharset = "utf-8"
	) {
		this.#headers = {};
		this.resourceClosers = [];
		this.#handleClass = null;
		this.#cookie = {};
		this.closed = false;
		if (status) {
			if (Number.isInteger(status)) {
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
			this.addHeader("Content-Type", "text/html; charset=" + charset);
		} else {
			this.addHeader("Content-Type", contentType);
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
	get charset(): validCharset {
		if (this.#charset) {
			return this.#charset;
		}
		const contentType: string = this.getHeader("ContentType");
		const matched = contentType.search(/;\s*charset=(?<charset>[^\s;]+)/);
		if (matched > -1) {
			return <
				"utf-8" | "ascii" | "utf8" | "utf16le" | "ucs2" | "ucs-2" | "base64" | "latin1" | "binary" | "hex" | undefined
			>RegExp.$1;
		} else {
			if (bridge instanceof App) {
				return <
					"utf-8" | "ascii" | "utf8" | "utf16le" | "ucs2" | "ucs-2" | "base64" | "latin1" | "binary" | "hex" | undefined
				>bridge.appConfig.charset;
			} else {
				return "utf-8";
			}
		}
	}
	set charset(value) {
		this.#charset = value;
	}
	serializeHeaders(): Buffer {
		const toBuffer = (value: any, encoding: BufferEncoding) => {
			if (value instanceof Buffer) {
				return value;
			} else {
				return Buffer.from(value, encoding);
			}
		};
		let headers: Buffer[] = [];
		for (let header in Object.values(this.#headers)) {
			const [key, value] = header;
			headers.push(Buffer.concat([toBuffer(key, "ascii"), Buffer.from(":"), toBuffer(value, "latin1")]));
		}
		return Buffer.from(headers.join("\r\n"));
	}
	get contentTypeForRep() {
		if (this.getHeader("Content-Type")) {
			return `,"${this.getHeader("Content-Type")}"`;
		} else {
			return "";
		}
	}
	convertToCharset(value: any, charset: any, mimeEncode: boolean = false): string {
		if (!(value instanceof Buffer) && !(typeof value !== "string")) {
			value = value.toString();
		}
		if (
			(value instanceof Buffer && (value.includes(Buffer.from("\n")) || value.includes(Buffer.from("r")))) ||
			(typeof value === "string" && value.search(/[\n\r]/))
		) {
			throw new Error("Header values can't contain newline");
		}
		try {
			if (typeof value === "string") {
				value = Buffer.from(value, charset).toString(charset);
			} else {
				value = value.toString(charset);
			}
		} catch (e) {
			if (mimeEncode) {
				// handle
			} else {
				throw new TypeError("HTTP response must be in " + charset);
			}
		}
		return value;
	}
	addHeader(header: string | Buffer, value: string | Buffer) {
		header = this.convertToCharset(header, "ascii");
		value = this.convertToCharset(value, "latin-1", true);
		this.#headers[header.toLowerCase()] = [header, value];
	}
	deleteHeader(header: string) {
		try {
			delete this.#headers[header];
		} catch (e) {
			console.error(e);
			throw new ReferenceError("no such a header named" + header);
		}
	}
	getHeader = <T>(header: string, defaultValue?: T): string | T => {
		try {
			return this.#headers[header.toString()][1];
		} catch (e) {
			if (defaultValue) {
				return defaultValue;
			} else {
				console.error(e);
				throw new ReferenceError("no such a header named" + header);
			}
		}
	};
	items(): string[][] {
		return Object.entries(this.#headers).map((t) => t[1]);
	}
	get(header: string, alternate: string | null = null) {
		const value = this.#headers[header];
		if (value) {
			return value[1];
		} else {
			return alternate;
		}
	}
	setCookie(
		key: string,
		value: string,
		max_age: number | null = null,
		expires: unknown = null,
		path: string = "/",
		domain: string | null = null,
		secure: boolean = false,
		httpOnly: boolean = false,
		sameSite: sameSite = null
	) {
		this.#cookie[key].value = value;
		if (expires !== null) {
			if (expires instanceof Date) {
				if (moment(expires).isValid()) {
					expires = moment.utc(expires);
				}
				const delta = moment.duration(moment(expires).diff(moment.utc()));
				expires = null;
				max_age = Math.max(0, delta.days() * 864000 + delta.seconds());
			} else {
				if (typeof expires === "number") {
					this.#cookie[key].expires = expires;
				}
			}
		} else {
			this.#cookie[key].expires = "";
		}
		if (max_age !== null) {
			this.#cookie[key]["max-age"] = max_age;
			if (!expires) {
				this.#cookie[key].expires = Date.now() + max_age;
			}
		}
		if (path !== null) {
			this.#cookie[key].path = path;
		}
		if (domain !== null) {
			this.#cookie[key].domain = domain;
		}
		this.#cookie[key].secure = secure;
		this.#cookie[key].httponly = httpOnly;
		if (sameSite) {
			if (["lax", "none", "strict"].includes(sameSite.toLowerCase())) {
				this.#cookie[key].sameSite = sameSite;
			} else {
				throw new TypeError('sameSite must be "lax", "none", or "strict".');
			}
		}
	}
	setDefault(key: string, value: string | Buffer) {
		if (!this.#headers[key]) {
			this.addHeader(key, value);
		}
	}
	setSignedCookie(key: string, value: string, salt: string = "") {
		let signed = crypto
			.createHmac("sha256", salt + value)
			.update(key)
			.digest("base64");
		return this.setCookie(key, signed);
	}
	deleteCookie(key: string, path: string = "/", domain: null | string = null, sameSite: sameSite = null) {
		const secure = Boolean(/^(__Secure|__Host)/.test(key) || (sameSite && sameSite.toLocaleLowerCase() === "none"));
		this.setCookie(key, "", 0, "Thu, 01 Jan 1970 00:00:00 GMT", path, domain, secure, false, sameSite);
	}
	makeByte(value: unknown): Buffer {
		if (value instanceof Buffer) {
			return Buffer.from(value);
		}
		if (typeof value === "string") {
			return Buffer.from(value, this.charset);
		}
		// @ts-ignore
		return Buffer.from(value.toString(), this.charset);
	}
	close() {
		// this.
	}
	write(content: unknown) {
		throw new Error("This " + this.constructor.name + " instance instance is not writable");
	}
	flush() {}
	tell() {
		throw new Error("This " + this.constructor.name + " instance cannot tell its position");
	}
	readable(): boolean {
		return false;
	}
	seekable(): boolean {
		return false;
	}
	writable(): boolean {
		return false;
	}
	writelines(lines: unknown[]) {
		throw new Error("This " + this.constructor.name + " instance is not writable");
	}
}
export class HttpResponse extends HTTPResponseBase {
	streaming: boolean = false;
	container: Buffer[] = [];

	constructor(
		content: Buffer = Buffer.from(""),
		contentType: string | null = null,
		status: number = 200,
		reason: string = "",
		charset: validCharset = "utf-8"
	) {
		super(contentType, status, reason, charset);
		this.content = content;
	}
	serialize(): Buffer {
		return Buffer.concat([this.serializeHeaders(), Buffer.from("\r\n\r\n"), this.content]);
	}
	get content() {
		return Buffer.concat(this.container);
	}
	set content(value: any) {
		let content = Buffer.from("");
		if (value[Symbol.iterator] || (typeof value !== "string" && !(value instanceof Buffer))) {
			for (let i in value) {
				content = Buffer.concat([content, Buffer.from(value)]);
			}
			if (value.close) {
				try {
					value.close();
				} catch (e) {
					///
				}
			}
		} else {
			content = this.makeByte(value);
		}
		this.container = [content];
	}
	*[Symbol.iterator]() {
		yield this.container;
	}
	write(content: unknown) {
		this.container.push(this.makeByte(content));
	}
	tell() {
		return this.content.length;
	}
	getValue() {
		return this.content;
	}
	writable(): boolean {
		return true;
	}
	writelines(lines: unknown[]) {
		for (let line in lines) {
			this.write(lines);
		}
	}
}
export class StreamingHttpResponse extends HTTPResponseBase {
	streaming: boolean = true;
	// @ts-ignore
	#iterator: () => Iterator<any>;
	// private streamingContent: () => void;
	constructor(
		streamingContent: Iterable<any> = [],
		contentType: string | null = null,
		status: number = 200,
		reason: string = "",
		charset: validCharset = "utf-8"
	) {
		super(contentType, status, reason, charset);
		this.streamingContent = streamingContent;
	}
	get content() {
		throw new Error(
			`This ${this.constructor.name} instance has no 'content' attribute. Use 'streamingContent' instead.`
		);
	}
	get streamingContent(): Iterable<Buffer> {
		let i = this.#iterator();
		let chunk: Buffer[] = [];
		while (i.next) {
			// @ts-ignore
			chunk.push(i.next());
		}
		return chunk;
	}
	set streamingContent(value: Iterable<Buffer>) {
		this.setStreamingContent(value);
	}
	setStreamingContent(value: Iterable<Buffer> | JSON) {
		if (typeof value === "object" && !Array.isArray(value)) {
			this.#iterator = Object.values(value)[Symbol.iterator];
		} else {
			this.#iterator = value[Symbol.iterator];
		}
		if (value.hasOwnProperty("close")) {
			// @ts-ignore
			this.resourceClosers.push(value.close);
		}
	}
	*[Symbol.iterator]() {
		yield this.streamingContent;
	}
	getValue() {
		// @ts-ignore
		return Buffer.concat(this.streamingContent);
	}
}
export class FileResponse extends StreamingHttpResponse {
	blockSize: number = 4096;
	asAttachment: boolean;
	filename: string;
	private fileToStream: Iterable<Buffer> | JSON | null = null;

	constructor(
		asAttachment: boolean = false,
		filename: string = "",
		streamingContent: Iterable<any> = [],
		contentType: string | null = null,
		status: number = 200,
		reason: string = "",
		charset: validCharset = "utf-8"
	) {
		super(streamingContent, contentType, status, reason, charset);
		this.asAttachment = asAttachment;
		this.filename = filename;
	}
	setStreamingContent(value: Iterable<Buffer> | JSON) {
		if (!value.hasOwnProperty("read")) {
			this.fileToStream = null;
			return super.setStreamingContent(value);
		}
		let fileLike: fileLike;
		// @ts-ignore
		this.fileToStream = fileLike = value;
		if (value.hasOwnProperty("close")) {
			// @ts-ignore
			this.resourceClosers.push(value.close);
		}
		// @ts-ignore
		let iter = fileLike.read(this.blockSize);
		this.setHeaders(fileLike);
		super.setStreamingContent(value);
	}
	setHeaders(fileLike: fileLike) {
		const encodingMap = {
			bzip2: "application/x-bzip",
			gzip: "application/gzip",
			xz: "application/x-xz",
		};
		let fileName = fileLike.name;
		if (!(typeof fileName === "string" && fileName)) {
			fileName = this.filename;
		}
		if (path.isAbsolute(fileName)) {
			fs.stat(fileName, (err, stats) => {
				if (err) {
					console.error(err);
				} else {
					this.addHeader("Content-Length", stats.size.toString());
				}
			});
		} else {
			if (fileLike.getBuffer) {
				this.addHeader("Content-Length", fileLike.getBuffer().length.toString());
			}
		}
		if (this.getHeader("Content-Type", "").startsWith("text/html")) {
			if (fileName) {
				const contentType = mime.contentType(fileName);
				if (contentType) {
					this.addHeader("contentType", contentType);
				} else {
					this.addHeader("contentType", "application/octet-stream");
				}
			} else {
				this.addHeader("contentType", "application/octet-stream");
			}
		}
		fileName = this.filename ?? path.basename(fileName);
		if (fileName) {
			let disposition = this.asAttachment ? "attachment" : "inline";
			let fileExpr: string;
			if (encodeURI(fileName) === fileName) {
				fileExpr = "filename=" + fileName;
			} else {
				fileExpr = "filename*=utf-8 " + encodeURI(fileName);
			}
			this.addHeader("Content-Disposition", disposition + ";" + fileExpr);
		} else if (this.asAttachment) {
			this.addHeader("Content-Disposition", "attachment");
		}
	}
}
export class HttpResponseRedirectBase extends HTTPResponseBase {
	allowSchemes = ["http", "https", "ftp"];
	private location: string;

	constructor(
		redirectTo: unknown,
		contentType: string | null = null,
		status: number = 200,
		reason: string = "",
		charset: validCharset = "utf-8"
	) {
		super(contentType, status, reason, charset);
		const IRI = new iri.IrI(redirectTo);
		this.location = IRI.toURIString();
		if (IRI.scheme && !this.allowSchemes.includes(IRI.scheme)) {
			throw new TypeError("Unsafe redirect to URL with protocol " + IRI.scheme);
		}
	}
	get url() {
		return this.getHeader("Location");
	}
}
export class HttpResponseRedirect extends HttpResponseRedirectBase {
	statusCode = 302;
}
export class HttpResponsePermanentRedirect extends HttpResponseRedirectBase {
	statusCode = 301;
}
export class HttpResponseNotModified extends HttpResponse {
	statusCode = 304;
	constructor(
		content: Buffer = Buffer.from(""),
		contentType: string | null = null,
		status: number = 200,
		reason: string = "",
		charset: validCharset = "utf-8"
	) {
		super(content, contentType, status, reason, charset);
		this.deleteHeader("content-type");
	}

	set content(value: string | any[] | Buffer | Uint8Array) {
		if (value) {
			throw ReferenceError("You cannot set content to a 304 (Not Modified) response");
		}
		super.container = [];
	}
}
export class HttpResponseBadRequest extends HttpResponse {
	statusCode = 400;
}
export class HttpResponseForbidden extends HttpResponse {
	statusCode = 403;
}
export class HttpResponseNotFound extends HttpResponse {
	statusCode = 404;
}
export class HttpResponseNotAllowed extends HTTPResponseBase {
	statusCode = 405;
	constructor(
		permittedMethods: string[],
		contentType: string | null = null,
		status: number = 200,
		reason: string = "",
		charset: validCharset = "utf-8"
	) {
		super(contentType, status, reason, charset);
		this.addHeader("Allow", permittedMethods.join());
	}
}
export class HttpResponseGone extends HttpResponse {
	statusCode = 410;
}
export class Http404 extends HttpResponse {
	statusCode = 404;
}
export class HttpResponseServerError extends HttpResponse {
	statusCode = 500;
}
export class JsonResponse extends HttpResponse {
	constructor(
		data: json,
		content: Buffer,
		contentType: string | null,
		status: number = 200,
		reason: string = "",
		charset: validCharset = "utf-8"
	) {
		contentType = "application/json";
		content = Buffer.from(data);
		super(content, contentType, status, reason, charset);
	}
}
