import { UserDto } from "../../dto/UserDto";
import { FollowServiceGeneralRequest } from "./FollowServiceGeneralRequest";

export interface FollowUnfollowRequest extends FollowServiceGeneralRequest {
    readonly userToFollowOrUnfollow: UserDto;
}