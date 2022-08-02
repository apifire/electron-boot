interface ExceptionOptions {
    cause?:Error
    status:number
}

const codeGroup = new Set()

interface Convertable {
    [key: string]: string | number;
}

/**
 * 转换成string
 */
type ConvertString<T extends Convertable, Group extends string> = {
    [P in keyof T]: P extends string
        ? T[P] extends number
            ? `${Uppercase<Group>}_${T[P]}`
            : never
        : never;
};
/**
 * Register error group and code, return the standard ErrorCode
 * @param errorGroup
 * @param errorCodeMapping
 */
export function registerExceptionCode<T extends Convertable, G extends string>(
    errorGroup: G,
    errorCodeMapping: T
): ConvertString<T, G> {
    if (codeGroup.has(errorGroup)) {
        throw new BaseException(
            `Error group ${errorGroup} is duplicated, please check before adding.`
        );
    } else {
        codeGroup.add(errorGroup);
    }
    const newCodeEnum = {} as Convertable;
    // ERROR => GROUP_10000
    for (const errKey in errorCodeMapping) {
        newCodeEnum[errKey as string] =
            errorGroup.toUpperCase() +
            '_' +
            String(errorCodeMapping[errKey]).toUpperCase();
    }
    return newCodeEnum as ConvertString<T, G>;
}

/**
 * 基础异常
 */
export class BaseException extends Error{
    code:number|string
    cause:Error
    constructor(msg:string,options?:ExceptionOptions)
    constructor(msg:string,code:string,options?:ExceptionOptions)
    constructor(msg:string,code:any,options?:ExceptionOptions) {
        super(msg);
        if (!code || typeof code==="object"){
            options = code
            code = "electron-boot_99999"
        }
        this.name = this.constructor.name
        this.code = code
        this.cause = options?.cause
    }
}

