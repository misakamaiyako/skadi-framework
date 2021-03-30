import Setting from "../config/Setting";
import http, { IncomingMessage, ServerResponse } from "http";
import https from "https";
import bodyParser from "body-parser";
import { Skadi } from "../types";
import { Content } from "../Controller/BaseController/Content";
import proxyaddr from "proxy-addr";
import BaseController from "../Controller/BaseController";

class App {
	readonly appConfig: Setting;
	constructor(setting?: typeof Setting) {
		const appConfig = new Setting(); //(setting ?? Setting)();
		if (setting === undefined) {
			console.log("you have not gave setting class, server will use default setting");
			console.log("you can set your setting class by extend Setting Class");
		}
		this.appConfig = appConfig;
		const port = 80; // appConfig.port ?? (this.appConfig.ssl ? 443 : 80);
		const hostname = appConfig.public ? "0.0.0.0" : "127.0.0.1";
		let serverType;
		if (!appConfig.ssl) {
			const server = http.createServer((req, res) => {
				this.preController(req, res);
			});
			server.listen(port, hostname);
		} else {
			serverType = require("https");
		}
		console.log("server started successes and listen on %s://%s:%i", appConfig.ssl ? "https" : "http", hostname, port);
	}

	//预处理，使用baseController
	preController(req: IncomingMessage, res: ServerResponse) {
		// const baseController = new BaseController(req);
		console.log(proxyaddr(req, "1.1.1.1"));
		console.log(req.headers);
		// req;
		// const content = new Content(this, req, res);
		res.end();
	}
	//插件，在请求进入控制器和视图前调用，需要提供install函数和handle函数,另外可以提供type参数表示是在分发前处理还是在返回给客户端前处理
	#prePlugins: Skadi.SkadiPlugin[] = [];
	use(plugins: Skadi.SkadiPlugin) {
		plugins.install();
		this.#prePlugins.push(plugins);
	}
}
export default App;
