## Response

1. ResponseBase

	 > 响应基类，所有的response都派生自此类
	 
	1. status: 状态码, `number`类型，范围100~599，默认值200。
	2. hearders：响应头，`{[key:string]:string}`类型，私有属性，提供三个方法进行读写：
		1. addHeader:`(header:string,value:string)=>void`，添加一个响应头，如果有同名，将会被覆盖；
		2. deleteHeader：`(header:string)=>boolean`，删除一个响应头，成功删除返回true，不存在返回false；
		3. getHeader：`(header:string,defaultValue?:string)=>
			 string`,返回响应头的值，如果不存在将返回`defaultValue`并且将`defaultValue`作为`header`的值保存，如果没有提供defaultValue的值且header不存在，将抛出一个错误。
	3. cookies：cookie数据，`{[key:string]:cookieSetting}`类型，私有值，提供三个方法进行读写
		1. addCookie:(cookie:CookieProps)=>boolean，添加一个cookie，添加成功返回true，失败返回false
		2. deleteCookie:`(key: string, path: string = "/", domain?: string, sameSite?: sameSite)=>boolean`
			 ，删除一个cookie，成功删除返回true，失败返回false
		3. getCookie:`(cookie:string)=>cookieSetting`,获取一个cookie，如果没有将返回undefined。
	4. closed：网络连接是否被关闭，`Boolean`类型，只读，通过`closeConnect`关闭
	5. reasonPhrase：`string`类型，当没有正常返回时，返回给客户端的原因
	6. write:`(content:unknown)=>void` 在响应内容的末尾添加内容，只有可写响应类支持。
	7. writelines：`(content:Array<unknow>)=>void` 在响应内容末尾添加多条记录，只有可写响应类支持
	8. writeable: `boolean` 是否可写，默认`false`。
	9. flush:`()=>void`，刷新缓冲区
	10. readable: 是否可读，默认`false`
	11. whiteList:`Array<string>` 设置可以访问此类的网络来源，主要用于细分，默认值`0.0.0.0/0` 如果需要全局设置可以访问，请修改setting文件
	12. blackList:`Array<string>`设置禁止访问此类的网络来源，默认值为空数组，如果需要设置全局禁止访问，请修改setting文件
	13. charset：`validCharset`,设置response的编码类型，默认值为`UTF-8`，一般需要在读取非`UTF-8`类型的文件时需要设置。

2. HttpResponse

	 > 网络响应类，继承自HttpResponseBase

	1. streaming:`boolean` ，是否是流式内容，默认`false`
	2. container: `Array<Buffer>`，响应内容，私有属性，通过`content`修改
		1. getter content：返回container
		2. setter content:  输入类型必须为`string,Buffer,Object`或对应类型的`arrayLike`。
	3. write：`(content:string|object|Buffer)=>void`，在container末尾添加一个数据。
	4. writelines：`(contents:Array<string|object|Buffer>)=>void`，在container末尾添加多条记录。
	5. writeable：`Boolean`, 默认是`true`
	6. length：`number`，响应内容的总长度

3. StreamingHttpResponse

	 > 流式响应，用于响应内容非常大时的响应类型，继承自HTTPResponseBase

	1. blockSize:`number`，每个分区的大小，单位`byte`，默认值`8388608（8Mib）`
	2. content: `never`，流式内容能使用content获取内容，使用`streamingContent`属性代替
	3. getStreamingContent：`()=>ReadableStream`,可读流 ,流式响应内容
	4. setStreamingContent:`(stream:readableStream|arrayLike|string，close:?()=>void)=>void`
		 ，使用一个可读流或者数据设置内容，可以提供一个关闭方法，关闭读写操作

4. FileResponse

	 > 文件响应类，继承自StreamingHttpResponse

	1. asAttachment :`boolean` 是否应作为文件下载，默认值`true`
	2. filename: `string` 文件名，可以为空，让浏览器自行判断文件名称
	3. setStreamingContent： `(stream:readableStream|string)=>void` 传入一个可读流，或者文件的地址，将自动的读入对应的文件
	4. setHeaders：`(stream:readableStream|string)=>void` 传入一个可读流，或者文件的地址，将自动设置响应头的`Content-Length`,`Content-Type`
		 ,`filename`和`Content-Disposition`属性

5. HttpResponseRedirectBase

	 > 重定向类，继承自HttpResponseBase

	1. allowSchemes: `Array<schemes>` 允许重定向的来源的schemes
	2. redirectTo: `string` 设置重定向的页面

6. HttpResponseRedirect

	 > 表示页面临时的移动到了新的地址，继承自HttpResponseRedirect

7. HttpResponsePermanentRedirect

	 > 表示页面已经永久的移动到了新的地址，继承自HttpResponseRedirect

8. HttpResponseNotModified

	 > 页面未修改，继承自HttpResponseRedirect

9. HttpResponseBadRequest

	 > 错误请求，继承自HttpResponse

10. HttpResponseForbidden

	> 服务器支持该请求，但拒绝对其进行授权，继承自HttpResponse

10. HttpResponseNotFound

	> 服务器找不到目标资源，或不愿意透露该资源的存在，继承自HttpResponse

12. HttpResponseNotAllowed
		
	> 请求方法对于源服务器是已知的，但目标资源不支持，继承自HttpResponse

13. HttpResponseGone
		
	> 目标资源已经永久的不存在了，继承自HttpResponse

14. HttpResponseServerError
		
	> 服务器遇到意外情况，继承自HttpResponse
