import App from "../../app";
import { IncomingMessage } from "http";

export default class BaseController {
	constructor(req: IncomingMessage) {}

	app: App;
}
