export interface View { 
    displayErrorMessage: (message: string) => void;
  }

export interface MessageView extends View {
    displayInfoMessage: (message: string, timeout: number) => string;
    deleteMessage: (message: string) => void;
}

export abstract class Presenter<V extends View> {
    protected _view: V;

    protected constructor(view: V) {
        this._view = view;
    }

    protected async doFailureReportingOperation(operation: ()=> Promise<void>, operationDescription: string) {
        try {
            await operation();
        } catch (error) {
            this.view.displayErrorMessage(
            `Failed to ${operationDescription} because of exception: ${error}`,
            );
        }
    };

    protected get view(): V{
        return this._view;
    }
}