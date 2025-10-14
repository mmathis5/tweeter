import { AuthToken, User } from "tweeter-shared";
import { FollowService } from "../model.service/FollowService";

export interface UserInfoView {
    setIsFollower: (isFollower: boolean) => void;
    setFolloweeCount: (followeeCount: number) => void;
    setFollowerCount: (followerCount: number) => void;
    displayErrorMessage: (message: string) => void;
    setDisplayedUser: (user: User) => void;
    setIsLoading: (isLoading: boolean) => void;
    displayInfoMessage: (message: string, timeout: number) => string;
    deleteMessage: (message: string) => void;
}

export class UserInfoPresenter {
    private _view: UserInfoView;
    private followService: FollowService;

    public constructor(view: UserInfoView) {
        this._view = view;
        this.followService = new FollowService();
    }

    public async setIsFollowerStatus (
        authToken: AuthToken,
        currentUser: User,
        displayedUser: User
      ) {
        try {
          if (currentUser === displayedUser) {
            this._view.setIsFollower(false);
          } else {
            this._view.setIsFollower(
              await this.followService.getIsFollowerStatus(authToken!, currentUser!, displayedUser!)
            );
          }
        } catch (error) {
          this._view.displayErrorMessage(
            `Failed to determine follower status because of exception: ${error}`,
          );
        }
      };

      public async setNumbFollowees (
        authToken: AuthToken,
        displayedUser: User
      ) {
        try {
          this._view.setFolloweeCount(await this.followService.getFolloweeCount(authToken, displayedUser));
        } catch (error) {
          this._view.displayErrorMessage(        
            `Failed to get followees count because of exception: ${error}`,
          );
        }
      };

      public async setNumbFollowers (
        authToken: AuthToken,
        displayedUser: User
      ) {
        try {
          this._view.setFollowerCount(await this.followService.getFollowerCount(authToken, displayedUser));
        } catch (error) {
          this._view.displayErrorMessage(
            `Failed to get followers count because of exception: ${error}`,
          );
        }
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
        userToFollow: User,

      ): Promise<void> {
        event.preventDefault();
    
        var followingUserToast = "";
    
        try {
          this._view.setIsLoading(true);
          followingUserToast = this._view.displayInfoMessage(
            `Following ${userToFollow.alias}...`,
            0
          );
    
          const [followerCount, followeeCount] = await this.followService.follow(
            authToken!,
            userToFollow!
          );
    
          this._view.setIsFollower(true);
          this._view.setFollowerCount(followerCount);
          this._view.setFolloweeCount(followeeCount);
        } catch (error) {
          this._view.displayErrorMessage(
            `Failed to follow user because of exception: ${error}`,
          );
        } finally {
          this._view.deleteMessage(followingUserToast);
          this._view.setIsLoading(false);
        }
      };

      public async unfollowDisplayedUser(
        event: React.MouseEvent,
        authToken: AuthToken,
        userToUnfollow: User,

      ): Promise<void> {
        event.preventDefault();
    
        var unfollowingUserToast = "";
    
        try {
          this._view.setIsLoading(true);
          unfollowingUserToast = this._view.displayInfoMessage(
            `Unfollowing ${userToUnfollow.alias}...`,
            0
          );
    
          const [followerCount, followeeCount] = await this.followService.unfollow(
            authToken!,
            userToUnfollow!
          );
    
          this._view.setIsFollower(false);
          this._view.setFollowerCount(followerCount);
          this._view.setFolloweeCount(followeeCount);
        } catch (error) {
          this._view.displayErrorMessage(
            `Failed to unfollow user because of exception: ${error}`,
          );
        } finally {
          this._view.deleteMessage(unfollowingUserToast);
          this._view.setIsLoading(false);
        }
      };
    



}