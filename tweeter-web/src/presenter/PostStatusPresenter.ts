import { AuthToken, Status, User } from "tweeter-shared";
import { StatusService } from "../model.service/StatusService";

export interface PostStatusView {
    displayInfoMessage: (message: string, timeout: number) => string;
    displayErrorMessage: (message: string) => void;
    deleteMessage: (message: string) => void;
    setIsLoading: (isLoading: boolean) => void;
    setPost: (post: string) => void;
}

export class PostStatusPresenter {

    private _view: PostStatusView;
    private statusService: StatusService;

    public constructor(view: PostStatusView) {
        this.statusService = new StatusService();
        this._view = view;
    }

    public async submitPost (event: React.MouseEvent,
        currentUser: User,
        authToken: AuthToken,
        post: string
    ) {
        event.preventDefault();

        var postingStatusToastId = "";

        try {
        this._view.setIsLoading(true);
        postingStatusToastId = this._view.displayInfoMessage(
            "Posting status...",
            0
        );

        const status = new Status(post, currentUser!, Date.now());

        await this.statusService.postStatus(authToken!, status);

        this._view.setPost("");
        this._view.displayInfoMessage("Status posted!", 2000);
        } catch (error) {
        this._view.displayErrorMessage(
            `Failed to post the status because of exception: ${error}`,
        );
        } finally {
        this._view.deleteMessage(postingStatusToastId);
        this._view.setIsLoading(false);
        }
    };



}