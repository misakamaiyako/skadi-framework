import os from "os";
import { ServerOptions } from "https";

class databaseSetting {}

export default class Setting {
	// core
	readonly debug: boolean = true;
	readonly port: number | null = null;
	readonly stopPropagation: boolean = true;
	readonly admins: string[] = [];
	readonly internalIPs: string[] = [];
	readonly allowHosts: string[] = [];
	readonly timeZone: string = "UTC";
	readonly databaseTimeZone: string = "UTC";
	readonly charset: string = "utf-8";
	readonly serverEmail: string = "root@localhost";
	readonly database: databaseSetting = {};
	readonly databaseRouters: databaseSetting[] = [];
	readonly emailBackend: string = "nodemailer";
	readonly emailHost: string = "localhost";
	readonly emailPort: number = 25;
	readonly emailUseLocalTime: boolean = false;
	readonly emailHostUser: string = "";
	readonly emailHostPassword: string = "";
	readonly emailSecure: boolean = false;
	readonly emailTimeout: number = -1;
	readonly trailingSlashes: boolean = true;
	readonly blackList: string[] = [];
	readonly ignore404List: string[] = [];
	readonly secretKey: string = "";
	readonly mediaRoot: string = "";
	readonly mediaUrl: string = "";
	readonly staticRoot: string = "";
	readonly staticUrl: string = "";
	readonly fileUploadMaxSize: number = 2 ** 18 * 10;
	readonly dataUploadMaxSize: number = 2 ** 18 * 10;
	readonly dataUploadMaxFieldsNumber: number = 1000;
	readonly fileUploadTempDir: string = os.tmpdir();
	readonly uploadedFilePermission: number = 0o666;
	readonly uploadedFolderPermission: number = 0o777;
	readonly dateFormat: string = "YYYY-MM-DD";
	readonly dateTimeFormat: string = "YYYY-MM-DD HH:mm:ss";
	readonly timeFormat: string = "HH:mm:ss";
	readonly XFrameOptions: "DENY" | "SAMEORIGIN" | string = "DENY";
	readonly SecureProxySSLHeader: { [key: string]: any } = {};
	readonly defaultHashingAlgorithm: string = "sha256";
	readonly tsl: boolean = false;
	readonly privateKey: string = "";
	readonly restSetting: Omit<ServerOptions, "tsl" & "privateKey"> = {};
	readonly certificate: string = "";
	readonly maxHeadersCount: number = 1000;
	// sessions
	readonly sessionCacheName: string = "default";
	readonly sessionCookieName: string = "sessionId";
	readonly sessionCookieAge: number = 1000 * 60 * 60 * 24;
	readonly sessionCookieDomain: string | null = null;
	readonly sessionCookieSecure: boolean = false;
	readonly sessionCookiePath: string = "/";
	readonly sessionCookieHttpOnly: boolean = true;
	readonly sessionCookieSameSite: "LAX" | "Strict" | null = "LAX";
	readonly sessionSaveEveryRequest: boolean = false;
	readonly sessionExpireAtBrowserClose: boolean = false;
	readonly sessionEngine: string | Function = "sessionstore";
	readonly sessionSerializer: Function | null = null;
	// cache
	readonly cacheEngine: string | Function = "cache-manager";
	// authentication
	readonly passwordHashes: string[] = ["SHA256", "SHA512", "SHA512"];
	readonly loginUrl: string = "/login";
	readonly loginRedirectUrl: string = "/home";
	readonly logoutUrl: string = "/logout";
	readonly logoutRedirectUrl: string = "/goodbye";
	readonly passwordRestTimeout: number = 1000 * 60 * 60 * 24 * 3;
	// sign
	readonly useSign: boolean = true;
	// csrf
	readonly csrfFailedHandle: Function = () => {};
	readonly csrfCookieName: string = "csrftoken";
	readonly csrfCookieAge: number = 1000 * 60 * 60 * 24 * 7;
	readonly csrfDomain: string | null = null;
	readonly csrfPath: string = "/";
	readonly csrfUseSecure: boolean = false;
	readonly csrfHttpOnly: boolean = false;
	readonly csrfSameSite: "LAX" | "Strict" | null = "LAX";
	readonly csrfHeaderName: string = "X-CSRF-TOKEN";
	readonly csrfTrustOrigins: string[] = [];
	readonly csrfUseSession: boolean = false;
}
