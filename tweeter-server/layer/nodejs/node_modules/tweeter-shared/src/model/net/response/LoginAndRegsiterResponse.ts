import { TweeterResponse } from "./TweeterResponse";
import { UserDto } from "../../dto/UserDto";
import { AuthTokenDto } from "../../dto/AuthTokenDto";

export interface LoginAndRegsiterResponse extends TweeterResponse {
    readonly user: UserDto;
    readonly token: AuthTokenDto;
}