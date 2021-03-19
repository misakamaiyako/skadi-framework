## Decorator

> 试验阶段，貌似类和方法不能使用同一个修饰器

1. Controller
	> 表示类是一个控制器类，在应用启动时将会自动注入到应用中

2. Authorize
	 
	> 控制器或者方法需要身份验证，接受两个参数`method:Array<string>`和`validator:(request:request)=>Promise<boolean>|boolean`，表示需要认证的方法和自定义身份验证函数

3. RequestMapping

	> 类或者方法的分发条件，接受一个表示路径的字符串或者一个`{url:Array<pathString>|pathString,methods:Array<requestMethod>|requestMethod}`对象,
	 > 方法的路径会自动添加在类的路径之后，方法必须返回`ResponseBase`或者`Promise<ResponseBase>`
