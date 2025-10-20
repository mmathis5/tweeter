import React from "react";
import Login from "../../../../src/components/authentication/login/Login";
import { LoginPresenter } from "../../../../src/presenter/LoginPresenter";
import {render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthenticationView } from "../../../../src/presenter/AuthenticationPresenter";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";
import { instance, mock, verify } from "@typestrong/ts-mockito";

library.add(fab);

describe("Login Component", () => {
    it("starts with the sign in button disabled", () => {
        const { signInButton } = renderLoginAndGetElement("/");
        expect(signInButton).toBeDisabled();
    })

    it("The sign-in button is enabled when both the alias and password fields have text.", async () => {
        const {signInButton, aliasField, passwordField, user} = renderLoginAndGetElement("/");
        await user.type(aliasField, "test");
        await user.type(passwordField, "test");
        expect(signInButton).toBeEnabled();
    })

    it("The sign-in button is disabled if either the alias or password field is cleared.", async () => {
        const {signInButton, aliasField, passwordField, user} = renderLoginAndGetElement("/");
        //both fields have text, so the button should be enabled
        await user.type(aliasField, "test");
        await user.type(passwordField, "test");
        expect(signInButton).toBeEnabled();
        //clear the alias field, so the button should be disabled
        await user.clear(aliasField);
        expect(signInButton).toBeDisabled();
        //type the alias field again, so the button should be enabled
        await user.type(aliasField, "test");
        expect(signInButton).toBeEnabled();
        //clear the password field, so the button should be disabled
        await user.clear(passwordField);
        expect(signInButton).toBeDisabled();
    })

    it("The presenter's login method is called with correct parameters when the sign-in button is pressed.", async () => {
        const mockPresenter = mock<LoginPresenter>();
        const mockPresenterInstance = instance(mockPresenter);

        const originalUrl = "http://somewhere.com";
        const alias = "1";
        const password = "2";

        const {signInButton, aliasField, passwordField, user} = renderLoginAndGetElement(originalUrl, mockPresenterInstance);


        await user.type(aliasField, alias);
        await user.type(passwordField, password);
        await user.click(signInButton);
        verify(mockPresenter.doLogin(alias, password, false, originalUrl)).once();
    })
})



function renderLogin(originalUrl: string, presenter?: LoginPresenter) {
    return render(
        <MemoryRouter>
            { !!presenter ?(
                <Login originalUrl={originalUrl} presenter={presenter} />
            ) : (
            <Login originalUrl={originalUrl} />
            )}
        </MemoryRouter>
    );
}

function renderLoginAndGetElement(originalUrl: string, presenter?: LoginPresenter){
    const user = userEvent.setup();
    renderLogin(originalUrl, presenter);
    const signInButton = screen.getByRole("button", {name: /Sign in/i});
    const aliasField = screen.getByLabelText(/Alias/i);
    const passwordField = screen.getByLabelText(/Password/i);
    return {
        user,
        signInButton,
        aliasField,
        passwordField,
    };
}