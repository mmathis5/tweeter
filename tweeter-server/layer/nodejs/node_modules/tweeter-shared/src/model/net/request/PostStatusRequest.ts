import { StatusDto } from "../../dto/StatusDto";
import { TweeterRequest } from "./TweeterRequest";

export interface PostStatusRequest extends TweeterRequest {
    readonly token: string;
    readonly status: StatusDto;
}