import 'frida-il2cpp-bridge';

const SETTING = {
    'Version': '2.0.6',
    'IsBiliChannel': true, //是否是b服
    'LoginPass': true, //尝试绕过b服防沉迷登陆（2024-11月已失效，只能用来保存账号信息）
    'Proxy': false, //启用http代理
    'ProxyAddress': 'http://192.168.2.1:11241', //代理地址
    'ShowEnemyHp': true, //显示敌人血量
    'PP': false, //添加额外后处理
    'ShowBattleTimeInfo': false, //战斗中显示时间
    'SpeedLevel3': false, //战斗中三倍速
    'SpeedLevel16': false, //战斗中十六倍速
    'EnableTAS': true, //启用TAS和敌人信息面板
    'LogToAdb': false, //打印输出到adb
    'LogTag': 'ArknightsHook',
    'Il2CppHookDelay': 5000,
    'FindFontDelay': 10000,
    'GlobalFont': 'Novecentowide-Normal', //全局UI字体
    'FPS120': false, //解锁120帧
    'KeyBinding': { //按键绑定
        'TAS': {
            'Normal': 'C',
            'SingleFrame': 'Alpha1',
            'DoubleFrame': 'Alpha2',
            'PlayingOnDown': 'F',
            'PlayingOnUp': 'R',
            'CONTROL': 'X',
        },
        'EnemyHud': {
            'ShowInfo': 'Z'
        },
        'BattleSpeedLevel': {
            'THREE': 'Alpha3',
            'FOUR': 'Alpha4'
        }
    }
};

const title = 'G1szNm0gICAgX19fICAgIF9fICAgICAgICAgICAgICBfICAgICAgIF9fICAgIF9fICAgICAgG1ttChtbMzZtICAgLyAgIHwgIC8gL19fX19fX19fX19fICAoXylfX18gXy8gL18gIC8gL19fX19fXxtbbQobWzE7MzZtICAvIC98IHwgLyAvL18vIF9fXy8gX18gXC8gLyBfXyBgLyBfXyBcLyBfXy8gX19fLxtbbQobWzE7MzZtIC8gX19fIHwvICw8IC8gLyAgLyAvIC8gLyAvIC9fLyAvIC8gLyAvIC9fKF9fICApIBtbbQobWzE7MzRtL18vICB8Xy9fL3xfL18vICAvXy8gL18vXy9cX18sIC9fLyAvXy9cX18vX19fXy8gIBtbbQobWzM0bSAgICAgICAgICAgICAgICAgICAgICAgICAvX19fXy8gICAgICAgICAgICAgICAgICAbW20KG1sxOzMwbS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0bW20KG1sxOzMybUFya25pZ2h0cyBBc3Npc3QgU2NyaXB0IFYyLjAuNhtbbSAbWzQ7MzJtKEZvciBBcmtuaWdodHMgdjIuNC4wMSB8IFRlc3RlZCBvbiBGcmlkYSB2MTYuNS42IHwgTGFzdCBtb2RpZmllZCBvbiAyMDI0LTExLTA5KRtbbQobWzE7MzNtQXV0aG9yZWQgYnkgQ2hhb21lbmdPcmlvbhtbbQ=='

namespace Logger {
    export function formatDate(time: string | number | Date = new Date().getTime(), format: string = 'YY-MM-DD hh:mm:ss'): string {
        let date = new Date(time);
        let year = date.getFullYear(),
            month = date.getMonth() + 1,
            day = date.getDate(),
            hour = date.getHours(),
            min = date.getMinutes(),
            sec = date.getSeconds();
        let preArr = Array.apply(null, Array(10))
            .map(function (value: unknown, index: number, array: unknown[]) {
                return '0' + index;
            });
        return format.replace(/YY/g, year.toString())
            .replace(/MM/g, (preArr[month] || month) as string)
            .replace(/DD/g, (preArr[day] || day) as string)
            .replace(/hh/g, (preArr[hour] || hour) as string)
            .replace(/mm/g, (preArr[min] || min) as string)
            .replace(/ss/g, (preArr[sec] || sec) as string);
    }

    export function l(s: string): void {
        console.log(s);
        if (SETTING['LogToAdb']) Java.perform(() => Java.use('android.util.Log').d(SETTING['LogTag'], s));
    }

    function getTime(): string {
        return '[1;30m[' + formatDate(new Date().getTime(), 'hh:mm:ss') + '] -[m '
    }

    function getTC(t: string | undefined = undefined): string {
        return t == undefined ? '' : `[1;35m${t} -[m `;
    }

    export function log(s: any, t: string | undefined = undefined): void {
        l(getTime() + getTC(t) + s);
    }

    export function logDebug(s: any, t: string | undefined = undefined): void {
        l(getTime() + getTC(t) + `[33;47m${s}[m`);
    }

    export function logNormal(s: any, t: string | undefined = undefined): void {
        l(getTime() + getTC(t) + `[1;34m${s}[m`);
    }

    export function logWell(s: any, t: string | undefined = undefined): void {
        l(getTime() + getTC(t) + `[1;32m${s}[m`);
    }

    export function logWarning(s: any, t: string | undefined = undefined): void {
        l(getTime() + getTC(t) + `[1;33m${s}[m`);
    }

    export function logError(s: any, t: string | undefined = undefined): void {
        l(getTime() + getTC(t) + `[1;31m${s}[m`);
    }
}

namespace Il2CppUtil {
    export function instantiate(klass: Il2Cpp.Class, ...parameters: Il2Cpp.Parameter.Type[]): Il2Cpp.Object {
        let obj = klass.alloc();
        obj.method('.ctor').invoke(...parameters);
        return obj;
    }

    export function instantiateOverload(klass: Il2Cpp.Class, types: string[], ...parameters: Il2Cpp.Parameter.Type[]): Il2Cpp.Object {
        let obj = klass.alloc();
        obj.method('.ctor').overload(...types).invoke(...parameters);
        return obj;
    }

    export function readCSharpString(s: NativePointer) {
        return s.isNull() ? 'null' : new Il2Cpp.String(s).content;
    }

    export function getFunctionByAddress(module: Module, address: string | number | NativePointer | UInt64 | Int64) {
        let func = new NativePointer(module.base.add(address).toString());
        Logger.log('[1;32m[√] Hook function[m [33m[' + address.toString() + '][m [1;32mat[m [1;30m' + func.toString() + '[m');
        return func;
    }

    export function getModuleByName(name: string) {
        let module = Process.getModuleByName(name);
        Logger.log('[1;32m[√] Find module[m [33m[' + name + '][m [1;32mat[m [1;30m' + module.base.toString() + '[m');
        return module;
    }

    export function loadModuleByPath(path: string) {
        let module = Module.load(path);
        Logger.log('[1;32m[√] Load module[m [33m[' + path + '][m [1;32mat[m [1;30m' + module.base.toString() + '[m');
        return module;
    }

    export function getEnumName(value: number, klass: Il2Cpp.Class): string {
        const System_Enum = Il2Cpp.corlib.class('System.Enum');
        const GetEnumObject = System_Enum.method<Il2Cpp.Object>('ToObject');
        return new Il2Cpp.String(GetEnumObject.overload('System.Type', 'System.Int32').invoke(klass.type.object, value).method<Il2Cpp.Object>('ToString').invoke()).content as string;
    }

    export function getTypeString(obj: Il2Cpp.Object) {
        return obj.method<Il2Cpp.Object>('GetType').invoke().method<Il2Cpp.String>('ToString').invoke().content as string;
    }

    export function traceClassByName(cls: string, filterMethods: (method: Il2Cpp.Method<Il2Cpp.Method.ReturnType>) => boolean = method => method.name != 'Update', detailed = true, dll = Il2Cpp.domain.assembly("Assembly-CSharp").image) {
        let CSharpClass = dll.class(cls);
        Il2Cpp.trace()
            .parameters(detailed)
            .classes(CSharpClass)
            .filterMethods(filterMethods)
            .and()
            .attach();
        Logger.log('[1;36m[-] 跟踪类:[m [1;33m' + cls + '[m')
    }

    export function traceClass(cls: Il2Cpp.Class, filterMethods: (method: Il2Cpp.Method<Il2Cpp.Method.ReturnType>) => boolean = method => method.name != 'Update', detailed = true) {
        Il2Cpp.trace()
            .parameters(detailed)
            .classes(cls)
            .filterMethods(filterMethods)
            .and()
            .attach();
        Logger.log('[1;36m[-] 跟踪类:[m [1;33m' + cls.name + '[m')
    }

    export function traceFunc(cls: string, methods: string[], detailed = true, dll = Il2Cpp.domain.assembly("Assembly-CSharp").image) {
        let CSharpClass = dll.class(cls);
        let tracer = Il2Cpp.trace().parameters(detailed);
        methods.forEach(method => {
            tracer.methods(CSharpClass.method(method)).and().attach();
        });
    }

    export function dumpso(mod: Module) {
        let path = Il2Cpp.application.dataPath + '/' + mod.base.toString() + '_' + mod.size.toString() + '_' + mod.name;
        let file = new File(path, 'wb');
        Memory.protect(mod.base, mod.size, 'rwx');
        file.write(mod.base.readByteArray(mod.size) as ArrayBuffer);
        file.flush();
        file.close();
        Logger.log('[1;36m[' + mod.name + '] 已导出到路径:[m [1;34m' + path + '[m');
    }
}

namespace FileUtil {
    export function readFile(path: string): Il2Cpp.String {
        return Il2Cpp.corlib.class('System.IO.File').method<Il2Cpp.String>('ReadAllText').overload('System.String').invoke(Il2Cpp.string(path));
    }

    export function writeFile(path: string, text: string) {
        return Il2Cpp.domain.assembly('Torappu.Common').image.class('Torappu.FileUtil').method<void>('WriteToFile').invoke(Il2Cpp.string(text), Il2Cpp.string(path), false);
        //return Il2Cpp.corlib.class('System.IO.File').method<Il2Cpp.String>('WriteAllText').overload('System.String', 'System.String').invoke(Il2Cpp.string(path), Il2Cpp.string(text));
    }

    export function writeBytesToFile(path: string, bytes: any) {
        return Il2Cpp.domain.assembly('Torappu.Common').image.class('Torappu.FileUtil').method<void>('WriteBytesToFile').invoke(bytes, Il2Cpp.string(path), false);
        //return Il2Cpp.corlib.class('System.IO.File').method<Il2Cpp.String>('WriteAllBytes').invoke(Il2Cpp.string(path), bytes);
    }

    export function isFileExists(path: string): boolean {
        return Il2Cpp.corlib.class('System.IO.File').method<boolean>('Exists').invoke(Il2Cpp.string(path));
    }
}

namespace UnityUtil {
    export function objToString(obj: Il2Cpp.Object) {
        return obj.isNull() ? 'null' : obj.method<Il2Cpp.String>('ToString').invoke().content;
    }

    export function saveAllObjectsInSence() {
        let UnityEngineCoreModule = Il2Cpp.domain.assembly('UnityEngine.CoreModule').image;
        function forScene(scene: Il2Cpp.ValueType) {
            let roots = scene.box().method<Il2Cpp.Array<Il2Cpp.Object>>('GetRootGameObjects').overload().invoke();
            let res = scene.box().method<Il2Cpp.String>('get_name').invoke().content + '\n';
            function DoName(obj: Il2Cpp.Object, input: string, count: number = 0): string {
                for (let index = 0; index < count * 6; index++) {
                    input += ' ';
                }
                //let active = obj.method<Il2Cpp.Object>('get_gameObject').invoke().method<boolean>('get_active');
                input += '└──' + obj.method<Il2Cpp.String>('get_name').invoke().content + ' (';
                let components = obj.method<Il2Cpp.Array<Il2Cpp.Object>>('GetComponents').invoke(UnityEngineCoreModule.class('UnityEngine.Component').type.object);
                for (let j = 0; j < components.length; j++) {
                    input += (j == 0 ? '' : ', ') + Il2CppUtil.getTypeString(components.get(j));
                }
                input += ")\n";
                let childCount = obj.method('get_childCount').invoke() as number;
                for (let index = 0; index < childCount; index++) {
                    input = DoName(obj.method<Il2Cpp.Object>('GetChild').invoke(index), input, count + 1);
                }
                return input;
            }
            for (let index = 0; index < roots.length; index++) {
                res = DoName(roots.get(index).method<Il2Cpp.Object>('get_transform').invoke(), res);
            }
            let path = Il2Cpp.application.dataPath + '/' + Logger.formatDate(new Date().getTime(), 'hh-mm-ss') + '.txt';
            let file = new File(path, 'w');
            file.write(res);
            file.flush();
            file.close();
        }
        forScene(UnityEngineCoreModule.class('UnityEngine.SceneManagement.SceneManager').method<Il2Cpp.ValueType>('GetActiveScene').invoke());
        //let dont = UnityEngineCoreModule.class('UnityEngine.GameObject').method<Il2Cpp.Object>('Find').invoke(Il2Cpp.string('Tracking')).method<Il2Cpp.ValueType>('get_scene').invoke();
        //forScene(dont);
        //return;
        /*Interceptor.replace(getFunctionByAddress(Il2Cpp.module, me.relativeVirtualAddress), new NativeCallback(function (obj: NativePointer, scale: number) {
            let ac = new Il2Cpp.Object(obj);
            log(objToString(ac))
            ac.method('set_scaleFactor').invoke(scale);
            log(Thread.backtrace(this.context, Backtracer.FUZZY).map(DebugSymbol.fromAddress).join('\n'))
        }, 'void', ['pointer', 'float']))*/
        //log(b.method<number>('get_scaleFactor').invoke().toString())//.box().method<Il2Cpp.String>('ToString').invoke().content)//.field('m_ScreenMatchMode').value// as Il2Cpp.ValueType).box().field('value__').value.toString();
    }

    export function getFields(obj: Il2Cpp.Object) {
        let fields = obj.class.fields;
        Logger.log(`find ${fields.length} fields.`)
        fields.forEach(field => {
            let name = field.name;
            try {

                let value = obj.field(name).value;
                Logger.log(`[1;34m${name}[m - [1;36m${value}[m`);
            }
            catch
            {
                Logger.log(`[33mError in ${name}[m`);
            }
        });
    }

    export function vector2ToTuple(v2: Il2Cpp.ValueType) {
        return [v2.field('x').value as number, v2.field('y').value as number]
    }

    export function vector3ToTuple(v3: Il2Cpp.ValueType) {
        return [v3.field('x').value as number, v3.field('y').value as number, v3.field('z').value as number]
    }

    export function logRectTransform(obj: Il2Cpp.Object) {
        let com = obj.method<Il2Cpp.Object>('GetComponent').invoke(Il2Cpp.domain.assembly('UnityEngine.CoreModule').image.class('UnityEngine.RectTransform').type.object);
        let sizeDelta = com.method<Il2Cpp.ValueType>('get_sizeDelta').invoke();
        let anchorMax = com.method<Il2Cpp.ValueType>('get_anchorMax').invoke();
        let anchorMin = com.method<Il2Cpp.ValueType>('get_anchorMin').invoke();
        let anchoredPosition = com.method<Il2Cpp.ValueType>('get_anchoredPosition').invoke();
        let localScale = com.method<Il2Cpp.ValueType>('get_localScale').invoke();
        Logger.log(`[1;34mRectTransform in[m [1;36m${obj.toString()}[m[1;34m:[m
[1;34msizeDelta[m - [1;36m(${vector2ToTuple(sizeDelta)})[m
[1;34manchorMax[m - [1;36m(${vector2ToTuple(anchorMax)})[m
[1;34manchorMin[m - [1;36m(${vector2ToTuple(anchorMin)})[m
[1;34manchoredPosition[m - [1;36m(${vector2ToTuple(anchoredPosition)})[m
[1;34mlocalScale[m - [1;36m(${vector3ToTuple(localScale)})[m`)
    }

    export function getTransformPath(obj: Il2Cpp.Object) {
        let transform = obj.method<Il2Cpp.Object>('get_transform').invoke();
        let path: string = '';
        do {
            path = '/' + transform.method<Il2Cpp.String>('get_name').invoke().content + path;
            transform = transform.method<Il2Cpp.Object>('get_parent').invoke();
        } while (!transform.isNull())
        return path;
    }
}

namespace JSUtil {
    export function hexStringTobytes(hex: string) {
        let bytes: number[] = []
        for (var c = 0; c < hex.length; c += 2) {
            bytes.push(parseInt(hex.substring(c, 2), 16));
        }
        return bytes;
    }

    export function hexStringToPtr(hex: string) {
        var bytes = hexStringTobytes(hex);
        let ptr = Il2Cpp.alloc(bytes.length);
        ptr.writeByteArray(bytes);
        return ptr;
    }
}

namespace JavaUtil {
    /** 获得安装包签名*/
    export function getAppSignature(): string {
        let context: Java.Wrapper = Java.use('com.unity3d.player.UnityPlayer').currentActivity.value;
        let packageInfo: Java.Wrapper = context.getPackageManager().getPackageInfo(context.getPackageName(), Java.use('android.content.pm.PackageManager').GET_SIGNATURES.value);
        let sign: Java.Wrapper = packageInfo.signatures.value[0];
        let md5: Int8Array = Java.use('java.security.MessageDigest').getInstance('MD5').digest(sign.toByteArray());
        return Array.prototype.map
            .call(md5, (x: { toString: (arg0: number) => string; }) => ('00' + x.toString(16)).slice(-2))
            .join('');
    }

    export function screenCapView(view: Java.Wrapper) {
        // view.setDrawingCacheEnabled(true); // 设置缓存，可用于实时截图
        let Bitmap = Java.use('android.graphics.Bitmap');
        let CompressFormat = Java.use('android.graphics.Bitmap$CompressFormat');
        let FileOutputStream = Java.use('java.io.FileOutputStream');
        let File = Java.use('java.io.File');
        let MeasureSpec = Java.use('android.view.View$MeasureSpec')
        view.measure(MeasureSpec.makeMeasureSpec(0, MeasureSpec.UNSPECIFIED.value), MeasureSpec.makeMeasureSpec(0, MeasureSpec.UNSPECIFIED.value));
        view.layout(0, 0, view.getMeasuredWidth(), view.getMeasuredHeight());
        view.setDrawingCacheEnabled(true);
        view.buildDrawingCache();
        let bitmap = Bitmap.createBitmap(view.getDrawingCache());
        let file = File.$new(Il2Cpp.application.dataPath + '/screen.png');
        let os = FileOutputStream.$new(file);
        bitmap.compress(CompressFormat.PNG.value, 100, os);
        os.flush();
        os.close();
        return 0;
    }

    export function screenCapViewv1(view: Java.Wrapper) {
        // view.setDrawingCacheEnabled(true); // 设置缓存，可用于实时截图
        let Bitmap = Java.use('android.graphics.Bitmap');
        let Canvas = Java.use('android.graphics.Canvas');
        let Config = Java.use('android.graphics.Bitmap$Config');
        let bitmap = Bitmap.createBitmap(view.getWidth(), view.getHeight(), Config.ARGB_8888.value);
        view.draw(Canvas.$new(bitmap));
        // view.setDrawingCacheEnabled(false); // 清空缓存，可用于实时截图
        // String bitmapString = getBitmapString(bitmap); // 位图转 Base64 String
        let drawByte = getBitmapByte(bitmap); // 位图转为 Byted
        return drawByte;
    }

    function getBitmapByte(bitmap: Java.Wrapper) {
        let CompressFormat = Java.use('android.graphics.Bitmap$CompressFormat');
        let ByteArrayOutputStream = Java.use('java.io.ByteArrayOutputStream');
        let out = ByteArrayOutputStream.$new();
        // 参数1转换类型，参数2压缩质量，参数3字节流资源
        bitmap.compress(CompressFormat.PNG.value, 100, out);
        out.flush();
        out.close();
        return out.toByteArray();
    }

    /*function getBitmapString(bitmap) {
        let result = null;
        ByteArrayOutputStream out = null;
        if (bitmap != null) {
            out = new ByteArrayOutputStream();
            bitmap.compress(Bitmap.CompressFormat.PNG, 100, out);

            out.flush();
            out.close();

            byte[] bitmapBytes = out.toByteArray();
            result = Base64.encodeToString(bitmapBytes, Base64.DEFAULT); // Base64.DEFAULT会自动换行，传给前端会报错，所以要用Base64.NO_WRAP
        }
        return result;
    }*/

    export function screenCap() {
        let player: Java.Wrapper = Java.use('com.unity3d.player.UnityPlayer').currentActivity.value;
        let view = player.getWindow().getDecorView();
        return screenCapView(view);
    }
}

function tryCallingHook(funcs: Function[], rawNames: string[], from: string) {
    for (let index = 0; index < funcs.length; index++) {
        try {
            Logger.logWarning(`${rawNames[index]}() is calling.`, from);
            funcs[index]();
            Logger.logWell(`${rawNames[index]}() is done.`, from);
        } catch (error: any) {
            Logger.logError(`An error occurred while calling ${rawNames[index]}(): ` + error.toString(), from);
        }
    }
}

namespace JavaHook {
    function biliGameSDKHook(): void {
        const reflectField = Java.use('java.lang.reflect.Field');
        // 取消sdk_ver请求头
        reflectField.isAnnotationPresent.implementation = function (klass: Java.Wrapper): boolean {
            if (klass.getName() == 'com.gsc.base.annotations.RequestParam' && this.getName() == 'sdk_ver') return false;
            return this.isAnnotationPresent(klass);
        }

        const requestModel = Java.use('com.http.lib.request.Request');
        // 跳过响应签名检验
        requestModel.a.overload('okhttp3.Response', 'w7').implementation = function (_response: Java.Wrapper, _w7: Java.Wrapper): boolean {
            return true;
        };
    }

    function ACESDKHook(): void {
        const MTPProxyApplication = Java.use('com.hg.sdk.MTPProxyApplication');
        MTPProxyApplication.onProxyCreate.implementation = () => { Logger.logNormal('onProxyCreate blocked') };
        const MTPDetection = Java.use('com.hg.sdk.MTPDetection');
        MTPDetection.onUserLogin.implementation = (_accountType: number, _worldId: number, _openId: string, _roleId: string) => { };
    }

    function biliTrackHook(): void {
        Java.use('com.base.trackingdata.Track').init.implementation = (_z: boolean, _application: Java.Wrapper, _str: string, _str2: string, _str3: string, _str4: string, _str5: string, _str6: string, _str7: string, _str8: string, _str9: string, _z2: boolean) => { }
    }

    function biliPaymentHook(): void {
        // 解决支付时缺少sdk_ver产生的错误
        Java.use('com.gsc.cashier_h5.mvp.b').a.overload('java.lang.String', 'com.gsc.base.model.OrderReqModel', 'com.gsc.base.model.UserInfoModel').implementation = function (_str: string, _orderReqModel: Java.Wrapper, _UserInfoModel: Java.Wrapper): Java.Wrapper {
            let map = this.a.overload('java.lang.String', 'com.gsc.base.model.OrderReqModel', 'com.gsc.base.model.UserInfoModel').apply(this, arguments);
            map.put('sdk_ver', '5.6.2');
            return map;
        };

        // 过本地充值限制（仍然会在下一步受限，暂无解）
        const MinorAntiPayActivity = Java.use('com.gsc.minor_anti_pay.MinorAntiPayActivity');
        MinorAntiPayActivity.b.overload('com.gsc.minor_anti_pay.model.AntiPayResModel').implementation = function (_antiPayResModel: Java.Wrapper) {
            this.b.overload('com.gsc.minor_anti_pay.model.AntiPayResModel').call(this);
        }
    }

    function accessKeyHook(): void {
        let ContentValues = Java.use('android.content.ContentValues')
        ContentValues.put.overload('java.lang.String', 'java.lang.String').implementation = function (key: string, value: string) {
            if (key == 'access_key') {
                Logger.log(value);
                this.put(key, 'xxx_sh');
            }
            else {
                this.put(key, value);
            }
        }
    }

    function HguseragreementHook(): void {
        let Util = Java.use('com.hypergryph.platform.hguseragreement.commom.utils.Util');
        Util.getResult.implementation = function (state: number, errorCode: number) {
            return '{"code":0}'
        }
    }

    export function main(): void {
        Logger.logNormal('[JavaHook] Starting java layer hook...');
        tryCallingHook(
            SETTING['IsBiliChannel'] ? [ACESDKHook, biliGameSDKHook, biliTrackHook, biliPaymentHook, HguseragreementHook] : [ACESDKHook, HguseragreementHook],
            SETTING['IsBiliChannel'] ? ['ACESDKHook', 'biliGameSDKHook', 'biliTrackHook', 'biliPaymentHook', 'HguseragreementHook'] : ['ACESDKHook', 'HguseragreementHook'],
            '[JavaHook]');
        /*tryCallingHook(
            [biliTrackHook],
            ['biliTrackHook'],
            '[JavaHook]');*/
        //accessKeyHook();
    }
}

namespace Il2CppHook {

    let UnityEngineCoreModule: Il2Cpp.Image,
        AssemblyCSharp: Il2Cpp.Image,
        AssemblyCSharpFirstpass: Il2Cpp.Image,
        ThirdPartyAssembly: Il2Cpp.Image,
        UnityEngineUI: Il2Cpp.Image,
        UnityEngineUIModule: Il2Cpp.Image,
        UnityEnginePhysics2DModule: Il2Cpp.Image,
        NewtonsoftJson: Il2Cpp.Image,
        TorappuCommon: Il2Cpp.Image,
        CoreLib: Il2Cpp.Image;

    let Vector3: Il2Cpp.Class, Vector2: Il2Cpp.Class, Color: Il2Cpp.Class,
        UnityEngine_Input: Il2Cpp.Class,
        UnityEngine_KeyCode: Il2Cpp.Class,
        GetKeyDown: Il2Cpp.Method,
        GetKeyUp: Il2Cpp.Method,
        GetKey: Il2Cpp.Method,
        Input: Il2Cpp.Class,
        Camera: Il2Cpp.Class,
        Physics2D: Il2Cpp.Class,
        Mathf: Il2Cpp.Class,
        Enemy: Il2Cpp.Class,
        GameObject: Il2Cpp.Class,
        DataConvertUtil: Il2Cpp.Class,
        FormatUtil: Il2Cpp.Class,
        CharacterUtil: Il2Cpp.Class,
        AudioManager: Il2Cpp.Class,
        PlaySoundFx: Il2Cpp.Method,
        UIPopupWindow: Il2Cpp.Class,
        Alert: Il2Cpp.Method;

    let BattleControllerInstance: Il2Cpp.Object | null = null;
    let UIControllerInstance: Il2Cpp.Object | null = null;

    let accountData: any, accountDataPath: string;
    let OnUIClick: () => void, OnUIEntrance: () => void;

    let Normal: Il2Cpp.Field.Type,
        SingleFrame: Il2Cpp.Field.Type,
        DoubleFrame: Il2Cpp.Field.Type,
        PlayingOnDown: Il2Cpp.Field.Type,
        PlayingOnUp: Il2Cpp.Field.Type,
        CONTROL: Il2Cpp.Field.Type,
        VISABLE: Il2Cpp.Field.Type,
        THREE: Il2Cpp.Field.Type,
        FOUR: Il2Cpp.Field.Type;

    let globalFont: Il2Cpp.Object;

    let hasPlay = false;

    function initHook(): void {
        UnityEngineCoreModule = Il2Cpp.domain.assembly('UnityEngine.CoreModule').image;
        AssemblyCSharp = Il2Cpp.domain.assembly('Assembly-CSharp').image;
        AssemblyCSharpFirstpass = Il2Cpp.domain.assembly('Assembly-CSharp-firstpass').image;
        ThirdPartyAssembly = Il2Cpp.domain.assembly('ThirdPartyAssembly').image;
        UnityEngineUI = Il2Cpp.domain.assembly('UnityEngine.UI').image;
        UnityEngineUIModule = Il2Cpp.domain.assembly('UnityEngine.UIModule').image;
        UnityEnginePhysics2DModule = Il2Cpp.domain.assembly('UnityEngine.Physics2DModule').image;
        NewtonsoftJson = Il2Cpp.domain.assembly('Newtonsoft.Json').image;
        TorappuCommon = Il2Cpp.domain.assembly('Torappu.Common').image;
        CoreLib = Il2Cpp.corlib;

        Vector3 = UnityEngineCoreModule.class('UnityEngine.Vector3');
        Vector2 = UnityEngineCoreModule.class('UnityEngine.Vector2');
        Color = UnityEngineCoreModule.class('UnityEngine.Color');

        UnityEngine_Input = UnityEngineCoreModule.class('UnityEngine.Input');
        UnityEngine_KeyCode = UnityEngineCoreModule.class('UnityEngine.KeyCode');
        GetKeyDown = UnityEngine_Input.method<boolean>('GetKeyDown');
        GetKeyUp = UnityEngine_Input.method<boolean>('GetKeyUp');
        GetKey = UnityEngine_Input.method<boolean>('GetKey');
        Input = UnityEngineCoreModule.class('UnityEngine.Input');
        Camera = UnityEngineCoreModule.class('UnityEngine.Camera');
        Physics2D = UnityEnginePhysics2DModule.class('UnityEngine.Physics2D');
        Mathf = UnityEngineCoreModule.class('UnityEngine.Mathf');
        Enemy = AssemblyCSharp.class('Torappu.Battle.Enemy');
        GameObject = UnityEngineCoreModule.class('UnityEngine.GameObject');
        DataConvertUtil = AssemblyCSharp.class('Torappu.DataConvertUtil');
        FormatUtil = AssemblyCSharp.class('Torappu.FormatUtil');
        CharacterUtil = AssemblyCSharp.class('Torappu.CharacterUtil');
        AudioManager = AssemblyCSharp.class('Torappu.AudioManager')
        PlaySoundFx = AudioManager.method('PlaySoundFx');
        UIPopupWindow = AssemblyCSharp.class('Torappu.UI.UIPopupWindow');
        Alert = UIPopupWindow.method('Alert');

        const FX_UI = AudioManager.nested('FXCategory').field('FX_UI').value;
        const DEFAULT = AudioManager.nested('AudioPlayOption').field('DEFAULT').value;
        OnUIClick = () => { PlaySoundFx.invoke(Il2Cpp.string('Audio/Sound_Beta_2/General/g_ui/g_ui_btn_n'), DEFAULT, FX_UI, false) };
        OnUIEntrance = () => { PlaySoundFx.invoke(Il2Cpp.string('Audio/Sound_beta_2/General/g_ui/g_ui_pageentrance'), DEFAULT, FX_UI, false) };

        Normal = UnityEngine_KeyCode.field(SETTING.KeyBinding.TAS.Normal).value;
        SingleFrame = UnityEngine_KeyCode.field(SETTING.KeyBinding.TAS.SingleFrame).value;
        DoubleFrame = UnityEngine_KeyCode.field(SETTING.KeyBinding.TAS.DoubleFrame).value;
        PlayingOnDown = UnityEngine_KeyCode.field(SETTING.KeyBinding.TAS.PlayingOnDown).value;
        PlayingOnUp = UnityEngine_KeyCode.field(SETTING.KeyBinding.TAS.PlayingOnUp).value;
        CONTROL = UnityEngine_KeyCode.field(SETTING.KeyBinding.TAS.CONTROL).value;
        VISABLE = UnityEngine_KeyCode.field(SETTING.KeyBinding.EnemyHud.ShowInfo).value;
        THREE = UnityEngine_KeyCode.field(SETTING.KeyBinding.BattleSpeedLevel.THREE).value;
        FOUR = UnityEngine_KeyCode.field(SETTING.KeyBinding.BattleSpeedLevel.FOUR).value;
    }

    function initAccountData(): void {
        accountDataPath = Il2Cpp.application.dataPath + '/accountData.cfx.json';
        if (!FileUtil.isFileExists(accountDataPath)) {
            FileUtil.writeFile(accountDataPath, '{"ShowHp":false,"Proxy":{"enable":false,"address":"http://x.x.x.x:port"},"Channel":{},"Game":{}}');
        }
        accountData = JSON.parse(FileUtil.readFile(accountDataPath).content as string);
    }

    function readAccountData(): void {
        accountData = JSON.parse(FileUtil.readFile(accountDataPath).content as string);
    }

    function saveAccountData(): void {
        FileUtil.writeFile(accountDataPath, JSON.stringify(accountData));
    }

    function NetworkHook(): void {
        if (SETTING['Proxy'] || accountData['Proxy']['enable']) {
            let url = SETTING['Proxy'] ? SETTING['ProxyAddress'] : accountData['Proxy']['address'];
            let uri = Il2CppUtil.instantiateOverload(Il2Cpp.domain.assembly('System').image.class('System.Uri'), ['System.String'], Il2Cpp.string(url));
            let proxy = Il2CppUtil.instantiateOverload(ThirdPartyAssembly.class('BestHTTP.HTTPProxy'), ['System.Uri', 'BestHTTP.Authentication.Credentials', 'System.Boolean', 'System.Boolean', 'System.Boolean'], uri, ptr(0), true, true, false);
            ThirdPartyAssembly.class('BestHTTP.HTTPManager').method('set_Proxy').invoke(proxy);
            Logger.logWell(`Global proxy has been set to: [1;36m${url}[m`, '[Il2CppHook]>[NetworkHook]');
            TorappuCommon.class('Torappu.Network.Certificate.CertificateHandlerFactory').nested('BouncyCastleCertVerifyer').method<boolean>('IsValid')
                .implementation = function (targetUri: Il2Cpp.Object, certs: any) {
                    let host = targetUri.method<Il2Cpp.String>("get_Host").invoke().content
                    return host != "ak.hypergryph.com";
                }
        }
    }

    function MiscHook(): void {
        let LoadApplicationSign = AssemblyCSharp.class('Torappu.NativeUtil').method<Il2Cpp.String>('LoadApplicationSign');
        if (SETTING['IsBiliChannel']) LoadApplicationSign.implementation = function () {
            return Il2Cpp.string('4502A02A00395DEC05A4134AD593224D');
        }
        const UnityEngine_Application = UnityEngineCoreModule.class('UnityEngine.Application');
        const set_targetFrameRate = UnityEngine_Application.method('set_targetFrameRate');
        if (SETTING['FPS120']) set_targetFrameRate.implementation = function (fps: number) {
            set_targetFrameRate.invoke(120);
        }
    }

    function LogHook(): void {
        const UnityEngine_Application = UnityEngineCoreModule.class('UnityEngine.Application');
        const CallLogCallback = UnityEngine_Application.method('CallLogCallback');
        const UnityEngine_LogType = UnityEngineCoreModule.class('UnityEngine.LogType')
        Interceptor.attach(Il2CppUtil.getFunctionByAddress(Il2Cpp.module, CallLogCallback.relativeVirtualAddress), {
            onEnter: args => {
                let name = Il2CppUtil.getEnumName(args[3].toInt32(), UnityEngine_LogType);
                let color = 'm';
                switch (name) {
                    case 'Error':
                        color = '31m';
                        break;
                    case 'Assert':
                        color = '36m';
                        break;
                    case 'Warning':
                        color = '33m';
                        break;
                    case 'Log':
                        color = '34m';
                        break;
                    case 'Exception':
                        color = '31;43m';
                        break;
                }
                Logger.log('[1;' + color + '<' + name + '> from Unity' + ':\n' + Il2CppUtil.readCSharpString(args[1])?.replace(/<\/*color.*?>/g, '') + '[m\n    ' + '[1;30m' + Il2CppUtil.readCSharpString(args[2])?.replace(/\n/g, '\n    ') + '[m');
            }
        });
    }

    function EnemyHpSliderHook(): void {
        const A_SLASH_B = AssemblyCSharp.class('Torappu.UI.UITextSlider').nested('TextMode').field('A_SLASH_B');

        /*AssemblyCSharp.class('Torappu.Battle.UI.UIUnitHUD').method('Awake').implementation = function () {
            this.method('Awake').invoke();
        }*/

        AssemblyCSharp.class('Torappu.Battle.UI.UIUnitHUD').method('Attach').implementation = function (owner: Il2Cpp.Object) { // 2024-11-09重写
            //let text = ((this.field('_hpSlider').value as Il2Cpp.Object).field('_text').value as Il2Cpp.Object).method<Il2Cpp.Object>('get_gameObject').invoke();
            let needAttach = owner.class.type != AssemblyCSharp.class('Torappu.Battle.Character').type && owner.class.type != AssemblyCSharp.class('Torappu.Battle.Token').type;
            let hp = this.field<Il2Cpp.Object>('_hpSlider').value;
            if (needAttach && !hp.isNull() && hp.field<Il2Cpp.Object>('_text').value.isNull()) {
                let obj: Il2Cpp.Object = Il2CppUtil.instantiate(UnityEngineCoreModule.class('UnityEngine.GameObject'), Il2Cpp.string('HpText_C(Clone)'));
                obj.method<Il2Cpp.Object>('get_transform').invoke().method('SetParent').invoke(hp.method<Il2Cpp.Object>('get_transform').invoke());
                let text = obj.method<Il2Cpp.Object>('AddComponent').invoke(UnityEngineUI.class('UnityEngine.UI.Text').type.object);
                let rect = obj.method<Il2Cpp.Object>('GetComponent').invoke(UnityEngineCoreModule.class('UnityEngine.RectTransform').type.object);
                rect.method('set_anchoredPosition3D').invoke(Il2CppUtil.instantiate(Vector3, 155, -15, 0).unbox());
                rect.method('set_localScale').invoke(Vector3.method<Il2Cpp.ValueType>('get_one').invoke());
                rect.method('set_sizeDelta').invoke(Il2CppUtil.instantiate(Vector2, 400, 20).unbox());
                text.method('set_font').invoke(globalFont);
                text.method('set_fontSize').invoke(16);
                text.field('m_Color').value = Il2CppUtil.instantiateOverload(Color,
                    ['System.Single', 'System.Single', 'System.Single', 'System.Single'],
                    1, 0, 0, 1).unbox();
                hp.field('_text').value = text;
                hp.field('_textMode').value = A_SLASH_B.value;
            }
            this.method('Attach').invoke(owner);
        }
    }

    function UIBaseHook(): void {
        setTimeout(() => {
            let fonts = UnityEngineCoreModule.class('UnityEngine.Resources').method<Il2Cpp.Array<Il2Cpp.Object>>('FindObjectsOfTypeAll')
                .invoke(Il2Cpp.domain.assembly('UnityEngine.TextRenderingModule').image.class('UnityEngine.Font').type.object);
            for (let index = 0; index < fonts.length; index++) {
                let f = fonts.get(index);
                if (f.toString() == SETTING['GlobalFont'] + ' (UnityEngine.Font)') {
                    globalFont = f
                    Logger.logWell(`Using Font: [1;36m${globalFont.toString()}[m`, '[Il2CppHook]>[UIBaseHook]')
                }
            }
        }, SETTING['FindFontDelay']);

        if (SETTING['ShowEnemyHp'] || accountData['ShowHp']) {
            try {
                EnemyHpSliderHook();
                Logger.logWell('EnemyHpSliderHook() is done.', '[Il2CppHook]');
            } catch (error: any) {
                Logger.logError('An error occurred while calling EnemyHpSliderHook(): ' + error.toString(), '[Il2CppHook]');
            }
        }
    }

    function PPHook(): void {
        const Postprocessing = Il2Cpp.domain.assembly('Unity.Postprocessing.Runtime').image
        let obj = UnityEngineCoreModule.class('UnityEngine.GameObject').method<Il2Cpp.Object>('FindObjectOfType')
            .inflate(Postprocessing.class('UnityEngine.Rendering.PostProcessing.PostProcessVolume')).invoke();
        if (!obj.isNull()) {
            Logger.logNormal('Found PostProcessVolume.', '[Il2CppHook]>[PPHook]')
            let profile = obj.method<Il2Cpp.Object>('get_profile').invoke();
            let settings = profile.field('settings').value as Il2Cpp.Object;
            for (let index = 0; index < settings.method<number>('get_Count').invoke(); index++) {
                Logger.logNormal(settings.method<Il2Cpp.Object>('get_Item').invoke(index).toString() + ' has existed.', '[Il2CppHook]>[PPHook]');
            }
            function addSettings(name: string): Il2Cpp.Object {
                if (profile.method<Il2Cpp.Object>('HasSettings').inflate(Postprocessing.class(name)).invoke()) {
                    return profile.method<Il2Cpp.Object>('GetSetting').inflate(Postprocessing.class(name)).invoke();
                }
                else {
                    return profile.method<Il2Cpp.Object>('AddSettings').inflate(Postprocessing.class(name)).invoke();
                }
            }
            let bloom = addSettings('UnityEngine.Rendering.PostProcessing.HGMobileBloom');
            (bloom.field('intensity').value as Il2Cpp.Object).method('Override').invoke(5);
            (bloom.field('threshold').value as Il2Cpp.Object).method('Override').invoke(0.6);
            /*let ca = addSettings('UnityEngine.Rendering.PostProcessing.AmbientOcclusion');
            (ca.field('mode').value as Il2Cpp.Object).method('Override')
                .invoke(Postprocessing.class('UnityEngine.Rendering.PostProcessing.AmbientOcclusionMode').field('MultiScaleVolumetricObscurance').value);
            (ca.field('intensity').value as Il2Cpp.Object).method('Override').invoke(4);*/
        }
    }

    function LoginHook(): void {
        if (!SETTING['IsBiliChannel'] || !SETTING['LoginPass']) return;

        var BiliUid = '-1', HGUid = '-1', isRealLogin = false;

        // SDKLoginCB
        let SDKLoginImpl: Il2Cpp.Method | null = null;
        const LoginViewController = AssemblyCSharp.class('Torappu.UI.Login.LoginViewController');
        let LoginViewControllerNestedClasses = LoginViewController.nestedClasses;
        for (let i = 0; i < LoginViewControllerNestedClasses.length; i++) {
            const klass = LoginViewControllerNestedClasses[i];
            if (klass.name.includes('<_SDKLoginImpl>c__AnonStoreyA')) {
                SDKLoginImpl = klass.method('<>m__0');
                break;
            }
        }

        // SDKAuthCB
        let SDKAuthCB: Il2Cpp.Method | null = null;
        let U8ExternalToolsNestedClasses = AssemblyCSharp.class('Torappu.SDK.U8ExternalTools').nestedClasses;
        for (let i = 0; i < U8ExternalToolsNestedClasses.length; i++) {
            const klass = U8ExternalToolsNestedClasses[i];
            if (klass.name.includes('<SendSDKAuthRequest>c__AnonStorey')) {
                SDKAuthCB = klass.method('<>m__0');
                break;
            }
        }

        let UpdateSDKIdAndLogin = LoginViewController.method('_UpdateSDKIdAndLogin');
        let LoginServiceSuccess = LoginViewController.method('_LoginServiceSuccess');

        const Networker = TorappuCommon.class('Torappu.Network.Networker');
        let PostWithProperNetworkUtil = Networker.method('_PostWithProperNetworkUtil');

        const LoginNativeLicense = AssemblyCSharp.class('Torappu.UI.Login.LoginNativeLicense');
        let UseNativeLicense = LoginNativeLicense.method('UseNativeLicense');

        // hook
        Interceptor.attach(Il2CppUtil.getFunctionByAddress(Il2Cpp.module, PostWithProperNetworkUtil.relativeVirtualAddress), {
            onEnter: args => {
                let url = new Il2Cpp.String(args[1]).content as string;
                Logger.logNormal(`Post Url: [1;36m${url}[m`, '[NetworkHook]');
                if (HGUid != "-1" && !url.includes('as.hypergryph.com') && !url.includes('/account/login')) {
                    accountData['Game'][HGUid]['seqnum'] = Networker.method<Il2Cpp.Object>('get_instance').invoke().field<number>('m_latestSucceedSeqNum').value + 1;
                    saveAccountData();
                }
            }
        });

        UseNativeLicense.implementation = function () {
            return false;
        }

        if (SDKLoginImpl) SDKLoginImpl.implementation = function (response: Il2Cpp.String) {
            if (response != undefined) {
                var extension = JSON.parse(response.content as string);
                BiliUid = extension['uid'];
                readAccountData();
                if (BiliUid in accountData['Channel']) {
                    accountData['Channel'][BiliUid]['accessToken'] = extension['access_token'];
                }
                else {
                    accountData['Channel'][BiliUid] = {
                        'accessToken': extension['access_token'],
                        'gameUid': '-1'
                    };
                }
                saveAccountData();
            }
            this.method(SDKLoginImpl?.name as string).invoke(response);
        }

        if (SDKAuthCB) SDKAuthCB.implementation = function (response: Il2Cpp.Object) {
            var code = response.field<number>('responseCode').value;
            Logger.logNormal(`SDK Login with status ${code}.`, '[LoginHook]');
            readAccountData();
            if (code == 400 && accountData['Channel'][BiliUid]['gameUid'] != '-1' && accountData['Channel'][BiliUid]['gameUid'] in accountData['Game']) {
                HGUid = accountData['Channel'][BiliUid]['gameUid'];
                response.field('responseCode').value = 200;
                response.field('text').value = Il2Cpp.string(`{"result":0,"error":"","uid":"${HGUid}","channelUid":${BiliUid},"token":"token","isGuest":0,"extension":"{\\"nickName\\":\\"doctor\\"}"}`);
                response.field('isError').value = false;
                response.field('error').value = ptr(0);
            }
            else if (!response.field<boolean>('isError').value) {
                var resBody = JSON.parse(response.field<Il2Cpp.String>('text').value.content as string);
                BiliUid = resBody['channelUid'].toString();
                HGUid = resBody['uid'];
                accountData['Channel'][BiliUid]['gameUid'] = HGUid;
                saveAccountData();
            }
            this.method(SDKAuthCB?.name as string).invoke(response);
        }

        const LoginResponse = AssemblyCSharp.class('Torappu.LoginResponse');
        const SDKInstLoader = AssemblyCSharp.class('Torappu.SDK.SDKInstLoader');
        UpdateSDKIdAndLogin.implementation = function (uid: Il2Cpp.String, token: Il2Cpp.String) {
            readAccountData();
            if (token.content == 'token') {
                this.method('_UpdateSDKUID').invoke(uid);
                SDKInstLoader.method<Il2Cpp.Object>('get_instance').invoke().method('NotifyU8LoginSucceed').invoke();
                var resBody = Il2CppUtil.instantiate(LoginResponse);
                resBody.field('result').value = 0;
                resBody.field('uid').value = Il2Cpp.string(HGUid);
                var secret = accountData['Game'][HGUid]['secret'];
                var majorVersion;
                if ('majorVersion' in accountData['Game'][HGUid]) {
                    majorVersion = accountData['Game'][HGUid]['majorVersion'];
                }
                else {
                    majorVersion = '326';
                }
                resBody.field('secret').value = Il2Cpp.string(secret);
                resBody.field('majorVersion').value = Il2Cpp.string(majorVersion); // add at v2.2.81
                resBody.field('serviceLicenseVersion').value = 0;
                // resBody.field('playerDataDelta').value = ptr(0); // del at v2.2.81
                var NetworkerInstance = Networker.method<Il2Cpp.Object>('get_instance').invoke();
                var seqnum: number = accountData['Game'][HGUid]['seqnum'];
                NetworkerInstance.field('m_seqNum').value = seqnum;
                NetworkerInstance.field('m_latestSucceedSeqNum').value = seqnum;
                NetworkerInstance.field('m_lastSeqNumFailed').value = 0;
                Alert.invoke(Il2Cpp.string(`使用保存的secret: <color=#FFA532>${secret}</color>`), ptr(0));
                this.method('_LoginServiceSuccess').invoke(resBody);
                isRealLogin = false;
            }
            else {
                this.method('_UpdateSDKIdAndLogin').invoke(uid, token);
                isRealLogin = true;
            }
        }

        LoginServiceSuccess.implementation = function (resBody: Il2Cpp.Object) {
            if (isRealLogin) {
                var uid = resBody.field<Il2Cpp.String>('uid').value.content as string;
                readAccountData();
                var secret = resBody.field<Il2Cpp.String>('secret').value.content;
                var majorVersion = resBody.field<Il2Cpp.String>('majorVersion').value.content;
                if (uid in accountData['Game']) {
                    accountData['Game'][uid]['secret'] = secret;
                    accountData['Game'][uid]['majorVersion'] = majorVersion;
                }
                else {
                    accountData['Game'][uid] = {
                        'secret': secret,
                        'seqnum': 0,
                        'majorVersion': majorVersion
                    };
                }
                saveAccountData();
                Alert.invoke(Il2Cpp.string(`secret已刷新: <color=#37FFC3>${secret}</color>\nmajorVersion: ${majorVersion}`), ptr(0));
            }
            this.method('_LoginServiceSuccess').invoke(resBody);
        }
    }

    /**修改概率*/
    function RandomHook(enable: boolean): void {
        AssemblyCSharp.class('Torappu.RandomExtensions').method<boolean>('Dice').implementation = function (prod) {
            if (enable) {
                return true;
            }
            else {
                return this.method<boolean>('Dice').invoke(prod);
            }
        }
    }

    enum EnemyHudState {
        TranIn,
        On,
        TranOut,
        Off
    }

    namespace EnemyHUD {
        let EnemyHud_Enemy: Il2Cpp.Object;
        let EnemyHud_Group: Il2Cpp.Object;
        let EnemyHud_Obj: Il2Cpp.Object;
        let EnemyHud_Name: Il2Cpp.Object;
        let EnemyHud_ID: Il2Cpp.Object;
        let EnemyHud_Des: Il2Cpp.Object;
        let EnemyHud_Blackboard: Il2Cpp.Object;
        let EnemyHud_Blackboard2: Il2Cpp.Object;
        let EnemyHud_LastTime = new Date().getTime();
        const EnemyHud_TransTime = 300;
        const EnemyHud_ShowTime = 3000;
        const EnemyHud_Alpha = 1;
        let EnemyHud_State = EnemyHudState.Off;

        export function ShowEnemyRoute(enemy: Il2Cpp.Object) {
            let cursor = enemy.method<Il2Cpp.Object>('get_cursor').invoke();
            let route = cursor.method<Il2Cpp.Object>('get_route').invoke();
            let motionMode = route.field<Il2Cpp.Object>('m_data').value.field('motionMode').value;
            let factory = BattleControllerInstance!.method<Il2Cpp.Object>('get_factory').invoke();
            let scheduler = BattleControllerInstance!.method<Il2Cpp.Object>('get_scheduler').invoke();
            let previewCursor = factory?.method<Il2Cpp.Object>('CreatePreviewCursor').invoke(motionMode);
            let snapshot = scheduler?.method<Il2Cpp.ValueType>('TakeSnapshot').invoke();
            previewCursor?.method('Spawn').invoke(route, snapshot, ptr(0), ptr(0));
        }

        export function CreateEnemyHud(UIController: Il2Cpp.Object) {
            EnemyHud_Obj = Il2CppUtil.instantiate(GameObject, Il2Cpp.string('EnemyInfoPanel(Clone)'));
            EnemyHud_Obj.method<Il2Cpp.Object>('get_transform').invoke().method('SetParent').invoke(UIController.method<Il2Cpp.Object>('get_groupStatic').invoke());
            let EnemyHud_Panel = EnemyHud_Obj.method<Il2Cpp.Object>('AddComponent').invoke(UnityEngineUI.class('UnityEngine.UI.Image').type.object);
            EnemyHud_Group = EnemyHud_Obj.method<Il2Cpp.Object>('AddComponent').invoke(UnityEngineUIModule.class('UnityEngine.CanvasGroup').type.object);
            let rect = EnemyHud_Obj.method<Il2Cpp.Object>('GetComponent').invoke(UnityEngineCoreModule.class('UnityEngine.RectTransform').type.object);
            rect.method('set_localScale').invoke(Vector3.method<Il2Cpp.ValueType>('get_one').invoke());
            rect.method('set_anchorMin').invoke(Vector2.method<Il2Cpp.ValueType>('get_one').invoke());
            rect.method('set_anchorMax').invoke(Vector2.method<Il2Cpp.ValueType>('get_one').invoke());
            rect.method('set_anchoredPosition3D').invoke(Il2CppUtil.instantiate(Vector3, -280, -300, 0).unbox());
            rect.method('set_sizeDelta').invoke(Il2CppUtil.instantiate(Vector2, 720, 250).unbox());;
            EnemyHud_Panel.method('set_color').invoke(Il2CppUtil.instantiateOverload(Color,
                ['System.Single', 'System.Single', 'System.Single', 'System.Single'],
                0, 0, 0, 0.6).unbox());
            EnemyHud_Group.method('set_blocksRaycasts').invoke(false);
            EnemyHud_Group.method('set_alpha').invoke(0);

            let EnemyHud_Image_obj: Il2Cpp.Object = Il2CppUtil.instantiate(UnityEngineCoreModule.class('UnityEngine.GameObject'), Il2Cpp.string('EnemyImage'));
            EnemyHud_Image_obj.method<Il2Cpp.Object>('get_transform').invoke().method('SetParent').invoke(EnemyHud_Obj.method<Il2Cpp.Object>('get_transform').invoke());
            let EnemyHud_Image = EnemyHud_Image_obj.method<Il2Cpp.Object>('AddComponent').invoke(UnityEngineUI.class('UnityEngine.UI.Image').type.object);
            let EnemyHud_Image_rect = EnemyHud_Image_obj.method<Il2Cpp.Object>('GetComponent').invoke(UnityEngineCoreModule.class('UnityEngine.RectTransform').type.object);
            EnemyHud_Image_rect.method('set_localScale').invoke(Vector3.method<Il2Cpp.ValueType>('get_one').invoke());
            EnemyHud_Image_rect.method('set_anchoredPosition3D').invoke(Il2CppUtil.instantiate(Vector3, -55, 0, 0).unbox());
            EnemyHud_Image_rect.method('set_sizeDelta').invoke(Il2CppUtil.instantiate(Vector2, 1, 250).unbox());
            EnemyHud_Image.method('set_color').invoke(Il2CppUtil.instantiateOverload(Color,
                ['System.Single', 'System.Single', 'System.Single', 'System.Single'],
                0, 0, 0, 0.5).unbox());

            let EnemyHud_Name_obj: Il2Cpp.Object = Il2CppUtil.instantiate(UnityEngineCoreModule.class('UnityEngine.GameObject'), Il2Cpp.string('EnemyName'));
            EnemyHud_Name_obj.method<Il2Cpp.Object>('get_transform').invoke().method('SetParent').invoke(EnemyHud_Obj.method<Il2Cpp.Object>('get_transform').invoke());
            EnemyHud_Name = EnemyHud_Name_obj.method<Il2Cpp.Object>('AddComponent').invoke(UnityEngineUI.class('UnityEngine.UI.Text').type.object);
            let EnemyHud_Name_rect = EnemyHud_Name_obj.method<Il2Cpp.Object>('GetComponent').invoke(UnityEngineCoreModule.class('UnityEngine.RectTransform').type.object);
            EnemyHud_Name_rect.method('set_localScale').invoke(Vector3.method<Il2Cpp.ValueType>('get_one').invoke());
            EnemyHud_Name_rect.method('set_anchoredPosition3D').invoke(Il2CppUtil.instantiate(Vector3, 95, 90, 0).unbox());
            EnemyHud_Name_rect.method('set_sizeDelta').invoke(Il2CppUtil.instantiate(Vector2, 260, 45).unbox());
            EnemyHud_Name.method('set_font').invoke(globalFont);
            EnemyHud_Name.method('set_fontSize').invoke(36);
            EnemyHud_Name.method('set_text').invoke(Il2Cpp.string('敌人名字'));
            EnemyHud_Name.field('m_Color').value = Il2CppUtil.instantiateOverload(Color,
                ['System.Single', 'System.Single', 'System.Single', 'System.Single'],
                0.8, 0.2, 0, 1).unbox();

            let EnemyHud_ID_obj: Il2Cpp.Object = Il2CppUtil.instantiate(UnityEngineCoreModule.class('UnityEngine.GameObject'), Il2Cpp.string('EnemyID'));
            EnemyHud_ID_obj.method<Il2Cpp.Object>('get_transform').invoke().method('SetParent').invoke(EnemyHud_Obj.method<Il2Cpp.Object>('get_transform').invoke());
            EnemyHud_ID = EnemyHud_ID_obj.method<Il2Cpp.Object>('AddComponent').invoke(UnityEngineUI.class('UnityEngine.UI.Text').type.object);
            let EnemyHud_ID_rect = EnemyHud_ID_obj.method<Il2Cpp.Object>('GetComponent').invoke(UnityEngineCoreModule.class('UnityEngine.RectTransform').type.object);
            EnemyHud_ID_rect.method('set_localScale').invoke(Vector3.method<Il2Cpp.ValueType>('get_one').invoke());
            EnemyHud_ID_rect.method('set_anchoredPosition3D').invoke(Il2CppUtil.instantiate(Vector3, 95, 60, 0).unbox());
            EnemyHud_ID_rect.method('set_sizeDelta').invoke(Il2CppUtil.instantiate(Vector2, 260, 20).unbox());
            EnemyHud_ID.method('set_font').invoke(globalFont);
            EnemyHud_ID.method('set_fontSize').invoke(16);
            EnemyHud_ID.method('set_text').invoke(Il2Cpp.string('enemy_1xxx_xxxxx_2'));
            EnemyHud_ID.field('m_Color').value = Il2CppUtil.instantiateOverload(Color,
                ['System.Single', 'System.Single', 'System.Single', 'System.Single'],
                0.2, 0.2, 0.2, 1).unbox();

            let EnemyHud_Des_obj: Il2Cpp.Object = Il2CppUtil.instantiate(UnityEngineCoreModule.class('UnityEngine.GameObject'), Il2Cpp.string('EnemyDes'));
            EnemyHud_Des_obj.method<Il2Cpp.Object>('get_transform').invoke().method('SetParent').invoke(EnemyHud_Obj.method<Il2Cpp.Object>('get_transform').invoke());
            EnemyHud_Des = EnemyHud_Des_obj.method<Il2Cpp.Object>('AddComponent').invoke(UnityEngineUI.class('UnityEngine.UI.Text').type.object);
            let EnemyHud_Des_rect = EnemyHud_Des_obj.method<Il2Cpp.Object>('GetComponent').invoke(UnityEngineCoreModule.class('UnityEngine.RectTransform').type.object);
            EnemyHud_Des_rect.method('set_localScale').invoke(Vector3.method<Il2Cpp.ValueType>('get_one').invoke());
            EnemyHud_Des_rect.method('set_anchoredPosition3D').invoke(Il2CppUtil.instantiate(Vector3, 120, -30, 0).unbox());
            EnemyHud_Des_rect.method('set_sizeDelta').invoke(Il2CppUtil.instantiate(Vector2, 310, 130).unbox());
            EnemyHud_Des.method('set_font').invoke(globalFont);
            EnemyHud_Des.method('set_fontSize').invoke(16);
            EnemyHud_Des.method('set_text').invoke(Il2Cpp.string('敌人描述'));
            EnemyHud_Des.field('m_Color').value = Il2CppUtil.instantiateOverload(Color,
                ['System.Single', 'System.Single', 'System.Single', 'System.Single'],
                1, 1, 1, 1).unbox();

            let EnemyHud_Blackboard_obj: Il2Cpp.Object = Il2CppUtil.instantiate(UnityEngineCoreModule.class('UnityEngine.GameObject'), Il2Cpp.string('EnemyBlackboard'));
            EnemyHud_Blackboard_obj.method<Il2Cpp.Object>('get_transform').invoke().method('SetParent').invoke(EnemyHud_Obj.method<Il2Cpp.Object>('get_transform').invoke());
            EnemyHud_Blackboard = EnemyHud_Blackboard_obj.method<Il2Cpp.Object>('AddComponent').invoke(UnityEngineUI.class('UnityEngine.UI.Text').type.object);
            let EnemyHud_Blackboard_rect = EnemyHud_Blackboard_obj.method<Il2Cpp.Object>('GetComponent').invoke(UnityEngineCoreModule.class('UnityEngine.RectTransform').type.object);
            EnemyHud_Blackboard_rect.method('set_localScale').invoke(Vector3.method<Il2Cpp.ValueType>('get_one').invoke());
            EnemyHud_Blackboard_rect.method('set_anchoredPosition3D').invoke(Il2CppUtil.instantiate(Vector3, -220, 0, 0).unbox());
            EnemyHud_Blackboard_rect.method('set_sizeDelta').invoke(Il2CppUtil.instantiate(Vector2, 230, 220).unbox());
            EnemyHud_Blackboard.method('set_font').invoke(globalFont);
            EnemyHud_Blackboard.method('set_fontSize').invoke(18);
            EnemyHud_Blackboard.method('set_text').invoke(Il2Cpp.string(
                `攻击 <color=#D63A00>6756</color>
防御 <color=#D63A00>233</color>
法抗 <color=#D63A00>222</color>
阻挡 <color=#66CCFF>222</color>
消耗目标数量 <color=#66CCFF>2</color>
阻挡干员 <color=#00B035>干员名字</color>
当前目标 <color=#66CCFF>单位名字</color>
坐标 <color=#66CCFF>(2.342,4.211)</color>`));
            EnemyHud_Blackboard.field('m_Color').value = Il2CppUtil.instantiateOverload(Color,
                ['System.Single', 'System.Single', 'System.Single', 'System.Single'],
                1, 1, 1, 1).unbox();

            let EnemyHud_Blackboard2_obj: Il2Cpp.Object = Il2CppUtil.instantiate(UnityEngineCoreModule.class('UnityEngine.GameObject'), Il2Cpp.string('EnemyBlackboard2'));
            EnemyHud_Blackboard2_obj.method<Il2Cpp.Object>('get_transform').invoke().method('SetParent').invoke(EnemyHud_Obj.method<Il2Cpp.Object>('get_transform').invoke());
            EnemyHud_Blackboard2 = EnemyHud_Blackboard2_obj.method<Il2Cpp.Object>('AddComponent').invoke(UnityEngineUI.class('UnityEngine.UI.Text').type.object);
            let EnemyHud_Blackboard2_rect = EnemyHud_Blackboard2_obj.method<Il2Cpp.Object>('GetComponent').invoke(UnityEngineCoreModule.class('UnityEngine.RectTransform').type.object);
            EnemyHud_Blackboard2_rect.method('set_localScale').invoke(Vector3.method<Il2Cpp.ValueType>('get_one').invoke());
            EnemyHud_Blackboard2_rect.method('set_anchoredPosition3D').invoke(Il2CppUtil.instantiate(Vector3, -120, 0, 0).unbox());
            EnemyHud_Blackboard2_rect.method('set_sizeDelta').invoke(Il2CppUtil.instantiate(Vector2, 120, 220).unbox());
            EnemyHud_Blackboard2.method('set_font').invoke(globalFont);
            EnemyHud_Blackboard2.method('set_fontSize').invoke(18);
            EnemyHud_Blackboard2.method('set_text').invoke(Il2Cpp.string(
                `移速 <color=#66CCFF>3.0</color>
攻速 <color=#66CCFF>222</color>
重量 <color=#66CCFF>7</color>
失衡免疫 <color=#66CCFF>是</color>`));
            EnemyHud_Blackboard2.field('m_Color').value = Il2CppUtil.instantiateOverload(Color,
                ['System.Single', 'System.Single', 'System.Single', 'System.Single'],
                1, 1, 1, 1).unbox();

            EnemyHud_Obj.method('SetActive').invoke(false);
            EnemyHud_State = EnemyHudState.Off;
        }

        export function UpdateEnemyHudData() {
            if (EnemyHud_Enemy.isNull() || !EnemyHud_Enemy.method<boolean>('get_alive').invoke()) {
                EnemyHud_Blackboard.method('set_text').invoke(Il2Cpp.string('敌人已死亡'));
                EnemyHud_Blackboard2.method('set_text').invoke(ptr(0));
            } else {
                let ability = EnemyHud_Enemy.method<Il2Cpp.Object>('get_attackAbilityCasted').invoke();
                let abname = '无'
                let targetNames = '无'
                if (!ability.isNull()) {
                    abname = ability.method<Il2Cpp.String>('get_searchName').invoke().content as string;
                    let targets = ability.method<Il2Cpp.Object>('get_castTargets').invoke();
                    let targetArray = targets.method<Il2Cpp.Array<Il2Cpp.ValueType>>('ToArray').invoke();
                    if (targetArray.length > 0) {
                        let tsn = Array<string>(targetArray.length);
                        for (let index = 0; index < targetArray.length; index++) {
                            let obj = targetArray.get(index).field('obj').value as Il2Cpp.Object;
                            if (AssemblyCSharp.class('Torappu.Battle.Character').type.object.method<boolean>('IsAssignableFrom').invoke(obj.class.type.object)) {
                                tsn[index] = CharacterUtil.method<Il2Cpp.String>('GetCharName').invoke(obj.method<Il2Cpp.String>('get_characterId').invoke()).content as string;
                            } else {
                                tsn[index] = obj.method<Il2Cpp.String>('get_id').invoke().content as string;
                            }
                        }
                        targetNames = tsn.join('  ')
                    }
                }
                let pos = UnityUtil.vector2ToTuple(EnemyHud_Enemy.method<Il2Cpp.ValueType>('get_footMapPosition').invoke());
                let blocker = EnemyHud_Enemy.method<Il2Cpp.Object>('get_blocker').invoke();
                EnemyHud_Blackboard.method('set_text').invoke(Il2Cpp.string(
                    `攻击 <color=#D63A00>${EnemyHud_Enemy.method<Il2Cpp.ValueType>('get_atk').invoke().box().method<number>('AsFloat').invoke().toFixed(2)}</color>
防御 <color=#D63A00>${EnemyHud_Enemy.method<Il2Cpp.ValueType>('get_def').invoke().box().method<number>('AsFloat').invoke().toFixed(2)}</color>
法抗 <color=#D63A00>${EnemyHud_Enemy.method<Il2Cpp.ValueType>('get_magicResistance').invoke().box().method<number>('AsFloat').invoke().toFixed(2)}</color>
阻挡 <color=#66CCFF>${EnemyHud_Enemy.method<number>('get_blockVolume').invoke()}</color>
剩余距离 <color=#66CCFF>${EnemyHud_Enemy.method<number>('get_distToExit').invoke().toFixed(3)}</color>
阻挡干员 <color=#00B035>${blocker.isNull() ? '无阻挡' : CharacterUtil.method<Il2Cpp.String>('GetCharName').invoke(blocker.method<Il2Cpp.String>('get_characterId').invoke()).content}</color>
坐标 <color=#66CCFF>(${pos[0].toFixed(2)}, ${pos[1].toFixed(2)})</color>
当前技能 <color=#FF4000>${abname}</color>
技能目标 <color=#FF4000>${targetNames}</color>`));
                EnemyHud_Blackboard2.method('set_text').invoke(Il2Cpp.string(
                    `移速 <color=#66CCFF>${EnemyHud_Enemy.method<number>('get_moveSpeed').invoke().toFixed(3)}</color>
攻速 <color=#66CCFF>${(EnemyHud_Enemy.method<Il2Cpp.ValueType>('get_baseAttackTime').invoke().box().method<number>('AsFloat').invoke() * 100 / EnemyHud_Enemy.method<Il2Cpp.ValueType>('get_attackSpeed').invoke().box().method<number>('AsFloat').invoke()).toFixed(3)}</color>
重量 <color=#66CCFF>${EnemyHud_Enemy.method<number>('get_massLevel').invoke()}</color>
目标点 <color=#66CCFF>${EnemyHud_Enemy.method<number>('get_lifePointReduce').invoke()}</color>`));
            }
        }

        export function UpdateEnemyHud() {
            let t = new Date().getTime();
            switch (EnemyHud_State) {
                case EnemyHudState.TranIn:
                    if (t - EnemyHud_LastTime >= EnemyHud_TransTime) {
                        EnemyHud_State = EnemyHudState.On
                        EnemyHud_Group.method('set_alpha').invoke(EnemyHud_Alpha);
                    } else {
                        EnemyHud_Group.method('set_alpha').invoke(EnemyHud_Alpha * (t - EnemyHud_LastTime) / EnemyHud_TransTime);
                    }
                    UpdateEnemyHudData();
                    break;
                case EnemyHudState.On:
                    if (t - EnemyHud_LastTime >= EnemyHud_ShowTime) {
                        EnemyHud_State = EnemyHudState.TranOut
                        EnemyHud_LastTime = new Date().getTime();
                    }
                    UpdateEnemyHudData();
                    break;
                case EnemyHudState.TranOut:
                    if (t - EnemyHud_LastTime >= EnemyHud_TransTime) {
                        EnemyHud_State = EnemyHudState.Off
                        EnemyHud_Group.method('set_alpha').invoke(0);
                        EnemyHud_Obj.method('SetActive').invoke(false);
                    } else {
                        EnemyHud_Group.method('set_alpha').invoke(EnemyHud_Alpha * (1 - (t - EnemyHud_LastTime) / EnemyHud_TransTime));
                    }
                    UpdateEnemyHudData();
                    break;
            }
        }

        export function SetEnemyHud(enemy: Il2Cpp.Object) {
            OnUIEntrance();
            if (EnemyHud_Enemy != undefined && !EnemyHud_Enemy.isNull() && enemy.method<number>('get_instanceUid').invoke() != EnemyHud_Enemy.method<number>('get_instanceUid').invoke()) {
                hasPlay = false;
            }
            EnemyHud_Enemy = enemy;
            let edata = enemy.method<Il2Cpp.Object>('get_data').invoke();
            let eid = edata.field('key').value as Il2Cpp.String
            EnemyHud_ID.method('set_text').invoke(eid);
            EnemyHud_Name.method('set_text').invoke(edata.field('name').value);
            EnemyHud_Des.method('set_text').invoke(FormatUtil.method<Il2Cpp.String>('FormatRichTextFromData').invoke(edata.field('description').value));
            if (EnemyHud_State == EnemyHudState.Off) {
                EnemyHud_State = EnemyHudState.TranIn
                EnemyHud_LastTime = new Date().getTime();
                EnemyHud_Obj.method('SetActive').invoke(true);
                //log('Off -> In')
            } else if (EnemyHud_State == EnemyHudState.TranOut) {
                EnemyHud_State = EnemyHudState.TranIn
                let t = new Date().getTime();
                EnemyHud_LastTime = 2 * t - EnemyHud_TransTime - EnemyHud_LastTime;
                //log('TranOut -> In')
            } else if (EnemyHud_State == EnemyHudState.On) {
                EnemyHud_LastTime = new Date().getTime();
            }
            if (!hasPlay) {
                ShowEnemyRoute(enemy);
                hasPlay = true;
            }
        }

        let EnemyHud_Enemy_Color = false, EnemyHud_Enemy_FingerId: number = -1;

        export function UpdateEnemyClick(scheduler: Il2Cpp.Object) {
            if (Input.method<number>('get_touchCount').invoke() > 0) {
                let t = Input.method<Il2Cpp.ValueType>('GetTouch').invoke(0);

                if (t.field('m_Phase').value.toString() == 'Began' && GetKey.invoke(VISABLE)) {
                    let pos = UnityUtil.vector2ToTuple(t.field('m_Position').value as Il2Cpp.ValueType)
                    let ray = Camera.method<Il2Cpp.Object>('get_main').invoke()
                        .method<Il2Cpp.ValueType>('ScreenPointToRay').invoke(Il2CppUtil.instantiate(Vector3, pos[0], pos[1], 0).unbox()).box();
                    let origin = UnityUtil.vector3ToTuple(ray.method<Il2Cpp.ValueType>('get_origin').invoke());
                    let direction = UnityUtil.vector3ToTuple(ray.method<Il2Cpp.ValueType>('get_direction').invoke());
                    function culDis(x: number, y: number, z: number): number {
                        let n = (z - origin[2]) / direction[2]
                        return (origin[0] + direction[0] * n - x) ** 2 + (origin[1] + direction[1] * n - y) ** 2
                    }
                    let enemies = scheduler.field('m_managedFinalEnemies').value as Il2Cpp.Object;
                    let minDis = Number.MAX_VALUE;
                    let curEnemy: Il2Cpp.Object | null = null;
                    for (let index = 0; index < enemies.method<number>('get_Count').invoke(); index++) {
                        let enemy = enemies.method<Il2Cpp.Object>('get_Item').invoke(index);
                        let pos = UnityUtil.vector3ToTuple(enemy.method<Il2Cpp.Object>('get_transform').invoke().method<Il2Cpp.ValueType>('get_position').invoke())
                        let dis = culDis(pos[0], pos[1], pos[2])
                        if (dis < 0.25 && dis < minDis) {
                            curEnemy = enemy
                        }
                    }
                    if (curEnemy != null) {
                        EnemyHud_Enemy_FingerId = t.field('m_FingerId').value as number;
                        if (EnemyHud_Enemy_Color) {
                            if (!EnemyHud_Enemy.isNull()) {
                                EnemyHud_Enemy.method('set_color').invoke(EnemyHud_Enemy.method<Il2Cpp.ValueType>('get_defaultBodyColor').invoke());
                                EnemyHud_Enemy_Color = false;
                            }
                        }
                        SetEnemyHud(curEnemy);
                        EnemyHud_Enemy.method('set_color').invoke(Il2CppUtil.instantiateOverload(Color,
                            ['System.Single', 'System.Single', 'System.Single', 'System.Single'],
                            0, 1, 1, 1).unbox());
                        EnemyHud_Enemy_Color = true;
                    }
                }
                else if ((t.field('m_Phase').value.toString() == 'Stationary' || t.field('m_Phase').value.toString() == 'Moved') && (t.field('m_FingerId').value as number) == EnemyHud_Enemy_FingerId && !EnemyHud_Enemy.isNull()) {
                    if (EnemyHud_State == EnemyHudState.Off) {
                        EnemyHud_State = EnemyHudState.TranIn
                        EnemyHud_LastTime = new Date().getTime();
                    } else if (EnemyHud_State == EnemyHudState.TranOut) {
                        EnemyHud_State = EnemyHudState.TranIn
                        let t = new Date().getTime();
                        EnemyHud_LastTime = 2 * t - EnemyHud_TransTime - EnemyHud_LastTime;
                    } else if (EnemyHud_State == EnemyHudState.On) {
                        EnemyHud_LastTime = new Date().getTime();
                    }
                    EnemyHud_Enemy.method('set_color').invoke(Il2CppUtil.instantiateOverload(Color,
                        ['System.Single', 'System.Single', 'System.Single', 'System.Single'],
                        0, 1, 1, 1).unbox());
                    EnemyHud_Enemy_Color = true;
                } else if (EnemyHud_Enemy_Color) {
                    if (!EnemyHud_Enemy.isNull()) {
                        EnemyHud_Enemy.method('set_color').invoke(EnemyHud_Enemy.method<Il2Cpp.ValueType>('get_defaultBodyColor').invoke());
                        EnemyHud_Enemy_Color = false;
                        EnemyHud_Enemy_FingerId = -1;
                    }
                }
            }
        }
    }

    function TASHook(): void {
        if (!SETTING.EnableTAS) return
        enum State {
            Ctor,
            Playing,
            NotPlaying,
        }
        enum TasMode {
            Normal, // 正常 - c
            SingleFrame, // 单帧 - 1
            DoubleFrame, // 双帧 - 2
            PlayingOnDown, // 按下时 - r
            PlayingOnUp, // 抬起时 - f
        }
        var state = State.NotPlaying;
        var tasMode = TasMode.Normal;

        const Torappu_Battle_BattleController = AssemblyCSharp.class('Torappu.Battle.BattleController');
        const Torappu_Battle_UI_UIController = AssemblyCSharp.class('Torappu.Battle.UI.UIController');

        const get_fixedPlayTime = Torappu_Battle_BattleController.method<Il2Cpp.ValueType>('get_fixedPlayTime');
        const get_fixedFrameCnt = Torappu_Battle_BattleController.method<number>('get_fixedFrameCnt');
        const BattleControllerCtor = Torappu_Battle_BattleController.method('Awake');
        const UIControllerCtor = Torappu_Battle_UI_UIController.method('Awake');

        var get_isPaused: Il2Cpp.Method<boolean>, get_isPlaying: Il2Cpp.Method<boolean>, SetPaused: Il2Cpp.Method<Il2Cpp.Method.ReturnType>, set_speedLevel: Il2Cpp.Method, set_timeScale: Il2Cpp.Method, OnSpeedLevelChanged: Il2Cpp.Method;
        Interceptor.attach(Il2CppUtil.getFunctionByAddress(Il2Cpp.module, BattleControllerCtor.relativeVirtualAddress), {
            onEnter: args => {
                BattleControllerInstance = new Il2Cpp.Object(args[0]);
                set_speedLevel = BattleControllerInstance.method('set_speedLevel');
                set_timeScale = BattleControllerInstance.method('set_timeScale');
                get_isPlaying = BattleControllerInstance.method<boolean>('get_isPlaying');
                OnSpeedLevelChanged = BattleControllerInstance.method('_OnSpeedLevelChanged');
                /*BattleControllerInstance.method('OnEnemyReachedExit').implementation = function (enemy) {
                    log("Enemy exit.");
                };*/
            }
        });

        var set_time_text: Il2Cpp.Method | null = null, set_frameCount_text: Il2Cpp.Method | null = null;
        Interceptor.attach(Il2CppUtil.getFunctionByAddress(Il2Cpp.module, UIControllerCtor.relativeVirtualAddress), {
            onEnter: args => {
                UIControllerInstance = new Il2Cpp.Object(args[0]);
                get_isPaused = UIControllerInstance.method<boolean>('get_isPaused');
                SetPaused = UIControllerInstance.method('SetPaused');
                state = State.Ctor;
                if (SETTING['PP']) PPHook();
                EnemyHUD.CreateEnemyHud(UIControllerInstance);
                if (SETTING['ShowBattleTimeInfo']) {
                    let shower = Il2CppUtil.instantiate(UnityEngineCoreModule.class('UnityEngine.GameObject'), Il2Cpp.string('TimeShower (Clone)'));
                    let groupStatic = UIControllerInstance.method<Il2Cpp.Object>('get_groupStatic').invoke()
                    shower.method<Il2Cpp.Object>('get_transform').invoke().method('SetParent').invoke(groupStatic);
                    let text = shower.method<Il2Cpp.Object>('AddComponent').invoke(UnityEngineUI.class('UnityEngine.UI.Text').type.object);
                    let rect = shower.method<Il2Cpp.Object>('GetComponent').invoke(UnityEngineCoreModule.class('UnityEngine.RectTransform').type.object);
                    rect.method('set_anchoredPosition3D').invoke(Il2CppUtil.instantiate(Vector3, -550, 480, 0).unbox());
                    rect.method('set_localScale').invoke(Vector3.method<Il2Cpp.ValueType>('get_one').invoke());
                    rect.method('set_sizeDelta').invoke(Il2CppUtil.instantiate(Vector2, 400, 50).unbox());
                    //let font = UnityEngineCoreModule.class('UnityEngine.Resources').method<Il2Cpp.Object>('GetBuiltinResource').invoke(Il2Cpp.domain.assembly('UnityEngine.TextRenderingModule').image.class('UnityEngine.Font').type.object, Il2Cpp.string('Arial.ttf'));
                    text.method('set_font').invoke(globalFont);
                    text.method('set_fontSize').invoke(30);
                    set_time_text = text.method('set_text');
                    set_time_text.invoke(Il2Cpp.string('战斗时间轴: 0.000s'));
                    let shower2 = Il2CppUtil.instantiate(UnityEngineCoreModule.class('UnityEngine.GameObject'), Il2Cpp.string('FrameShower (Clone)'));
                    shower2.method<Il2Cpp.Object>('get_transform').invoke().method('SetParent').invoke(groupStatic);
                    let text2 = shower2.method<Il2Cpp.Object>('AddComponent').invoke(UnityEngineUI.class('UnityEngine.UI.Text').type.object);
                    let rect2 = shower2.method<Il2Cpp.Object>('GetComponent').invoke(UnityEngineCoreModule.class('UnityEngine.RectTransform').type.object);
                    rect2.method('set_anchoredPosition3D').invoke(Il2CppUtil.instantiate(Vector3, -550, 430, 0).unbox());
                    rect2.method('set_localScale').invoke(Vector3.method<Il2Cpp.ValueType>('get_one').invoke());
                    rect2.method('set_sizeDelta').invoke(Il2CppUtil.instantiate(Vector2, 400, 50).unbox());
                    text2.method('set_font').invoke(globalFont);
                    text2.method('set_fontSize').invoke(30);
                    set_frameCount_text = text2.method('set_text');
                    set_frameCount_text.invoke(Il2Cpp.string('Tick计数: 0 tick'));
                }
            }
        });

        const OnDestroy = Torappu_Battle_BattleController.method('OnDestroy')
        Interceptor.attach(Il2CppUtil.getFunctionByAddress(Il2Cpp.module, OnDestroy.relativeVirtualAddress), {
            onLeave: retval => {
                BattleControllerInstance = null;
                state = State.NotPlaying;
            }
        });

        const StartGame = Torappu_Battle_BattleController.method('StartGame')
        Interceptor.attach(Il2CppUtil.getFunctionByAddress(Il2Cpp.module, StartGame.relativeVirtualAddress), {
            onLeave: retval => {
                state = State.Playing;
                switch (tasMode) {
                    case TasMode.SingleFrame:
                    case TasMode.DoubleFrame:
                    case TasMode.PlayingOnDown:
                        SetPaused.invoke(true, false, false);
                        OnUIClick();
                }
            }
        })

        const SpeedLevel = AssemblyCSharp.class('Torappu.Battle.SpeedLevel');
        const Update = Torappu_Battle_BattleController.method('Update')
        var frameCount = 0;
        Interceptor.attach(Il2CppUtil.getFunctionByAddress(Il2Cpp.module, Update.relativeVirtualAddress), {
            onLeave: retval => {
                if (GetKeyDown.invoke(Normal)) {
                    tasMode = TasMode.Normal;
                    //send('正常模式');
                }
                else if (GetKeyDown.invoke(SingleFrame)) {
                    tasMode = TasMode.SingleFrame;
                    SetPaused.invoke(true, false, false);
                    OnUIClick();
                    //send('SetPaused', [1]);
                    //send('单帧模式');
                }
                else if (GetKeyDown.invoke(DoubleFrame)) {
                    tasMode = TasMode.DoubleFrame;
                    frameCount = 0;
                    SetPaused.invoke(true, false, false);
                    OnUIClick();
                    //send('SetPaused', [1]);
                    //send('双帧模式');
                }
                else if (GetKeyDown.invoke(PlayingOnDown)) {
                    tasMode = TasMode.PlayingOnDown;
                    SetPaused.invoke(true, false, false);
                    OnUIClick();
                    //send('SetPaused', [1]);
                    //send('按下时');
                }
                else if (GetKeyDown.invoke(PlayingOnUp)) {
                    tasMode = TasMode.PlayingOnUp;
                    SetPaused.invoke(false, false, false);
                    //send('SetPaused', [0]);
                    //send('抬起时');
                }
                let isRun = BattleControllerInstance != null && get_isPlaying.invoke();
                if (isRun) {
                    switch (tasMode) {
                        case TasMode.SingleFrame:
                            if (!get_isPaused.invoke()) {
                                SetPaused.invoke(true, false, false);
                                OnUIClick();
                                //send('SetPaused', [1]);
                            }
                            break;
                        case TasMode.DoubleFrame:
                            if (!get_isPaused.invoke()) {
                                if (frameCount > 0) {
                                    frameCount = 0;
                                    SetPaused.invoke(true, false, false);
                                    OnUIClick();
                                    //send('SetPaused', [1]);
                                }
                                else {
                                    frameCount++;
                                }
                            }
                            break;
                    }
                    if (SETTING['ShowBattleTimeInfo']) {
                        set_time_text?.invoke(Il2Cpp.string('战斗时间轴: ' + get_fixedPlayTime.invoke().box().method<number>('AsFloat').invoke().toFixed(3).toString() + 's'));
                        set_frameCount_text?.invoke(Il2Cpp.string('Tick计数: ' + get_fixedFrameCnt.invoke().toString() + ' tick'));
                    }
                    //send('Time', get_fixedPlayTime.invoke().handle.readByteArray(8));
                }
                if (GetKeyDown.invoke(CONTROL) && isRun) {
                    switch (tasMode) {
                        case TasMode.Normal:
                            let s = !get_isPaused.invoke()
                            SetPaused.invoke(s, false, false);
                            if (s) OnUIClick();
                            //send('SetPaused', [s ? 1 : 0]);
                            break;
                        case TasMode.SingleFrame:
                        case TasMode.DoubleFrame:
                        case TasMode.PlayingOnDown:
                            SetPaused.invoke(false, false, false);
                            //send('SetPaused', [0]);
                            break;
                        case TasMode.PlayingOnUp:
                            SetPaused.invoke(true, false, false);
                            OnUIClick();
                            //send('SetPaused', [1]);
                            break;
                    }
                }
                if (GetKeyUp.invoke(CONTROL) && isRun) {
                    switch (tasMode) {
                        case TasMode.PlayingOnDown:
                            SetPaused.invoke(true, false, false);
                            OnUIClick();
                            //send('SetPaused', [1]);
                            break;
                        case TasMode.PlayingOnUp:
                            SetPaused.invoke(false, false, false);
                            //send('SetPaused', [0]);
                            break;
                    }
                }
                if (GetKeyDown.invoke(THREE) && SETTING['SpeedLevel3']) {
                    set_speedLevel.invoke(SpeedLevel.field('SUPER_FAST').value);
                }
                if (GetKeyDown.invoke(FOUR) && SETTING['SpeedLevel16']) {
                    set_timeScale.invoke(16);
                    OnSpeedLevelChanged.invoke(SpeedLevel.field('SUPER_FAST').value);
                }
                if (isRun && !get_isPaused.invoke() && hasPlay) {
                    hasPlay = false;
                }
                EnemyHUD.UpdateEnemyClick(BattleControllerInstance?.method<Il2Cpp.Object>('get_scheduler').invoke() as Il2Cpp.Object);
                EnemyHUD.UpdateEnemyHud();
            }
        })
    }

    function CustomMapHook(): void {
        let LevelUtils = AssemblyCSharp.class('Torappu.Battle.LevelUtils');
        let LevelData = AssemblyCSharp.class('Torappu.LevelData');
        let JsonConvert = NewtonsoftJson.class('Newtonsoft.Json.JsonConvert')
        LevelUtils.method<Il2Cpp.Object>('LoadLevel').implementation = function (levelId: Il2Cpp.String) {
            let levelData;
            Logger.logDebug(levelId.content);
            if (levelId.content?.includes('level_main_07-13')) {
                //Il2Cpp.installExceptionListener("current");
                var leveldataStr = FileUtil.readFile('/storage/emulated/0/$MuMu共享文件夹/level_custom.json');
                levelData = JsonConvert.method<Il2Cpp.Object>('DeserializeObject', 3).invoke(leveldataStr, LevelData.type.object, ptr(0));
                levelData.field('levelId').value = levelId;
            }
            else {
                levelData = this.method<Il2Cpp.Object>('LoadLevel').invoke(levelId);
            }
            return levelData;
        }
        let AssetBundle = UnityEngineCoreModule.class('UnityEngine.AssetBundle')
        Interceptor.attach(Il2CppUtil.getFunctionByAddress(Il2Cpp.module, AssetBundle.method('LoadFromFile').overload('System.String').relativeVirtualAddress), {
            onEnter: args => {
                let path = new Il2Cpp.String(args[1]).content as string;
                let s = 'scenes/obt/main/level_main_07-13/level_main_07-13.ab';
                if (path.includes(s)) {
                    Logger.logDebug('Loading scene')
                    //Il2Cpp.installExceptionListener("all");
                    args[1] = Il2Cpp.string('/storage/emulated/0/$MuMu共享文件夹/level_custom-fixed.unity3d').handle;
                }
                //Logger.logDebug();
            }
        });
    }

    function dumpFlatBufferHook() {
        function SerializeObject(obj: Il2Cpp.Object) {
            let JsonConvert = NewtonsoftJson.class('Newtonsoft.Json.JsonConvert')
            let JsonSerializerSettings = NewtonsoftJson.class('Newtonsoft.Json.JsonSerializerSettings')
            let setting = Il2CppUtil.instantiate(JsonSerializerSettings);
            let converters = setting.method<Il2Cpp.Object>('get_Converters').invoke(); // System.Collections.Generic.List`1[Newtonsoft.Json.JsonConverter]
            [
                'Torappu.BlackboardConverter',
                'Torappu.ListDictConverter',
                'Torappu.ObscuredFloatConverter',
                'Torappu.ObscuredIntConverter',
                //'Torappu.DateTimeJsonConverter',
                //'Torappu.BoolToIntJsonConverter',
            ].forEach(cls => converters.method('Add').invoke(Il2CppUtil.instantiate(AssemblyCSharp.class(cls))));
            return JsonConvert.method<Il2Cpp.String>('SerializeObject').overload('System.Object', 'Newtonsoft.Json.JsonSerializerSettings').invoke(obj, setting);
        }

        function SerializeObjectv2(obj: Il2Cpp.Object) {
            let JsonNetConverter = AssemblyCSharp.class('Torappu.DB.JsonNetConverter')
            let memoryStream = Il2CppUtil.instantiateOverload(Il2Cpp.corlib.class('System.IO.MemoryStream'), []);
            Il2CppUtil.instantiate(JsonNetConverter, NewtonsoftJson.class('Newtonsoft.Json.Formatting').field('Indented').value)
                .method('Serialize').invoke(obj, memoryStream);
            return memoryStream.method('ToArray').invoke();
        }

        AssemblyCSharp.class('Torappu.DB.FlatBufferSignedConverter').method('_DeserializeInternal').implementation = function (stream: Il2Cpp.Object, type: Il2Cpp.Object) {
            Logger.logNormal(`dumping ${type} to /sdcard/${type}.json...`);
            let ret = this.method<Il2Cpp.Object>('_DeserializeInternal').invoke(stream, type);
            FileUtil.writeBytesToFile(`/sdcard/${type}.json`, SerializeObjectv2(ret));
            Logger.logWell(`done.`);
            return ret;
        }
    }

    export function main(): void {
        //UnityUtil.saveAllObjectsInSence();
        Logger.logNormal('[Il2CppHook] Starting il2cpp layer hook...');
        let application = Il2Cpp.application;
        Logger.log('[1;36m应用包名:[m [1;34m' + application.identifier + '[m');
        Logger.log('[1;36m版本:[m [1;34m' + application.version + '[m');
        Logger.log('[1;36m路径:[m [1;34m' + application.dataPath + '[m');
        Logger.log('[1;36mUnity版本:[m [1;34m' + Il2Cpp.unityVersion + '[m');
        Logger.log('[1;36mPid:[m [1;34m' + Process.id.toString() + '[m');
        //Logger.log('[1;36mAPK签名:[m [1;34m' + JavaUtil.getAppSignature() + '[m');
        tryCallingHook(
            [initHook, initAccountData, NetworkHook, LogHook, MiscHook, LoginHook, TASHook],
            ['initHook', 'initAccountData', 'NetworkHook', 'LogHook', 'MiscHook', 'LoginHook', 'TASHook'],
            '[Il2CppHook]');
        Logger.logNormal('[Il2CppHook] Starting UIBaseHook()...');
        UIBaseHook();
        //dumpFlatBufferHook();
    }
}

Logger.log('[1;36m==========Programme started!==========[m');
Logger.l(Buffer.from(title, 'base64').toString());
Java.perform(JavaHook.main);
setTimeout(() => Il2Cpp.perform(Il2CppHook.main), SETTING['Il2CppHookDelay']);