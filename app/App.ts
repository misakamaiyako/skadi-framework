import fs from "fs";
import express, { Express } from "express";
import Setting from "../config/Setting";
import initSetting from "./config";
class App {
	readonly appConfig: Setting;
	private readonly app: Express;
	private readonly server: any;
	constructor() {
		this.appConfig = initSetting();
		const port = this.appConfig.port ?? (this.appConfig.ssl ? 443 : 80);
		this.app = express();
		let server;
		if (this.appConfig.ssl) {
			try {
				const key = fs.readFileSync(this.appConfig.privateKey);
				const cert = fs.readFileSync(this.appConfig.certificate);
				const https = require("https");
				server = https.createServer(
					{ key, cert, maxHeaderSize: this.appConfig.maxHeadersCount, ...this.appConfig.restSetting },
					this.app
				);
			} catch (e) {
				console.log(e);
				throw new ReferenceError("your tsl's file is incorrect, please check and restart again");
			}
		} else {
			const http = require("http");
			const a = http.STATUS_CODES[404]
			server = http.createServer(
				{ maxHeaderSize: this.appConfig.maxHeadersCount, ...this.appConfig.restSetting },
				this.app
			);
		}
		this.server = server;
		server.listen(port, () => {
			console.log("server started on port " + port);
			this.ready(this.server);
		});
		bridge = this;
	}

	ready(server: any) {}
}
export default App;
//@ts-ignore
export let bridge: App = {};
