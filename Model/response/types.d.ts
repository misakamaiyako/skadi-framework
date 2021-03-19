type validCharset = "utf-8" | "ascii" | "utf8" | "utf16le" | "ucs2" | "ucs-2" | "base64" | "latin1" | "binary" | "hex";

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
