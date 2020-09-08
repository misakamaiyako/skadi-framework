import { Express } from "express-serve-static-core";
import { AssertionError } from "assert";
import { RequestHandler, response } from "express";

export default class View {
	protected readonly httpMethodName = ["get", "post", "put", "patch", "delete", "head", "options", "trace"];
	private request: Express.Request | undefined;
	private getClassName() {
		return this.constructor.name;
	}
	protected constructor(request: Express.Request, KeyWords: { [p: string]: any }) {
		// for (let key in KeyWords) {
		// 	if (this.httpMethodName.includes(key)) {
		// 		throw new TypeError(
		// 			"The method name " + key + " is not accepted as keyword argument to " + this.getClassName()
		// 		);
		// 	}
		// 	// @ts-ignore
		// 	if (this[key]) {
		// 		throw new TypeError(
		// 			this.getClassName() +
		// 				" received an invalid keyword " +
		// 				key +
		// 				". asView only accepts arguments that already attributes of the class"
		// 		);
		// 	}
		// }
		// this.request = request;
		// if (this.get && !this.head) {
		// 	this.head = this.get;
		// }
		// if (!this.request) {
		// 	throw new AssertionError({
		// 		message: "instance has no 'request' attribute. Did you override setup() and forget to call super()?'",
		// 	});
		// }
	}
	dispatch: RequestHandler = (request, response, next) => {
		if (!this.httpMethodName.includes(request.method.toLowerCase())) {
			this.httpMethodNotAllowed(request, response, next);
		} else {
			// @ts-ignore
			this[request.method.toLowerCase()](request, response, next);
		}
	};
	// handler
	get: RequestHandler | undefined;
	post: RequestHandler | undefined;
	put: RequestHandler | undefined;
	patch: RequestHandler | undefined;
	delete: RequestHandler | undefined;
	head: RequestHandler | undefined;
	options: RequestHandler | undefined = (request, response) => {
		response.header("ALLOW", this.httpMethodName.join());
		response.header("CONTENT-LENGTH", "0");
	};
	trace: RequestHandler | undefined;

	private httpMethodNotAllowed: RequestHandler = (request, response, next) => {
		console.warn("");
	};
}
