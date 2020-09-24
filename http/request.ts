//UnreadablePostError,RawPostDataException Could this happen?
import { bridge } from "../app/App";
import * as querystring from "querystring";
import { ParsedUrlQuery } from "querystring";
import { cachedProperty } from "../views/decorators";
const hostValidation = /^([a-z0-9.-]+|\[[a-f0-9]*:[a-f0-9.:]+])(:\d+)?$/;
export class HttpRequest {
	#encoding = null;
	#uploadHandlers = [];
	private GET: ParsedUrlQuery;
	private POST: ParsedUrlQuery;
	private COOKIES: {};
	private META: {};
	private FILES: {};
	private path: string;
	private pathInfo: string;
	private method: null | string;
	private resolverMatch: null;
	private contentType: null | string;
	private contentParams: null;
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
	header() {
		return 123402983290;
	}
}
class HttpHeaders {
	constructor(META: {}) {}
}
