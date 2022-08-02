import {IElectronContainer, IFileDetector, IObjectDefinition} from "../interface";
import {resolves, Types} from "../utils";
import {getProvideName} from "../decorator";
import {DuplicateClassNameException} from "../exception/core.exception";

export abstract class AbstractFileDetector<T> implements IFileDetector {
  options: T;
  extraDetectorOptions: T;
  constructor(options) {
    this.options = options;
    this.extraDetectorOptions = {} as T;
  }

  abstract run(container: IElectronContainer);

  setExtraDetectorOptions(detectorOptions: T) {
    this.extraDetectorOptions = detectorOptions;
  }
}

/**
 * 要扫描的文件
 */
const DEFAULT_PATTERN = ["**/**.ts", "**/**.tsx", "**/**.js","**/**.jsc"];
/**
 * 要排除扫描的文件
 */
const DEFAULT_IGNORE_PATTERN = [
  "**/**.d.ts",
  "**/logs/**",
  "**/node_modules/**",
  "**/**.test.ts",
  "**/**.test.ts",
  "**/__test__/**",
];

/**
 * 定义解析赛选器
 */
export interface ResolveFilter {
  pattern: string | RegExp;
  filter: (module, filter, bindModule) => any;
  ignoreRequire?: boolean;
}

/**
 * 默认的目录扫描器
 */
export class DirectoryFileDetector extends AbstractFileDetector<{
  loadDir: string | string[];
  pattern: string | string[];
  ignore: string | string[];
  namespace: string;
}> {
  private directoryFilterArray: ResolveFilter[] = [];
  private duplicateModuleCheckSet = new Map();

  run(container) {
    const loadDirs = []
      .concat(this.options.loadDir || [])
      .concat(this.extraDetectorOptions.loadDir || []);

    for (const dir of loadDirs) {
      const fileResults = resolves(
        DEFAULT_PATTERN.concat(this.options.pattern || []).concat(
          this.extraDetectorOptions.pattern || []
        ),
        {
          cwd: dir,
          ignore: DEFAULT_IGNORE_PATTERN.concat(
            this.options.ignore || []
          ).concat(this.extraDetectorOptions.ignore || []),
        }
      );

      // 检查重复模块
      const checkDuplicatedHandler = (module, options?: IObjectDefinition) => {
        if (Types.isClass(module)) {
          const name = getProvideName(module);
          if (name) {
            if (this.duplicateModuleCheckSet.has(name)) {
              throw new DuplicateClassNameException(
                name,
                options.srcPath,
                this.duplicateModuleCheckSet.get(name)
              );
            } else {
              this.duplicateModuleCheckSet.set(name, options.srcPath);
            }
          }
        }
      };

      for (const file of fileResults) {
        if (this.directoryFilterArray.length) {
          for (const resolveFilter of this.directoryFilterArray) {
            if (typeof resolveFilter.pattern === 'string') {
              if (file.includes(resolveFilter.pattern)) {
                const exports = resolveFilter.ignoreRequire
                  ? undefined
                  : require(file);
                resolveFilter.filter(exports, file, this);
                continue;
              }
            } else if (Types.isRegExp(resolveFilter.pattern)) {
              if ((resolveFilter.pattern ).test(file)) {
                const exports = resolveFilter.ignoreRequire
                  ? undefined
                  : require(file);
                resolveFilter.filter(exports, file, this);
                continue;
              }
            }

            const exports = require(file);
            // add module to set
            container.bindClass(exports, {
              namespace: this.options.namespace,
              srcPath: file,
              createFrom: 'file',
              bindHook: checkDuplicatedHandler,
            });
          }
        } else {
          const exports = require(file);
          // add module to set
          container.bindClass(exports, {
            namespace: this.options.namespace,
            srcPath: file,
            createFrom: 'file',
            bindHook: checkDuplicatedHandler,
          });
        }
      }
    }

    // check end
    this.duplicateModuleCheckSet.clear();
  }
}

export class CustomModuleDetector extends AbstractFileDetector<{
  modules: any[];
  namespace: string;
}> {
  run(container) {
    for (const module of this.options.modules) {
      container.bindClass(module, {
        namespace: this.options.namespace,
        createFrom: 'module',
      });
    }
  }
}