import os from "os";

class databaseSetting {}

export default class Setting {
	// core
	debug: boolean = true;
	stopPropagation: boolean = true;
	admins: string[] = [];
	internalIPs: string[] = [];
	allowHosts: string[] = [];
	timeZone: string = "UTC";
	databaseTimeZone: string = "UTC";
	charset: string = "utf-8";
	serverEmail: string = "root@localhost";
	database: databaseSetting = {};
	databaseRouters: databaseSetting[] = [];
	emailBackend: string = "nodemailer";
	emailHost: string = "localhost";
	emailPort: number = 25;
	emailUseLocalTime: boolean = false;
	emailHostUser: string = "";
	emailHostPassword: string = "";
	emailSecure: boolean = false;
	emailTimeout: number = -1;
	trailingSlashes: boolean = true;
	blackList: string[] = [];
	ignore404List: string[] = [];
	secretKey: string = "";
	mediaRoot: string = "";
	mediaUrl: string = "";
	staticRoot: string = "";
	staticUrl: string = "";
	fileUploadMaxSize: number = 2 ** 18 * 10;
	dataUploadMaxSize: number = 2 ** 18 * 10;
	dataUploadMaxFieldsNumber: number = 1000;
	fileUploadTempDir: string = os.tmpdir();
	uploadedFilePermission: number = 0o666;
	uploadedFolderPermission: number = 0o777;
	dateFormat: string = "YYYY-MM-DD";
	dateTimeFormat: string = "YYYY-MM-DD HH:mm:ss";
	timeFormat: string = "HH:mm:ss";
	XFrameOptions: "DENY" | "SAMEORIGIN" | string = "DENY";
	SecureProxySSLHeader: { [key: string]: any } = {};
	defaultHashingAlgorithm: string = "sha256";
	// sessions
	sessionCacheName: string = "default";
	sessionCookieName: string = "sessionId";
	sessionCookieAge: number = 1000 * 60 * 60 * 24;
	sessionCookieDomain: string | null = null;
	sessionCookieSecure: boolean = false;
	sessionCookiePath: string = "/";
	sessionCookieHttpOnly: boolean = true;
	sessionCookieSameSite: "LAX" | "Strict" | null = "LAX";
	sessionSaveEveryRequest: boolean = false;
	sessionExpireAtBrowserClose: boolean = false;
	sessionEngine: string | Function = "sessionstore";
	sessionSerializer: Function | null = null;
	// cache
	cacheEngine: string | Function = "cache-manager";
	// authentication
	passwordHashes: string[] = ["SHA256", "SHA512", "SHA512"];
	loginUrl: string = "/login";
	loginRedirectUrl: string = "/home";
	logoutUrl: string = "/logout";
	logoutRedirectUrl: string = "/goodbye";
	passwordRestTimeout: number = 1000 * 60 * 60 * 24 * 3;
	// sign
	useSign: boolean = true;
	// csrf
	csrfFailedHandle: Function = () => {};
	csrfCookieName: string = "csrftoken";
	csrfCookieAge: number = 1000 * 60 * 60 * 24 * 7;
	csrfDomain: string | null = null;
	csrfPath: string = "/";
	csrfUseSecure: boolean = false;
	csrfHttpOnly: boolean = false;
	csrfSameSite: "LAX" | "Strict" | null = "LAX";
	csrfHeaderName: string = "X-CSRF-TOKEN";
	csrfTrustOrigins: string[] = [];
	csrfUseSession: boolean = false;
}
