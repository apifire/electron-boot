import {Autowired, getPropertyAutowired, Provide} from "../../src";


@Provide()
class InjectChild {

}

class Autowired2 {

}


class Test {
    @Autowired()
    aa:any

    @Autowired()
    ee!: InjectChild;
}


let meta =  getPropertyAutowired(Test)
console.log(meta)