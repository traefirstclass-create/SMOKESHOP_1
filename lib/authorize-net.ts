import "server-only";
// @ts-expect-error -- authorizenet ships no type declarations
import AuthorizeNetSDK from "authorizenet";
import type { ShippingAddress } from "@/lib/types";

const { APIContracts, APIControllers, Constants } = AuthorizeNetSDK;

export type ChargeItem = {
  productName: string;
  quantity: number;
  priceCents: number;
};

export type ChargeInput = {
  opaqueData: { dataDescriptor: string; dataValue: string };
  amountCents: number;
  shipping: ShippingAddress;
  items: ChargeItem[];
};

export type ChargeResult =
  | { success: true; transactionId: string }
  | { success: false; error: string };

export function isAuthorizeNetConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_AUTHORIZE_NET_API_LOGIN_ID &&
      process.env.AUTHORIZE_NET_TRANSACTION_KEY
  );
}

export async function chargeCard(input: ChargeInput): Promise<ChargeResult> {
  const apiLoginId = process.env.NEXT_PUBLIC_AUTHORIZE_NET_API_LOGIN_ID;
  const transactionKey = process.env.AUTHORIZE_NET_TRANSACTION_KEY;
  const environment =
    process.env.NEXT_PUBLIC_AUTHORIZE_NET_ENVIRONMENT === "production"
      ? "production"
      : "sandbox";

  if (!apiLoginId || !transactionKey) {
    return { success: false, error: "Payment processing is not configured." };
  }

  const merchantAuthenticationType = new APIContracts.MerchantAuthenticationType();
  merchantAuthenticationType.setName(apiLoginId);
  merchantAuthenticationType.setTransactionKey(transactionKey);

  const opaqueData = new APIContracts.OpaqueDataType();
  opaqueData.setDataDescriptor(input.opaqueData.dataDescriptor);
  opaqueData.setDataValue(input.opaqueData.dataValue);

  const paymentType = new APIContracts.PaymentType();
  paymentType.setOpaqueData(opaqueData);

  const [firstName, ...rest] = input.shipping.fullName.trim().split(" ");
  const billTo = new APIContracts.CustomerAddressType();
  billTo.setFirstName(firstName || input.shipping.fullName);
  billTo.setLastName(rest.join(" "));
  billTo.setAddress(input.shipping.line1);
  billTo.setCity(input.shipping.city);
  billTo.setState(input.shipping.state);
  billTo.setZip(input.shipping.zip);
  billTo.setCountry("USA");

  const lineItemList = input.items.slice(0, 30).map((item, idx) => {
    const li = new APIContracts.LineItemType();
    li.setItemId(String(idx + 1));
    li.setName(item.productName.slice(0, 31));
    li.setQuantity(item.quantity);
    li.setUnitPrice(item.priceCents / 100);
    return li;
  });
  const lineItems = new APIContracts.ArrayOfLineItem();
  lineItems.setLineItem(lineItemList);

  const transactionRequestType = new APIContracts.TransactionRequestType();
  transactionRequestType.setTransactionType(
    APIContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION
  );
  transactionRequestType.setPayment(paymentType);
  transactionRequestType.setAmount((input.amountCents / 100).toFixed(2));
  transactionRequestType.setLineItems(lineItems);
  transactionRequestType.setBillTo(billTo);

  const createRequest = new APIContracts.CreateTransactionRequest();
  createRequest.setMerchantAuthentication(merchantAuthenticationType);
  createRequest.setTransactionRequest(transactionRequestType);

  const ctrl = new APIControllers.CreateTransactionController(createRequest.getJSON());
  ctrl.setEnvironment(
    environment === "production" ? Constants.endpoint.production : Constants.endpoint.sandbox
  );

  return new Promise((resolve) => {
    ctrl.execute(() => {
      const apiResponse = ctrl.getResponse();
      const response = new APIContracts.CreateTransactionResponse(apiResponse);

      if (response.getMessages().getResultCode() !== APIContracts.MessageTypeEnum.OK) {
        const message = response.getMessages().getMessage()?.[0];
        resolve({
          success: false,
          error: message?.getText() ?? "The transaction could not be processed.",
        });
        return;
      }

      const transactionResponse = response.getTransactionResponse();
      const transactionMessages = transactionResponse?.getMessages?.();

      if (transactionMessages) {
        resolve({
          success: true,
          transactionId: transactionResponse.getTransId(),
        });
        return;
      }

      const errorText =
        transactionResponse?.getErrors?.()?.getError?.()?.[0]?.getErrorText?.() ??
        "Your card was declined.";
      resolve({ success: false, error: errorText });
    });
  });
}
