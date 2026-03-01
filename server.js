const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const PayOS = require("@payos/node");

dotenv.config({ path: path.resolve(__dirname, ".env.local") });

const app = express();
const BASE_URL = process.env.BASE_URL || "http://localhost:3030";
const PRICE_PER_ENVELOPE = 10000;
const requiredEnv = ["PAYOS_CLIENT_ID", "PAYOS_API_KEY", "PAYOS_CHECKSUM_KEY"];

const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(`Missing required environment variables: ${missingEnv.join(", ")}`);
  process.exit(1);
}

const payOS = new PayOS(
  process.env.PAYOS_CLIENT_ID,
  process.env.PAYOS_API_KEY,
  process.env.PAYOS_CHECKSUM_KEY
);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve Vite build
app.use(express.static(path.join(__dirname, "dist")));

function parsePositiveInteger(value) {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) {
    return value;
  }

  if (typeof value === "string" && /^[0-9]+$/.test(value.trim())) {
    const parsed = Number(value);
    return parsed > 0 ? parsed : null;
  }

  return null;
}

app.post("/create-payment-link", async (req, res) => {
  const amount = parsePositiveInteger(req.body?.amount);
  const quantity = parsePositiveInteger(req.body?.quantity);

  if (!amount) {
    return res.status(400).json({ error: "Invalid amount. Expected a positive integer." });
  }

  if (!quantity) {
    return res.status(400).json({ error: "Invalid quantity. Expected an integer >= 1." });
  }

  const expectedAmount = quantity * PRICE_PER_ENVELOPE;
  if (amount !== expectedAmount) {
    return res.status(400).json({
      error: `Amount mismatch. Expected ${expectedAmount} for quantity ${quantity}.`,
    });
  }

  const body = {
    orderCode: Number(String(Date.now()).slice(-6)),
    amount,
    description: "Li xi Tet 2026",
    items: [
      {
        name: "Phong bi li xi do",
        quantity,
        price: PRICE_PER_ENVELOPE,
      },
    ],
    returnUrl: `${BASE_URL}?success=true&amount=${amount}&quantity=${quantity}`,
    cancelUrl: `${BASE_URL}?canceled=true`,
  };

  try {
    const paymentLinkResponse = await payOS.createPaymentLink(body);
    if (!paymentLinkResponse?.checkoutUrl) {
      return res.status(500).json({ error: "Payment provider returned an invalid checkout URL." });
    }

    return res.status(200).json({ checkoutUrl: paymentLinkResponse.checkoutUrl });
  } catch (error) {
    console.error("PayOS error:", error);
    const providerMessage =
      error?.response?.data?.desc || error?.response?.data?.message || error?.message;
    return res.status(500).json({
      error: providerMessage
        ? `Could not create payment link: ${providerMessage}`
        : "Could not create payment link.",
    });
  }
});

// Serve index.html for client-side routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const port = Number(process.env.PORT) || 3030;
app.listen(port, () => {
  console.log(`Lucky Money server is running at http://localhost:${port}`);
});
