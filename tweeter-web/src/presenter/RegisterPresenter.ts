import { AuthToken, User } from "tweeter-shared";
import { UserService } from "../model.service/UserService";
import { ChangeEvent } from "react";
import { Buffer } from "buffer";
import { Presenter, View } from "./Presenter";
import { AuthenticationPresenter, AuthenticationView } from "./AuthenticationPresenter";

export interface RegisterView extends AuthenticationView {
    setImageUrl: (url: string) => void;
    setImageBytes: (bytes: Uint8Array) => void;
    setImageFileExtension: (extension: string) => void;
}

export class RegisterPresenter extends AuthenticationPresenter<RegisterView> {
    public constructor(view: RegisterView) {
        super(view);
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
    this.doAuthentication(async() => this.userService.register(
        firstName,
        lastName,
        alias,
        password,
        imageBytes,
        imageFileExtension),
        rememberMe, 
        `/feed/${alias}`);
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

      protected operationType(): string {
        return "register user";
      }   
}