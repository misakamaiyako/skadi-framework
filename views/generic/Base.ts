import { Express } from "express";
import { AssertionError } from "assert";

export default abstract class View {
	readonly httpMethodName = ["get", "post", "put", "patch", "delete", "head", "options", "trace"];
	private request: Express.Request;

	protected constructor(request: Express.Request, KeyWords: { [p: string]: any }) {
		for (let key in KeyWords) {
			if (this.httpMethodName.includes(key)) {
				throw new TypeError("The method name " + key + " is not accepted as keyword argument to " + View.name);
			}
			// @ts-ignore
			if (this[key]) {
				throw new TypeError(
					View.name +
						" received an invalid keyword " +
						key +
						". asView only accepts arguments that already attributes of the class"
				);
			}
		}
		this.setup(request);
		// @ts-ignore
		if (!this.request) {
			throw new AssertionError({
				message: "instance has no 'request' attribute. Did you override setup() and forget to call super()?'",
			});
		}
	}
	setup(request: Express.Request) {
		if (this.get && !this.head) {
			this.head = this.get;
		}
		this.request = request;
	}
	// handler
	abstract get: (request: Express.Request) => void;
	abstract post: (request: Express.Request) => void;
	abstract put: (request: Express.Request) => void;
	abstract patch: (request: Express.Request) => void;
	abstract delete: (request: Express.Request) => void;
	abstract head: (request: Express.Request) => void;
	abstract options: (request: Express.Request) => void;
	abstract trace: (request: Express.Request) => void;
}
