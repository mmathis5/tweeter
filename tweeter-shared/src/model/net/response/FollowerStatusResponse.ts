import { TweeterResponse } from "./TweeterResponse";

export interface FollowerStatusResponse extends TweeterResponse {
    readonly isFollower: boolean,
}