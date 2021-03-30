import App from "./app";

declare namespace Skadi {
	enum SafeRequest {
		GET,
		HEAD,
		OPTIONS,
	}
	enum NotSafeRequest {
		POST = 3,
		PUT,
		DELETE,
		CONNECT,
		TRACE,
		PATCH,
	}
	class ContentInterface {
		// 应用程序信息
		app: App;
		//基础路由
		baseUrl: string;
		//post，put等非安全请求的主体
		body: { [key: string]: any } | BinaryType;
		//cookies信息
		cookies: { [key: string]: cookie };
		fresh: Boolean;
		hostname: string;
		ip: string;
		ips: Array<string>;
		method: SafeRequest | NotSafeRequest;
		originalUrl: string;
		params: { [key: string]: string };
		path: string;
		protocol: "HTTP" | "HTTPS" | "FTP" | "FTPS";
		query: { [key: string]: string | Array<string> };
		secure: boolean;
		signedCookies: { [key: string]: string };
		stale: boolean;
		subdomains: Array<string>;
		xhr: boolean;
		accept(...type: string[]): string | false;
		acceptsCharsets(...charset: string[]): string | false;
		acceptsLanguages(...languages: string): string | false;
		get(field: string): string | undefined;
		is(type: string): boolean;
	}
	interface SkadiPlugin {
		install: () => void;
		handle: () => Promise<any>;
		type?: "beforeDispatch" | "beforeResponse";
	}
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
		| "hex";

	interface HTTPResponseBaseProps {
		contentType?: string;
		status?: number;
		reason?: string;
		charset?: validCharset;
	}
	type sameSite = "lax" | "none" | "strict" | null;
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
	interface CookieProps {
		key: string;
		value: string;
		max_age?: number;
		expires?: number | Date;
		path?: string;
		domain?: string;
		secure?: boolean;
		httpOnly?: boolean;
		sameSite?: sameSite;
	}
}
