// 注入类存储键
export const INJECT_CLASS_KEY_PREFIX = "INJECTION_CLASS_META_DATA"
// 注入类方法存储键
export const INJECT_CLASS_METHOD_KEY_PREFIX = "INJECTION_CLASS_METHOD_META_DATA"
// 方法注入存储键
export const INJECT_METHOD_KEY_PREFIX = "INJECTION_METHOD_META_DATA"
// 预加载模块存储键
export const PRELOAD_MODULE_KEY = "INJECTION_PRELOAD_MODULE_KEY"
// 自动注入的装饰器名
export const INJECT_TAG = "autowired";
// 对象定义注入标识
export const OBJECT_DEFINITION_CLASS = "injection:object_definition_class";
// 已经注入进容器的类标识
export const TARGETED_CLASS = "injection:targeted_class"
// 自定义的方法装饰器存储键
export const INJECT_CUSTOM_METHOD = "inject_custom_method";
// 自定义属性装饰器存储键
export const INJECT_CUSTOM_PROPERTY = "inject_custom_property";
// 自定义参数装饰器存储键
export const INJECT_CUSTOM_PARAM = "inject_custom_param";
// 配置装饰器存储键
export const CONFIGURATION_KEY="core:configuration"
// AOP注入键
export const ASPECT_KEY="core:aspect"

// ===================应用级别=====================
// 注入配置所有值
export const ALL = 'common:all_value_key';
//配置注入键
export const CONFIG_KEY = "core:config"

//====================Router======================
// 路由控制器
export const ROUTER_CONTROLLER_KEY = "core:router_controller"
// 路由方法
export const ROUTER_ACTION_KEY = "core:router_action"


// pipeline
export const PIPELINE_IDENTIFIER = '__pipeline_identifier__';
// 应用上下文
export const APPLICATION_CONTEXT_KEY = '__electron_application_context__';
// 应用启动装饰器存储键
export const APPLICATION_BOOT_KEY = "__electron_application_boot__"
// 窗口装饰器存储键
export const APPLICATION_WINDOW = "__electron_application_window__"