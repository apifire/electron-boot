import {Autowired, ElectronContainer, Provide, Scope, ScopeEnum} from "../../src";

export interface Animal {
    Say():any
}

@Provide()
@Scope(ScopeEnum.Singleton)
export class Cat implements Animal{
    Say() {
        console.log("喵喵喵")
    }
}

@Provide()
@Scope(ScopeEnum.Singleton)
export class Dog implements Animal{
    Say() {
        console.log("汪汪汪")
    }
}

@Provide()
@Scope(ScopeEnum.Singleton)
export class LogService {
    @Autowired()
    public cat: Cat | undefined
    @Autowired()
    public dog: Dog | undefined
}


const container = new ElectronContainer()
container.bindClass(Cat)
container.bindClass(Dog)
container.bindClass(LogService)

const clazz = container.get<LogService>(LogService)
console.log(clazz.dog?.Say())
