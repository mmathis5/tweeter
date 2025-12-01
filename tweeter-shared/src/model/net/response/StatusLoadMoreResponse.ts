import { TweeterResponse } from "./TweeterResponse";
import { StatusDto } from "../../dto/StatusDto";

export interface StatusLoadMoreResponse extends TweeterResponse {
    readonly items: StatusDto[];
    readonly hasMore: boolean;
}