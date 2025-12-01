import { UserDto } from "../../dto/UserDto";
import { TweeterRequest } from "./TweeterRequest";

export interface FollowServiceGeneralRequest extends TweeterRequest {
    readonly token: string,
    readonly user: UserDto
}