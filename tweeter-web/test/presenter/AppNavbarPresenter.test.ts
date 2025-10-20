import { AuthToken } from "tweeter-shared";
import { AppNavbarView, AppNavbarPresenter } from "../../src/presenter/AppNavbarPresenter";
import { mock, instance, verify, spy, when, capture, anything } from "@typestrong/ts-mockito"
import { UserService } from "../../src/model.service/UserService";

describe("AppNavbarPresenter", () =>{
    let mockAppNavbarPresenterView: AppNavbarView;
    let appNavbarPresenter: AppNavbarPresenter;
    let mockUserService: UserService;

    const authToken = new AuthToken("abc123", Date.now());

    beforeEach(() => {
        mockAppNavbarPresenterView = mock<AppNavbarView>();
        const mockAppNavbarPresenterViewInstance = instance(mockAppNavbarPresenterView);
        when(mockAppNavbarPresenterView.displayInfoMessage(anything(), 0)).thenReturn("messageId123");
        const appNavbarPresenterSpy = spy(new AppNavbarPresenter(mockAppNavbarPresenterViewInstance));
        appNavbarPresenter = instance(appNavbarPresenterSpy);
        mockUserService = mock<UserService>();
        when(appNavbarPresenterSpy.userService).thenReturn(instance(mockUserService));
    })

    it("tells the view to display a logging out message", async () => {
        await appNavbarPresenter.logOut(authToken);
        verify(mockAppNavbarPresenterView.displayInfoMessage("Logging Out...", 0)).once();
    })

    it("calls logout on the user service with the correct auth token", async () => {
        await appNavbarPresenter.logOut(authToken);
        verify(mockUserService.logout(authToken)).once();

        // let [capturedAuthToken] = capture(mockUserService.logout).last();
        // expect(capturedAuthToken).toEqual(authToken);
    })

    it("tells the view to clear the info message that was displayed previously, clear the user info, and navigate to the login page", async () => {
        await appNavbarPresenter.logOut(authToken);

        verify(mockAppNavbarPresenterView.deleteMessage("messageId123")).once();
        verify(mockAppNavbarPresenterView.clearUserInfo()).once();
        verify(mockAppNavbarPresenterView.navigate("/login")).once();
    })

    it("tells the view to display an error message and does not tell it to clear the info message, clear the user info or navigate to the login page", async () => {
        let error = new Error("An error occured");
        when(mockUserService.logout(anything())).thenThrow(error);
        await appNavbarPresenter.logOut(authToken);
        verify(mockAppNavbarPresenterView.displayErrorMessage("Failed to log user out because of exception: An error occured")).once();
        verify(mockAppNavbarPresenterView.deleteMessage(anything())).never();
        verify(mockAppNavbarPresenterView.clearUserInfo()).never();
        verify(mockAppNavbarPresenterView.navigate("/login")).never();
    })

})
