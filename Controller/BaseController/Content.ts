import { Content as ContentInterface } from "../../types/Content";
import { Http2ServerRequest } from "http2";
import http from "http";

export class Content implements ContentInterface {
	app: App;
	baseUrl: string;
	body: { [p: string]: any } | BinaryType;
	cookies: { [p: string]: cookie };
	fresh: Boolean;
	hostname: string;
	ip: string;
	ips: Array<string>;
	method;
	originalUrl: string;
	params: { [p: string]: string };
	path: string;
	protocol: "HTTP" | "HTTPS" | "FTP" | "FTPS";
	query: { [p: string]: string | Array<string> };
	secure: boolean;
	signedCookies: { [p: string]: string };
	stale: boolean;
	subdomains: Array<string>;
	xhr: boolean;

	accept(...type: string): string | false {
		return undefined;
	}

	acceptsCharsets(...charset: string): string | false {
		return undefined;
	}

	acceptsLanguages(...languages: string): string | false {
		return undefined;
	}

	get(field: string): string | undefined {
		return undefined;
	}

	is(type: string): boolean {
		return false;
	}

	constructor(props: http.ClientRequest) {}
}
