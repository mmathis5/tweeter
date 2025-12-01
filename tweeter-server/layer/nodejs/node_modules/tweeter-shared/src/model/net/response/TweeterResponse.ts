export interface TweeterResponse {
    readonly success: boolean,
    readonly message: string | null, //for errors if needed
}