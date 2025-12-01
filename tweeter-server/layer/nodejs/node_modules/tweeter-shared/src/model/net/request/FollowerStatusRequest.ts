import { FollowServiceGeneralRequest } from "./FollowServiceGeneralRequest";
import { UserDto } from "../../dto/UserDto";

export interface FollowerStatusRequest extends FollowServiceGeneralRequest {
    readonly selectedUser: UserDto,
}