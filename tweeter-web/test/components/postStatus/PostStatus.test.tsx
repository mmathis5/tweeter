import { MemoryRouter } from "react-router-dom";
import { render } from "@testing-library/react";
import PostStatus from "../../../src/components/postStatus/PostStatus";
import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { User, AuthToken } from "tweeter-shared";
import { mock, instance, verify, anything } from "@typestrong/ts-mockito";
import { PostStatusPresenter } from "../../../src/presenter/PostStatusPresenter";
import { useUserInfo } from "../../../src/components/userInfo/UserInfoHooks";

jest.mock("../../../src/components/userInfo/UserInfoHooks", () => ({
  ...jest.requireActual("../../../src/components/userInfo/UserInfoHooks"),
  __esModule: true,
  useUserInfo: jest.fn(),
}));


describe("PostStatus", () => {
    const mockUserInstance = new User("test", "test", "test", "test");
    const mockAuthTokenInstance = new AuthToken("test", Date.now());

    beforeAll(() => {
        (useUserInfo as jest.Mock).mockReturnValue({
            currentUser: mockUserInstance,
            authToken: mockAuthTokenInstance,
        });
    });

    it ("When first rendered the Post Status and Clear buttons are both disabled.", async () =>{
        const {postStatusButton, clearStatusButton} = renderPostStatusAndGetElement();
        expect(postStatusButton).toBeDisabled();
        expect(clearStatusButton).toBeDisabled();
    })

    it("Both buttons are enabled when the text field has text", async () => {
        const {postStatusButton, clearStatusButton, postStatusTextArea, user} = renderPostStatusAndGetElement();
        await user.type(postStatusTextArea, "test");
        expect(postStatusButton).toBeEnabled();
        expect(clearStatusButton).toBeEnabled();
    })

    it("Both buttons are disabled when the text field is cleared", async () => {
        const {postStatusButton, clearStatusButton, postStatusTextArea, user} = renderPostStatusAndGetElement();
        await user.type(postStatusTextArea, "test");
        expect(postStatusButton).toBeEnabled();
        expect(clearStatusButton).toBeEnabled();
        await user.clear(postStatusTextArea);
        expect(postStatusButton).toBeDisabled();
        expect(clearStatusButton).toBeDisabled();
    })

    it("The presenter's postStatus method is called with correct parameters when the Post Status button is pressed", async () => {
        const mockPresenter = mock<PostStatusPresenter>();
        const mockPresenterInstance = instance(mockPresenter);

        const postBody = "test post body";
        const {postStatusButton, postStatusTextArea, user} = renderPostStatusAndGetElement(mockPresenterInstance);
        await user.type(postStatusTextArea, postBody);
        await user.click(postStatusButton);

        //unsure of how to test the event parameter, this felt the most correct. 
        verify(mockPresenter.submitPost(anything(), mockUserInstance, mockAuthTokenInstance, postBody)).once();

    })
})

function renderPostStatus(presenter?: PostStatusPresenter) {
    return render(
        <MemoryRouter>
            {!!presenter ? <PostStatus presenter={presenter} /> : <PostStatus />}
        </MemoryRouter>
    );
}

function renderPostStatusAndGetElement(presenter?: PostStatusPresenter) {  
    renderPostStatus(presenter);
    
    const postStatusButton = screen.getByRole("button", {name: /Post Status/i});
    const clearStatusButton = screen.getByRole("button", {name: /Clear/i});
    const postStatusTextArea = screen.getByPlaceholderText(/What's on your mind?/i);
    const user = userEvent.setup();
    return {
        postStatusButton,
        clearStatusButton,
        postStatusTextArea,
        user,
    };
}