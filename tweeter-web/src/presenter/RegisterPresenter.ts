import { AuthToken, User } from "tweeter-shared";
import { UserService } from "../model.service/UserService";
import { ChangeEvent } from "react";
import { Buffer } from "buffer";

export interface RegisterView {
    setIsLoading: (isLoading: boolean) => void;
    updateUserInfo: (user: User, displayedUser: User, authToken: AuthToken, rememberMe: boolean) => void;
    navigate: (path: string) => void;
    displayErrorMessage: (message: string) => void;
    setImageUrl: (url: string) => void;
    setImageBytes: (bytes: Uint8Array) => void;
    setImageFileExtension: (extension: string) => void;
}

export class RegisterPresenter {
    private userService: UserService;
    private _view: RegisterView;

    public constructor(view: RegisterView) {
        this.userService = new UserService();
        this._view = view;
    }
    
    public async doRegister (
        firstName: string,
        lastName: string,
        alias: string,
        password: string,
        imageBytes: Uint8Array,
        imageFileExtension: string,
        rememberMe: boolean
    ) {
        try {
          this._view.setIsLoading(true);
    
          const [user, authToken] = await this.userService.register(
            firstName,
            lastName,
            alias,
            password,
            imageBytes,
            imageFileExtension
          );
          this._view.updateUserInfo(user, user, authToken, rememberMe);
          this._view.navigate(`/feed/${user.alias}`);
        } catch (error) {
          this._view.displayErrorMessage(
            `Failed to register user because of exception: ${error}`,
          );
        } finally {
         this._view.setIsLoading(false);
        }
      };

      public checkSubmitButtonStatus (firstName: string, lastName: string, alias: string, password: string, imageUrl: string, imageFileExtension: string): boolean {
        return (
          !firstName ||
          !lastName ||
          !alias ||
          !password ||
          !imageUrl ||
          !imageFileExtension
        );
      };

      public registerOnEnter (event: React.KeyboardEvent<HTMLElement>, firstName: string, lastName: string, alias: string, password: string, imageBytes: Uint8Array, imageFileExtension: string, rememberMe: boolean, imageUrl: string) {
        if (event.key == "Enter" && !this.checkSubmitButtonStatus(firstName, lastName, alias, password, imageUrl, imageFileExtension)) {
          this.doRegister(firstName, lastName, alias, password, imageBytes, imageFileExtension, rememberMe);
        }
      };

      public getFileExtension (file: File): string | undefined {
        return file.name.split(".").pop();
      };
    

      public handleImageFile (file: File | undefined) {
        if (file) {
          this._view.setImageUrl(URL.createObjectURL(file));
    
          const reader = new FileReader();
          reader.onload = (event: ProgressEvent<FileReader>) => {
            const imageStringBase64 = event.target?.result as string;
    
            // Remove unnecessary file metadata from the start of the string.
            const imageStringBase64BufferContents =
              imageStringBase64.split("base64,")[1];
    
            const bytes: Uint8Array = Buffer.from(
              imageStringBase64BufferContents,
              "base64"
            );
    
            this._view.setImageBytes(bytes);
          };
          reader.readAsDataURL(file);
    
          // Set image file extension (and move to a separate method)
          const fileExtension = this.getFileExtension(file);
          if (fileExtension) {
            this._view.setImageFileExtension(fileExtension);
          }
        } else {
          this._view.setImageUrl("");
          this._view.setImageBytes(new Uint8Array());
        }
      };

      public handleFileChange (event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        this.handleImageFile(file);
      };
    
}