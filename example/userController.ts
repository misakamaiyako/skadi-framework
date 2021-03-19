function Controller(target: new () => any) {
	new target();
}

type RequestMappingProps = {
	url: Array<string> | string;
	methods: Array<string> | string;
};
// function RequestMapping(RequestMappingProps: RequestMappingProps | string): ClassDecorator | MethodDecorator {
// 	// @ts-ignore
// 	console.log(this);
// 	let a = 1;
// 	if (a === 1) {
// 		return function (target) {
// 			console.log(target);
// 		} as ClassDecorator;
// 	} else {
// 		return function (target, name, descriptor) {
// 			console.log(target);
// 		} as MethodDecorator;
// 	}
// }
function RequestMapping(RequestMappingProps: RequestMappingProps | string): MethodDecorator {
	return function (target, name, descriptor) {
		//
	} as MethodDecorator;
}
@Controller
// @RequestMapping("/user")
class UserController {
	@RequestMapping("/user")
	getUser() {}
}

export default {};
