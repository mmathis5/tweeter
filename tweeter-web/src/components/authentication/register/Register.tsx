import "./Register.css";
import "bootstrap/dist/css/bootstrap.css";
import { useUserInfoActions } from "../../userInfo/UserInfoHooks";
import { ChangeEvent, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthenticationFormLayout from "../AuthenticationFormLayout";
import AuthenticationFields from "../AuthenticationFields";
import { useMessageActions } from "../../toaster/MessageHooks";
import { RegisterPresenter, RegisterView } from "../../../presenter/RegisterPresenter";

interface Props {
  presenterFactory: (view: RegisterView) => RegisterPresenter;
}

const Register = (props: Props) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [alias, setAlias] = useState("");
  const [password, setPassword] = useState("");
  const [imageBytes, setImageBytes] = useState<Uint8Array>(new Uint8Array());
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageFileExtension, setImageFileExtension] = useState<string>("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { updateUserInfo } = useUserInfoActions();
  const { displayErrorMessage } = useMessageActions();

  const listener: RegisterView = {
    setIsLoading: setIsLoading,
    updateUserInfo: updateUserInfo,
    navigate: navigate,
    displayErrorMessage: displayErrorMessage,
    setImageUrl: setImageUrl,
    setImageBytes: setImageBytes,
    setImageFileExtension: setImageFileExtension,
  }

  const presenterRef = useRef<RegisterPresenter | null>(null)
    if(!presenterRef.current){
      presenterRef.current = props.presenterFactory(listener);
    }

  const checkSubmitButtonStatus = (): boolean => {
    return presenterRef.current!.checkSubmitButtonStatus(firstName, lastName, alias, password, imageUrl, imageFileExtension);
  };

  const registerOnEnter = (event: React.KeyboardEvent<HTMLElement>) => {
    presenterRef.current!.registerOnEnter(event, firstName, lastName, alias, password, imageBytes, imageFileExtension, rememberMe, imageUrl);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    presenterRef.current!.handleFileChange(event);
  };

  const doRegister = async (
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    imageBytes: Uint8Array,
    imageFileExtension: string,
    rememberMe: boolean
  ) => {
    presenterRef.current!.doRegister(firstName, lastName, alias, password, imageBytes, imageFileExtension, rememberMe);
  };


  const inputFieldFactory = () => {
    return (
      <>
        <div className="form-floating">
          <input
            type="text"
            className="form-control"
            size={50}
            id="firstNameInput"
            placeholder="First Name"
            onKeyDown={registerOnEnter}
            onChange={(event) => setFirstName(event.target.value)}
          />
          <label htmlFor="firstNameInput">First Name</label>
        </div>
        <div className="form-floating">
          <input
            type="text"
            className="form-control"
            size={50}
            id="lastNameInput"
            placeholder="Last Name"
            onKeyDown={registerOnEnter}
            onChange={(event) => setLastName(event.target.value)}
          />
          <label htmlFor="lastNameInput">Last Name</label>
        </div>
        <AuthenticationFields onKeyDown={registerOnEnter} alias={alias} password={password} setAlias={setAlias} setPassword={setPassword} />
        <div className="form-floating mb-3">
          <input
            type="file"
            className="d-inline-block py-5 px-4 form-control bottom"
            id="imageFileInput"
            onKeyDown={registerOnEnter}
            onChange={handleFileChange}
          />
          {imageUrl.length > 0 && (
            <>
              <label htmlFor="imageFileInput">User Image</label>
              <img src={imageUrl} className="img-thumbnail" alt=""></img>
            </>
          )}
        </div>
      </>
    );
  };

  const switchAuthenticationMethodFactory = () => {
    return (
      <div className="mb-3">
        Algready registered? <Link to="/login">Sign in</Link>
      </div>
    );
  };

  return (
    <AuthenticationFormLayout
      headingText="Please Register"
      submitButtonLabel="Register"
      oAuthHeading="Register with:"
      inputFieldFactory={inputFieldFactory}
      switchAuthenticationMethodFactory={switchAuthenticationMethodFactory}
      setRememberMe={setRememberMe}
      submitButtonDisabled={checkSubmitButtonStatus}
      isLoading={isLoading}
      submit={() => doRegister(firstName, lastName, alias, password, imageBytes, imageFileExtension, rememberMe)}
    />
  );
};

export default Register;
