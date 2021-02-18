import * as path from "path";

const moment = require("moment");
const iri = require("iri");
import crypto from "crypto";
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

interface ResponseBaseProps {
	contentType?: string;
	status?: number;
	reason?: string;
	charset?: validCharset;
}

interface CookieProps {
	key: string;
	value: string;
	max_age?: number;
	expires?: unknown;
	path?: string;
	domain?: string;
	secure?: boolean;
	httpOnly?: boolean;
	sameSite?: sameSite;
}

export class HTTPResponseBase {
	statusCode: number = 200;
	#headers: { [ key: string ]: string };
	resourceClosers: any[];
	#handleClass: null | Function;
	#cookie: { [ key: string ]: cookie };
	private closed: boolean;
	#reasonPhrase: string | undefined;
	#charset: validCharset;

	constructor (baseProps: ResponseBaseProps) {
		const { status, contentType, reason = "", charset = "utf-8" } = baseProps;
		this.#headers = {};
		this.resourceClosers = [];
		this.#handleClass = null;
		this.#cookie = {};
		this.closed = false;
		if (status) {
			if (Number.isInteger(status)) {
				if (99 < -status && status < 600) {
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

	get reasonPhrase () {
		if (this.#reasonPhrase) {
			return this.#reasonPhrase;
		} else {
			return;
		}
	}

	set reasonPhrase (value) {
		this.#reasonPhrase = value;
	}

	get charset (): validCharset {
		if (this.#charset) {
			return this.#charset;
		}
		const contentType = this.getHeader("ContentType");
		if (typeof contentType === "string") {
			const matched = contentType.search(/;\s*charset=(?<charset>[^\s;]+)/);
			if (matched > -1) {
				// @ts-ignore
				return RegExp.$1;
			} else {
				return bridge.appConfig.charset;
			}
		} else {
			return bridge.appConfig.charset;
		}
	}

	set charset (value) {
		this.#charset = value;
	}

	serializeHeaders (): Buffer {
		const toBuffer = (value: any, encoding: BufferEncoding) => {
			if (value instanceof Buffer) {
				return value;
			} else {
				return Buffer.from(value, encoding);
			}
		};
		let headers: Buffer[] = [];
		for (let header in Object.values(this.#headers)) {
			const [ key, value ] = header;
			headers.push(Buffer.concat([ toBuffer(key, "ascii"), Buffer.from(":"), toBuffer(value, "latin1") ]));
		}
		return Buffer.from(headers.join("\r\n"));
	}

	get contentTypeForRep () {
		if (this.getHeader("Content-Type")) {
			return `,"${ this.getHeader("Content-Type") }"`;
		} else {
			return "";
		}
	}

	convertToCharset (value: any, charset: any, mimeEncode: boolean = false): string {
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

	addHeader (header: string, value: string) {
		// header = this.convertToCharset(header, "ascii");
		// value = this.convertToCharset(value, "latin-1", true);
		this.#headers[ header.toLowerCase() ] = value;
	}

	deleteHeader (header: string) {
		try {
			delete this.#headers[ header.toLowerCase() ];
		} catch (e) {
			console.error(e);
			throw new ReferenceError("no such a header named" + header);
		}
	}

	getHeader = <T> (header: string, defaultValue?: T): string | T => {
		const value = this.#headers[ header.toLowerCase() ];
		if (value !== undefined) {
			return value[ 1 ];
		} else {
			if (defaultValue) {
				return defaultValue;
			} else {
				throw new ReferenceError("no such a header named" + header);
			}
		}
	};

	items (): string[][] {
		return Object.entries(this.#headers);
	}

	get (header: string, alternate: string | null = null) {
		const value = this.#headers[ header ];
		if (value) {
			return value;
		} else {
			return alternate;
		}
	}

	setCookie (cookieProps: CookieProps) {
		let { key, value, max_age, expires, path = "/", domain, secure = true, httpOnly = false, sameSite } = cookieProps;
		this.#cookie[ key ].value = value;
		if (expires !== undefined) {
			if (expires instanceof Date) {
				if (moment(expires).isValid()) {
					expires = moment.utc(expires);
				}
				const delta = moment.duration(moment(expires).diff(moment.utc()));
				expires = undefined;
				max_age = Math.max(0, delta.days() * 864000 + delta.seconds());
			} else {
				if (typeof expires === "number") {
					this.#cookie[ key ].expires = expires;
				}
			}
		} else {
			this.#cookie[ key ].expires = "";
		}
		if (max_age !== undefined) {
			this.#cookie[ key ][ "max-age" ] = max_age;
			if (!expires) {
				this.#cookie[ key ].expires = Date.now() + max_age;
			}
		}
		if (path !== undefined) {
			this.#cookie[ key ].path = path;
		}
		if (domain !== undefined) {
			this.#cookie[ key ].domain = domain;
		}
		this.#cookie[ key ].secure = secure;
		this.#cookie[ key ].httponly = httpOnly;
		if (sameSite) {
			if ([ "lax", "none", "strict" ].includes(sameSite.toLowerCase())) {
				this.#cookie[ key ].sameSite = sameSite;
			} else {
				throw new TypeError("sameSite must be \"lax\", \"none\", or \"strict\".");
			}
		}
	}

	setDefault (key: string, value: string) {
		if (!this.#headers[ key ]) {
			this.addHeader(key, value);
		}
	}

	setSignedCookie (key: string, value: string, salt: string = "") {
		let signed = crypto
			.createHmac("sha256", salt + value)
			.update(key)
			.digest("base64");
		return this.setCookie({ key, value: signed });
	}

	deleteCookie (key: string, path: string = "/", domain?: string, sameSite?: sameSite) {
		const secure = Boolean(/^(__Secure|__Host)/.test(key) || (sameSite && sameSite.toLowerCase() !== "none"));
		this.setCookie({ key, value: "", max_age: 0, expires: "Thu, 01 Jan 1970 00:00:00 GMT", path, domain, secure, sameSite });
	}

	makeByte (value: any): Buffer {
		if (value instanceof Buffer) {
			return Buffer.from(value);
		}
		if (typeof value === "string") {
			return Buffer.from(value, this.charset);
		}
		return Buffer.from(value.toString(), this.charset);
	}

	close () {
		const net = require("net");
		net.close();
	}

	write (content: unknown) {
		throw new Error("This " + this.constructor.name + " instance is not writable");
	}

	flush () {
		process.stdout.write("\n");
	}

	tell () {
		throw new Error("This " + this.constructor.name + " instance cannot tell its position");
	}

	readable: boolean = false;

	seekable: boolean = false;

	writable: boolean = false;

	writelines (lines: unknown[]) {
		throw new Error("This " + this.constructor.name + " instance is not writable");
	}
}

interface ResponseProps {
	content?: Buffer,
	contentType?: string,
	status?: number,
	reason?: string,
	charset?: validCharset,
}

export class HttpResponse extends HTTPResponseBase {
	streaming: boolean = false;
	container: Buffer[] = [];

	constructor (responseProps: ResponseProps) {
		super(responseProps);
		this.content = responseProps.content ?? Buffer.from("");
	}

	serialize (): Buffer {
		return Buffer.concat([ this.serializeHeaders(), Buffer.from("\r\n\r\n"), this.content ]);
	}

	get content () {
		return Buffer.concat(this.container);
	}

	set content (value: any) {
		let content = Buffer.from("");
		if (value[ Symbol.iterator ] || (typeof value !== "string" && !(value instanceof Buffer))) {
			for (let i in value) {
				content = Buffer.concat([ content, Buffer.from(value) ]);
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
		this.container = [ content ];
	}

	* [ Symbol.iterator ] () {
		yield this.container;
	}

	write (content: unknown) {
		this.container.push(this.makeByte(content));
	}

	tell () {
		return this.content.length;
	}

	getValue () {
		return this.content;
	}

	writable = true;

	writelines (lines: unknown[]) {
		for (let line in lines) {
			this.write(lines);
		}
	}
}

interface StreamingResponseProps extends ResponseBaseProps {
	streamingContent?: Iterable<any>
}

export class StreamingHttpResponse extends HTTPResponseBase {
	streaming: boolean = true;
	//@ts-ignore
	#iterator: IterableIterator<any>;

	// private streamingContent: () => void;
	constructor (streamingResponseProps: StreamingResponseProps) {
		super(streamingResponseProps);
		this.streamingContent = streamingResponseProps.streamingContent ?? [];
	}

	get content () {
		throw new Error(
			`This ${ this.constructor.name } instance has no 'content' attribute. Use 'streamingContent' instead.`,
		);
	}

	get streamingContent (): Iterable<Buffer> {
		let i = this.#iterator;
		let chunk: Buffer[] = [];
		let temp;
		while (!(temp = i.next()).done) {
			chunk.push(temp.value);
		}
		return chunk;
	}

	set streamingContent (value: Iterable<Buffer>) {
		this.setStreamingContent(value);
	}

	setStreamingContent (value: Iterable<Buffer> | Object) {
		if (typeof value === "object" && !Array.isArray(value)) {
			this.#iterator = Object.values(value)[ Symbol.iterator ]();
		} else {
			this.#iterator = value[ Symbol.iterator ]();
		}
		// @ts-ignore
		if (value.close !== undefined) {
			// @ts-ignore
			this.resourceClosers.push(value.close);
		}
	}

	* [ Symbol.iterator ] () {
		yield this.streamingContent;
	}

	getValue () {
		// @ts-ignore
		return Buffer.concat(this.streamingContent);
	}
}

interface FileResponseProps extends StreamingResponseProps {
	asAttachment?: boolean;
	filename?: string;
}

export class FileResponse extends StreamingHttpResponse {
	blockSize: number = 4096;
	asAttachment: boolean;
	filename: string;
	private fileToStream: Iterable<Buffer> | Object | null = null;

	constructor (fileResponseProps: FileResponseProps) {
		super(fileResponseProps);
		const { asAttachment = false, filename = "" } = fileResponseProps;
		this.asAttachment = asAttachment;
		this.filename = filename;
	}

	setStreamingContent (value: Object) {
		if (!value.hasOwnProperty("read")) {
			this.fileToStream = null;
			return super.setStreamingContent(value);
		}
		let fileLike: fileLike;
		this.fileToStream = fileLike = value;
		if (value.hasOwnProperty("close")) {
			this.resourceClosers.push(value.close);
		}
		value = fileLike.read(this.blockSize);
		this.setHeaders(fileLike);
		super.setStreamingContent(value);
	}

	setHeaders (fileLike: fileLike) {
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
	allowSchemes = [ "http", "https", "ftp" ];
	private location: string;

	constructor (
		redirectTo: unknown,
		contentType: string | null = null,
		status: number = 200,
		reason: string = "",
		charset: validCharset = "utf-8",
	) {
		super(contentType, status, reason, charset);
		const IRI = new iri.IrI(redirectTo);
		this.location = IRI.toURIString();
		if (IRI.scheme && !this.allowSchemes.includes(IRI.scheme)) {
			throw new TypeError("Unsafe redirect to URL with protocol " + IRI.scheme);
		}
	}

	get url () {
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

	constructor (
		content: Buffer = Buffer.from(""),
		contentType: string | null = null,
		status: number = 200,
		reason: string = "",
		charset: validCharset = "utf-8",
	) {
		super(content, contentType, status, reason, charset);
		this.deleteHeader("content-type");
	}

	set content (value: string | any[] | Buffer | Uint8Array) {
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

	constructor (
		permittedMethods: string[],
		contentType: string | null = null,
		status: number = 200,
		reason: string = "",
		charset: validCharset = "utf-8",
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
	constructor (
		data: json,
		content: Buffer,
		contentType: string | null,
		status: number = 200,
		reason: string = "",
		charset: validCharset = "utf-8",
	) {
		contentType = "application/json";
		content = Buffer.from(data);
		super(content, contentType, status, reason, charset);
	}
}
