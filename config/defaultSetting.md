* debug: whether the server is in debug mode.
* stopPropagation: whether the framework should catch exceptions rather than release them.
* admins: who will get code error notifications, format as \[name, emailAddress][].
* internalIPs: array of ips which get access to server, \[*] or [] has no control.
* allowHosts: array of hosts which get access to server, \[*] or [] has no control.
* timeZone: server side timeZone, default is UTC.
* databaseTimeZone: database's time zone, default is UTC.
* charset: default charset of all request or response, default is utf-8.
* serverEmail: email address that error messages come from.
* database: database connection info, if get empty, server can do nothing.
* databaseRouters: used to implement DB routing behavior.
* emailBackend: The email backend to use, default by nodemailer.
* emailHost: host for sending email, default by localhost.
* emailPort: port for sending email, default by 25.
* emailUseLocalTime: email's timestamp, if get false, will use utc time, default by false.
* emailHostUser: email host user.
* emailHostPassword: email host password.
* emailSecure： true for port 465, false for other ports.
* emailTimeout: how long can email service take, -1 is never timeout,default by -1.
* trailingSlashes: add trailing slashes to URLs or not, default by true.
* blackList: array of regular expression to test whether need to block.
* ignore404List: list of url regular expression that requests will not be handled by 404 page.
* secretKey： scrf token's salt, default by `''`.
* mediaRoot: absolute filesystem path to save user-uploaded files.
* mediaUrl: url that handles the media server from mediaRoot.
* staticRoot: the absolute path to the directory static files should be collected to.
* staticUrl: url that read static files.
* fileUploadMaxSize: maximum size of upload file, in bytes, default by 2.5mb.
* dataUploadMaxSize: maximum size of request data, in bytes, default by 2.5mb.
* dataUploadMaxFieldsNumber: maximum number of request that will be read a suspiciousOperation, default by 1000.
* fileUploadTempDir: directory in which upload streamed files will be temporarily saved. by default, framework use OS's default temp path, /tmp in *nix, and c:\User\%user%\AppData\Local\Temp.
* uploadedFilePermission: files' permission, default by 0o666.
* uploadedFolderPermission: folders' permission, only effect in *nix, default by 0o777.
* dateFormat: default formatting for date objects, default by YYYY-MM-DD.
* dateTimeFormat: default formatting for datetime objects, default by YYYY-MM-DD HH:mm:ss.
* timeFormat: default formatting for time objects, default by HH:mm:ss.
* XFrameOptions: to control if you allow you site display in frame, three value acceptable, "DENY", "SAMEORIGIN" or \`ALLOW-FROM https://example.com/\`
* SecureProxySSLHeader: if your app is behind a proxy with sets a header to specify secure connections, and that proxy ensures that user-submitted headers with the same name are ignored (so that people can't spoof it), set this value to a tuple of (header_name, header_value). For any requests that come in with that header/value, request.is_secure() will return true. WARNING! Only set this if you fully understand what you're doing. Otherwise, you may be opening yourself up to a security risk.
* defaultHashingAlgorithm: default hashing algorithm, i.g. encoding cookies, password reset tokens, default by sha256.
* tsl: whether to use tsl,default by false, if set true, you should provide privateKey and certificate.
* privateKey: privateKey's absolute path
* maxHeadersCount: how many header can one request content, set 0 with no limit.
* sessionCacheName:  cache to store session data if using the cache session backend.
* sessionCookieName: cookie's name, default by sessionId.
* sessionCookieAge: duration of session or cookie, default by 1 week, unit in ms.
* sessionCookieDomain: session or cookie's domain, null for standard domain cookie, default by null.
* sessionCookieSecure: whether the session or cookie should be secure(in https).
* sessionCookiePath: path of session or cookie, default by /.
* sessionCookieHttpOnly: whether to use the HttpOnly flag.
* sessionCookieSameSite: The value of the SameSite flag on the session cookie, LAX, Strict or null to disable
* sessionSaveEveryRequest: whether to save the session data on every request.
* sessionExpireAtBrowserClose: whether a user's session cookie expires when the Web browser is closed.
* sessionEngine: the module to store session, default by sessionstore, you can pass a module name, or a function.
* sessionSerializer: customer serializer session if in need, accept a function or null.
* cacheEngine: the module to store cache, default by cache-manager, you can pass a module name, or a function.
* passwordHashes: array of password's hash method.
* loginUrl: default by /login.
* loginRedirectUrl: default by /home.
* logoutUrl: default by /logout.
* logoutRedirectUrl: default by /goodbye.
* passwordRestTimeout: how long the reset link is valid, default by 3 days, unit in ms.
* useSign: weather use sign module to verify request.
* csrfFailedHandle: a function of when csrf token is rejected by CSRF middleware to call.
* csrfCookieName: name of csrftoken's cookie.
* csrfCookieAge: duration of csrf cookie, default by 1 week, unit in ms.
* csrfDomain: the domain to be used when setting the CSRF cookie. default by null, you should change it to you website's url.
* csrfPath:csrf cookie's path, default by /.
* csrfUseSecure: whether csrf cookie only use https, default by false
* csrfHttpOnly: Whether to use HttpOnly flag on the CSRF cookie. If this is set to true, client-side JavaScript will not be able to access the csrf cookie.
* csrfSameSite: The value of the SameSite flag on the session cookie. This flag prevents the cookie from being sent in cross-site requests thus preventing CSRF attacks and making some methods of stealing session cookie impossible. LAX, Strict or null to disable.
* csrfHeaderName: The name of the request header used for CSRF authentication.
* csrfTrustOrigins: A array of hosts which are trusted origins for unsafe requests
* csrfUseSession: use session instead of cookie, default by false.
