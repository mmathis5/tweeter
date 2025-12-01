import { TweeterResponse } from "./TweeterResponse";

export interface FollowAndUnfollowResponse extends TweeterResponse {
    readonly followerCount: number,
    readonly followeeCount: number,
}