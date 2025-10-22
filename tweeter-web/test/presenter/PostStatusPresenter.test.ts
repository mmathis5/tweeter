import { PostStatusPresenter, PostStatusView } from "../../src/presenter/PostStatusPresenter";
import { StatusService } from "../../src/model.service/StatusService";
import { mock, instance, spy, verify, when, anything, capture} from "@typestrong/ts-mockito";
import { AuthToken, User } from "tweeter-shared";
import React from "react";

describe("PostStatusPresenter", () => {
    let mockPostStatusPresenterView: PostStatusView;
    let postStatusPresenter: PostStatusPresenter;
    let mockStatusService: StatusService;
    const authToken = new AuthToken("abc123", Date.now());
    const user = new User("test", "test", "test", "test");
    const event = {
        preventDefault: jest.fn()
    } as unknown as React.MouseEvent;

    beforeEach(() => {
        mockPostStatusPresenterView = mock<PostStatusView>();
        const mockPostStatusPresenterViewInstance = instance(mockPostStatusPresenterView);
        when(mockPostStatusPresenterView.displayInfoMessage(anything(), 0)).thenReturn("messageId123");
        const postStatusPresenterSpy = spy(new PostStatusPresenter(mockPostStatusPresenterViewInstance));
        postStatusPresenter = instance(postStatusPresenterSpy);
        mockStatusService = mock<StatusService>();
        when(postStatusPresenterSpy.statusService).thenReturn(instance(mockStatusService));        })

    it ("tells the view to display a posting status message", async () => {
        await postStatusPresenter.submitPost(event, user, authToken, "test");
        verify(mockPostStatusPresenterView.displayInfoMessage(anything(), 0)).once();
    })

    it ("calls postStatus on the post status service with the correct status string and auth token.", async () => {
        await postStatusPresenter.submitPost(event, user, authToken, "test");
        let [capturedAuthToken, capturedStatus] = capture(mockStatusService.postStatus).last();
        expect(capturedAuthToken).toEqual(authToken);
        //drill into the status object to get the post string
        expect(capturedStatus.post).toEqual("test");
    })

    it ("the presenter tells the view to clear the info message that was displayed previously, clear the post, and display a status posted message.", async () => {
        await postStatusPresenter.submitPost(event, user, authToken, "test");
        verify(mockPostStatusPresenterView.deleteMessage(anything())).once();
        verify(mockPostStatusPresenterView.setPost("")).once();
        //what does this mean, clear the post?
        verify(mockPostStatusPresenterView.displayInfoMessage("Status posted!", 2000)).once();
    })

    it ("the presenter tells the view to clear the info message and display an error message but does not tell it to clear the post or display a status posted message", async () => {
        let error = new Error("An error occured");
        when(mockStatusService.postStatus(anything(), anything())).thenThrow(error);
        await postStatusPresenter.submitPost(event, user, authToken, "test");
        verify(mockPostStatusPresenterView.deleteMessage("messageId123")).once();
        verify(mockPostStatusPresenterView.displayErrorMessage("Failed to post the status because of exception: An error occured")).once();
        verify(mockPostStatusPresenterView.setPost(anything())).never();
        //this is called once initially, so we have to check that it was called at least once
        verify(mockPostStatusPresenterView.displayInfoMessage(anything(), 0)).once();
    })


})