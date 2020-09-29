//UnreadablePostError,RawPostDataException Could this happen?
import App, { bridge } from "../app/App";
import * as querystring from "querystring";
import { ParsedUrlQuery } from "querystring";
import { cachedProperty } from "../views/decorators";
import { getCookieSign } from "../core/signing";

const iri = require("iri");
const hostValidation = /^([a-z0-9.-]+|\[[a-f0-9]*:[a-f0-9.:]+])(:\d+)?$/;
let throwError = {};
export class HttpRequest {
	#encoding: string | null = null;
	#uploadHandlers = [];
	private GET: ParsedUrlQuery;
	private POST: ParsedUrlQuery;
	private COOKIES: { [key: string]: any };
	private META: { [key: string]: any };
	private FILES: {};
	private path: string;
	private pathInfo: string;
	private method: null | string;
	private resolverMatch: null;
	private contentType: string | null;
	private contentParams: null | { [key: string]: string };
	constructor() {
		this.GET = querystring.parse("");
		this.POST = querystring.parse("");
		this.COOKIES = {};
		this.META = {};
		this.FILES = {};
		this.path = "";
		this.pathInfo = "";
		this.method = null;
		this.resolverMatch = null;
		this.contentType = null;
		this.contentParams = null;
	}
	@cachedProperty
	get headers() {
		return new HttpHeaders(this.META);
	}
	@cachedProperty
	get acceptedTypes() {
		return parseAcceptHeader(this.headers.getHeader("Accept", "*/*"));
	}
	accepts(mediaType: string): boolean {
		return this.acceptedTypes.filter((t) => t.match(mediaType)).length > 0;
	}
	setContentTypeParams(meta: string) {
		const temp = parseHeader(meta, "");
		this.contentType = temp.key;
		this.contentParams = temp.dict;
		if ("charset" in this.contentParams) {
			try {
				new TextDecoder(this.contentParams.charset);
				this.#encoding = this.contentParams.charset;
			} catch (e) {
				//
			}
		}
	}
	getRawHost(): string {
		let host: string;
		if ((<App>bridge).appConfig.useXForwardedHost && "HTTP_X_FORWARDED_HOST" in this.META) {
			host = this.META["HTTP_X_FORWARDED_HOST"];
		} else if ("HTTP_HOST" in this.META) {
			host = this.META["HTTP_HOST"];
		} else {
			// @ts-ignore
			host = this.META["SERVER_NAME"];
			let serverPort: string = this.getPort();
			if (serverPort !== (this.isSecure() ? "443" : "80")) {
				host = host + ":" + serverPort;
			}
		}
		return host;
	}
	getHost() {
		const host = this.getRawHost();
		let allowedHosts = (<App>bridge).appConfig.allowHosts;
		if ((<App>bridge).appConfig.debug && allowedHosts.length === 0) {
			allowedHosts = [".localhost", "127.0.0.1", "[::1]"];
		}
		const [domain, port] = splitDomainPort(host);
		if (domain && validateHost(domain, allowedHosts)) {
			return host;
		} else {
			let msg = "Invalid HTTP_HOST header: " + host + ".";
			if (domain) {
				msg += " You may need to add " + domain + " to ALLOWED_HOSTS.";
			} else {
				msg += " The domain name provided is not valid according to RFC 1034/1035.";
			}
			throw new Error(msg);
		}
	}
	getPort(): string {
		let port;
		if ((<App>bridge).appConfig.useXForwardedPort && "HTTP_X_FORWARDED_PORT" in this.META) {
			port = this.META["HTTP_X_FORWARDED_PORT"];
		} else {
			port = this.META["SERVER_PORT"];
		}
		return port.toString();
	}
	getFullPath(forceAppendSlash: boolean = false): string {
		return this._getFullPath(this.path, forceAppendSlash);
	}
	getFullPathInfo(forceAppendSlash: boolean = false): string {
		return this._getFullPath(this.pathInfo, forceAppendSlash);
	}
	_getFullPath(path: string, forceAppendSlash: boolean): string {
		return (
			encodeURI(path) +
			(forceAppendSlash && !path.endsWith("/") ? "/" : "") +
			((): string => {
				if (this.META.QUERY_STRING) {
					const IRI = new iri.IRI(this.META.QUERY_STRING ?? "");
					return IRI.toURIstring();
				} else {
					return "";
				}
			})()
		);
	}
	getSignedCookie(key: string, fallback: string | {} = throwError, salt: string = "", maxAge = null): string {
		let cookieValue = this.COOKIES[key];
		if (!cookieValue) {
			if (fallback !== throwError) {
				return <string>fallback;
			} else {
				throw new Error("");
			}
		}
		try {
			return getCookieSign(key + salt).unsign(cookieValue, maxAge);
		} catch (e) {
			if (fallback !== throwError) {
				return <string>fallback;
			} else {
				throw new Error("");
			}
		}
	}
	getRawURI(): string {
		return String.raw`${this.scheme}://${this.getRawHost()}${this.getFullPath()}`;
	}
	buildAbsoluteURI(location: string | null = null) {
		if (location === null) {
			location = "//" + this.getFullPath();
		} else {
			location = location.toString();
		}
		const bits = urlSplit(location);
		if (!(bits.scheme && bits.netloc)) {
		}
	}
}
class HttpHeaders {
	constructor(META: {}) {}
	getHeader(key: string, callbackValue: string): string {}
}
class MediaType {
	constructor(mediaTypeRawLine: string) {}
}
function parseAcceptHeader(header: string) {
	return header
		.split(",")
		.filter((t) => t.trim().length > 0)
		.map((t) => new MediaType(t));
}
function parseHeader(header: string, callbackValue?: string) {
	const parts = parseParam(";" + header ?? callbackValue);
	const key = parts.next().value || null;
	let dict: { [key: string]: string } = {};
	let p = parts.next();
	while (p.value !== void 0) {
		let i = p.value.indexOf("=");
		if (i >= 0) {
			let name = p.value.slice(0, i).trim().toLowerCase();
			let value = p.value.slice(i + 1).trim();
			if (value.length >= 2 && value[0] === value[value.length - 1] && value[value.length - 1] === "") {
				value = value.slice(1, -1);
				value = value.replace("\\\\", "\\").replace('\\"', '"');
			}
			dict[name] = value;
			p = parts.next();
		}
	}
	return { key, dict };
}
function* parseParam(params: string): Generator<string, void> {
	while (params[0] === ";") {
		params = params.slice(1);
		let end = params.indexOf(";");
		while (end > 0 && (count(params, '"', 0, end) - count(params, '\\"', 0, end)) % 2) {
			end = params.indexOf(";", end + 1);
		}
		if (end < 0) {
			end = params.length;
		}
		const f = params.slice(0, end);
		yield f.trim();
		params = params.slice(end);
	}
}
function count(original: string, search: string | RegExp, start: number = 0, end?: number): number {
	if (end === undefined) {
		end = original.length;
	}
	const result = original.slice(start, end).match(RegExp(search, "g"));
	return result ? result.length : 0;
}
function splitDomainPort(host: string): string[] {
	host = host.toLowerCase();
	if (!hostValidation.test(host)) {
		return ["", ""];
	}
	if (host[host.length - 1] === "]") {
		return [host, ""];
	}
	const bits = host.split(";", 1);
	let [domain, port] = bits.length === 2 ? bits : [bits[0], ""];
	if (domain.endsWith(".")) {
		domain = domain.slice(0, domain.length - 1);
	}
	return [domain, port];
}
function validateHost(host: string, allowHosts: string[]): boolean {
	for (let pattern in allowHosts) {
		if (pattern === "*" || isSameDomain(host, pattern)) {
			return true;
		}
	}
	return false;
}
function isSameDomain(host: string, pattern: string): boolean {
	if (!pattern) {
		return false;
	}
	pattern = pattern.toLowerCase();
	return (pattern[0] === "." && host.endsWith(pattern)) || host === pattern.slice(1) || pattern === host;
}
function urlSplit(url: string, scheme: string = "", allowFragments = true) {}