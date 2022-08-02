import {BaseException, registerExceptionCode} from "./base.exception";
import {ObjectIdentifier} from "../types";

export const CoreExceptionEnum = registerExceptionCode("autowired",{
    UNKNOWN:99999,
    COMMON:10000,
    MISSING_RESOLVER:10001,
    DEFINITION_NOT_FOUND:10002,
    SINGLETON_INJECT_TEMP:10003,
    USE_WRONG_METHOD:10004,
    DUPLICATE_CLASS_NAME:10005,
    INVALID_CONFIG:10006,
    DUPLICATE_ROUTER:10007
} as const)

/**
 * 公共的异常
 */
export class ElectronBootCommonException extends BaseException{
    constructor(msg:string) {
        super(msg,CoreExceptionEnum.COMMON);
    }
}

/**
 * 解析程序缺少异常
 */
export class ResolverMissingException extends BaseException {
    constructor(type: string) {
        super(
            `${type} resolver is not exists!`,
            CoreExceptionEnum.MISSING_RESOLVER
        );
    }
}

/**
 * 没找到定义异常
 */
export class DefinitionNotFoundException extends BaseException {
    static readonly type = Symbol.for('#NotFoundError');
    static isClosePrototypeOf(ins: DefinitionNotFoundException): boolean {
        return ins
            ? ins[DefinitionNotFoundException.type] ===
            DefinitionNotFoundException.type
            : false;
    }
    constructor(identifier: ObjectIdentifier) {
        super(
            `${String(identifier)} is not valid in current context`,
            CoreExceptionEnum.DEFINITION_NOT_FOUND
        );
        this[DefinitionNotFoundException.type] =
            DefinitionNotFoundException.type;
    }
    updateErrorMsg(className: string): void {
        const identifier = this.message.split(
            ' is not valid in current context'
        )[0];
        this.message = `${identifier} in class ${className} is not valid in current context`;
    }
}

/**
 * 注入temp单例异常
 */
export class SingletonInjectTempException extends BaseException {
    constructor(singletonScopeName: string, requestScopeName: string) {
        const text = `${singletonScopeName} with singleton scope can't implicitly inject ${requestScopeName} with temp scope directly, please add "@Scope(ScopeEnum.Temp, { allowDowngrade: true })" in ${requestScopeName} or use "ctx.tempContext.getAsync(${requestScopeName})".`;
        super(text, CoreExceptionEnum.SINGLETON_INJECT_TEMP);
    }
}

/**
 * 使用方法错误异常
 */
export class UseWrongMethodException extends BaseException{
    constructor(
      wrongMethod: string,
      replacedMethod: string,
      describeKey?: string
    ) {
        const text = describeKey
          ? `${describeKey} not valid by ${wrongMethod}, Use ${replacedMethod} instead!`
          : `You should not invoked by ${wrongMethod}, Use ${replacedMethod} instead!`;
        super(text, CoreExceptionEnum.USE_WRONG_METHOD);
    }
}

/**
 * 配置无效异常
 */
export class InvalidConfigException extends BaseException{
    constructor(message?: string) {
        super(
          'Invalid config file \n' + message,
          CoreExceptionEnum.INVALID_CONFIG
        );
    }
}

/**
 * 重复路由异常
 */
export class DuplicateRouteException extends BaseException{
    constructor(routerUrl: string, existPos: string, existPosOther: string) {
        super(
          `Duplicate router "${routerUrl}" at "${existPos}" and "${existPosOther}"`,
          CoreExceptionEnum.DUPLICATE_ROUTER
        );
    }
}

/**
 * 类重复异常
 */
export class DuplicateClassNameException extends BaseException{
    constructor(className: string, existPath: string, existPathOther: string) {
        super(
          `"${className}" duplicated between "${existPath}" and "${existPathOther}"`,
          CoreExceptionEnum.DUPLICATE_CLASS_NAME
        );
    }
}