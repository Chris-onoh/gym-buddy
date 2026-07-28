import { generateReference } from "./utils";

interface OpayConfig {
  merchantId: string;
  publicKey: string;
  privateKey: string;
  baseUrl: string;
  callbackUrl: string;
}

function getOpayConfig(): OpayConfig {
  return {
    merchantId: process.env.OPAY_MERCHANT_ID || "",
    publicKey: process.env.OPAY_PUBLIC_KEY || "",
    privateKey: process.env.OPAY_PRIVATE_KEY || "",
    baseUrl: process.env.OPAY_BASE_URL || "https://sandboxapi.opaycheckout.com",
    callbackUrl: process.env.OPAY_CALLBACK_URL || "http://localhost:3000/api/payments/callback",
  };
}

interface InitializePaymentParams {
  amount: number;
  email: string;
  name: string;
  description: string;
  type: string;
  metadata?: Record<string, string>;
}

export async function initializeOpayPayment(params: InitializePaymentParams) {
  const config = getOpayConfig();
  const reference = generateReference();

  const payload = {
    country: "NG",
    reference,
    amount: {
      currency: "NGN",
      total: String(Math.round(params.amount * 100)),
    },
    returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payments?ref=${reference}`,
    callbackUrl: config.callbackUrl,
    cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payments?ref=${reference}&status=cancelled`,
    userInfo: {
      userEmail: params.email,
      userName: params.name,
    },
    productDescription: params.description,
    payMethod: "Account",
  };

  try {
    const response = await fetch(`${config.baseUrl}/api/v1.0/transaction/initialize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.publicKey}`,
        MerchantId: config.merchantId,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return { success: true, data: { ...data, reference }, payload };
  } catch (error) {
    console.error("OPay payment initialization failed:", error);
    return { success: false, error: "Payment initialization failed", reference };
  }
}

export async function verifyOpayPayment(reference: string) {
  const config = getOpayConfig();

  try {
    const response = await fetch(
      `${config.baseUrl}/api/v1.0/transaction/status`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.publicKey}`,
          MerchantId: config.merchantId,
        },
        body: JSON.stringify({ reference }),
      }
    );

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("OPay payment verification failed:", error);
    return { success: false, error: "Payment verification failed" };
  }
}
