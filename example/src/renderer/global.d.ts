export {};

export interface SystemApi {
    platform: string;
}

export interface MainApi {

}

declare global {
    interface Window {
        SystemApi: SystemApi;
        MainApi: MainApi;
    }
}
