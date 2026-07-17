export {};

declare global {
  interface AcceptJsResponse {
    messages: {
      resultCode: "Ok" | "Error";
      message: { code: string; text: string }[];
    };
    opaqueData?: {
      dataDescriptor: string;
      dataValue: string;
    };
  }

  interface Window {
    Accept?: {
      dispatchData: (
        secureData: {
          authData: {
            clientKey: string;
            apiLoginID: string;
          };
          cardData: {
            cardNumber: string;
            month: string;
            year: string;
            cardCode: string;
          };
        },
        responseHandler: (response: AcceptJsResponse) => void
      ) => void;
    };
  }
}
