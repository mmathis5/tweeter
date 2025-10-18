import { AuthToken, Status, User } from "tweeter-shared";
import { StatusService } from "../model.service/StatusService";
import { MessageView, Presenter } from "./Presenter";

export interface PostStatusView extends MessageView {
    setIsLoading: (isLoading: boolean) => void;
    setPost: (post: string) => void;
}

export class PostStatusPresenter extends Presenter<PostStatusView> {

    private statusService: StatusService;

    public constructor(view: PostStatusView) {
        super(view);
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


        await this.doFailureReportingOperation(async() => {
            this._view.setIsLoading(true);
            postingStatusToastId = this._view.displayInfoMessage(
                "Posting status...",
                0
            );
    
            const status = new Status(post, currentUser!, Date.now());
    
            await this.statusService.postStatus(authToken!, status);
    
            this._view.setPost("");
            this._view.displayInfoMessage("Status posted!", 2000);
        }, "post the status");
        
        this._view.deleteMessage(postingStatusToastId);
        this._view.setIsLoading(false);
        
    };



}