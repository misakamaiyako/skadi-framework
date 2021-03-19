import App from "../app";
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
class Content {
	app: App;
	baseUrl: string;
	body: { [key: string]: any } | BinaryType;
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
	accept(...type: string): string | false;
	acceptsCharsets(...charset: string): string | false;
	acceptsLanguages(...languages: string): string | false;
	get(field: string): string | undefined;
	is(type: string): boolean;
}
