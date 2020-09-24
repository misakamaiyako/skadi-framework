export function cachedProperty(target: any, name: string, descriptor: PropertyDescriptor) {
	const old = descriptor.value;
	let called: boolean = false;
	let result: any;
	descriptor.value = function () {
		if (called) {
			return result;
		} else {
			result = old.apply(null, arguments);
			called = true;
			return result;
		}
	};
	return descriptor;
}
