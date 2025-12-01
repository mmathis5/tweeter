import { UserDto } from "./UserDto";
import { PostSegment } from "../domain/PostSegment";

export interface StatusDto {
    readonly post: string;
    readonly user: UserDto;
    readonly timestamp: number;
    readonly segments: PostSegment[];
}