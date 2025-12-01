import { AuthToken, User } from "tweeter-shared";
import { FollowService } from "../model.service/FollowService";
import { MessageView, Presenter } from "./Presenter";

export interface UserInfoView extends MessageView{
    setIsFollower: (isFollower: boolean) => void;
    setFolloweeCount: (followeeCount: number) => void;
    setFollowerCount: (followerCount: number) => void;
    setDisplayedUser: (user: User) => void;
    setIsLoading: (isLoading: boolean) => void;
}

export class UserInfoPresenter extends Presenter<UserInfoView> {
    private followService: FollowService;

    public constructor(view: UserInfoView) {
        super(view);
        this.followService = new FollowService();
    }

    public async setIsFollowerStatus (
        authToken: AuthToken,
        currentUser: User,
        displayedUser: User
      ) {

        await this.doFailureReportingOperation(async() => {
          if (currentUser === displayedUser) {
            this._view.setIsFollower(false);
          } else {
            this._view.setIsFollower(
              await this.followService.getIsFollowerStatus(authToken!, currentUser!, displayedUser!)
            );
          }

        }, "determine follower status");
        
      };

      public async setNumbFollowees (
        authToken: AuthToken,
        displayedUser: User
      ) {
        await this.doFailureReportingOperation(async() => {
          this._view.setFolloweeCount(await this.followService.getFolloweeCount(authToken, displayedUser));
        }, "get folowees count");
      };

      public async setNumbFollowers (
        authToken: AuthToken,
        displayedUser: User
      ) {

        await this.doFailureReportingOperation(async() => {
          this._view.setFollowerCount(await this.followService.getFollowerCount(authToken, displayedUser));
        }, "get followers count");
      };

      public async switchToLoggedInUser (
        event: React.MouseEvent,
        currentUser: User,
        navigate: (path: string) => void
      ) {
        event.preventDefault();
        this._view.setDisplayedUser(currentUser!);
        navigate(`${this.getBaseUrl()}/${currentUser!.alias}`);
      };

      private getBaseUrl = (): string => {
        const segments = location.pathname.split("/@");
        return segments.length > 1 ? segments[0] : "/";
      };

      public async followDisplayedUser (
        event: React.MouseEvent,
        authToken: AuthToken,
        currentUser: User,
        userToFollow: User,

      ): Promise<void> {
        this.performOperationOnUser(
          event, 
          userToFollow, 
          "Following",
          () => this.followService.follow(authToken, currentUser, userToFollow),
          true
        )
      };

      public async unfollowDisplayedUser(
        event: React.MouseEvent,
        authToken: AuthToken,
        currentUser: User,
        userToUnfollow: User,

      ): Promise<void> {
        this.performOperationOnUser(
          event,  
          userToUnfollow, 
          "Unfollowing",
          () => this.followService.unfollow(authToken, currentUser, userToUnfollow),
          false
        )
      };

      public async performOperationOnUser (
        event: React.MouseEvent,
        user: User,
        operationType: string,
        operation: () => Promise<[number, number]>,
        isFollowing: boolean
      ): Promise<void> {
        event.preventDefault();
    
        var operationUserToast = "";
    
        await this.doFailureReportingOperation(async() => {
          this._view.setIsLoading(true);
          operationUserToast = this._view.displayInfoMessage(
            `${operationType} ${user.alias}...`,
            0
          );
    
          const [followerCount, followeeCount] = await operation();  
          this._view.setIsFollower(isFollowing);
          this._view.setFollowerCount(followerCount);
          this._view.setFolloweeCount(followeeCount);

        }, `${operationType} user`);
        this._view.deleteMessage(operationUserToast);
        this._view.setIsLoading(false);
      };


}