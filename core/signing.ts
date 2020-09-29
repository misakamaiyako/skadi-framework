import crypto from "crypto";
import App from "../app";
import { bridge } from "../app/App";

export function getCookieSigner(salt: string = "skadiCookie") {
	const appConfig = (<App>bridge).appConfig;
	const key = appConfig.secretKey;
	const algorithm = appConfig.defaultHashingAlgorithm;
	const iv = appConfig.AlgorithmIV;
	crypto.createDecipheriv(algorithm, key, iv); //todo: return a Decipher function
}
