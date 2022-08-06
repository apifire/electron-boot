declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production'
    readonly VITE_SERVER_URLS: string
  }

  interface Process {
    electronApp: import('child_process').ChildProcessWithoutNullStreams
  }
}
