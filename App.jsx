import React, { useEffect, useState } from "react";

const PRICE_PER_ENVELOPE = 10000;

const formatVND = (amount) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

const Petals = () => (
  <div className="petals-container" aria-hidden="true">
    {Array.from({ length: 12 }).map((_, i) => (
      <div key={i} className={`petal petal-${i + 1}`}>
        *
      </div>
    ))}
  </div>
);

function EnvelopeCard({ quantity, onAdd, onMinus, onPay, loading, errorMessage }) {
  const total = quantity * PRICE_PER_ENVELOPE;

  return (
    <div className="page">
      <Petals />
      <div className="card">
        <div className="card-top-decoration">
          <span>*</span>
          <span>Xuan An Khang</span>
          <span>*</span>
        </div>

        <div className="title-block">
          <div className="year-badge">2026</div>
          <h1 className="title">Li Xi Tet</h1>
          <p className="subtitle">Chúc mừng năm mới cho Trần Nam Sơn</p>
        </div>

        <div className="envelope-display">
          <img src="/horse.webp" alt="" className="lixiImage"/>
          <div className="envelope-glow" />
        </div>

        <div className="product-info">
          <div className="product-name">Phong bi li xi do</div>
          <div className="product-price">{formatVND(PRICE_PER_ENVELOPE)} / phong</div>
        </div>

        <div className="quantity-section">
          <button className="qty-btn minus" onClick={onMinus} disabled={quantity <= 1 || loading}>
            -
          </button>
          <div className="qty-display">
            <span className="qty-number">{quantity}</span>
            <span className="qty-label">phong bi</span>
          </div>
          <button className="qty-btn plus" onClick={onAdd} disabled={loading}>
            +
          </button>
        </div>

        <div className="total-section">
          <div className="total-label">Tong tien</div>
          <div className="total-amount">{formatVND(total)}</div>
        </div>

        <button className={`pay-btn ${loading ? "loading" : ""}`} onClick={onPay} disabled={loading}>
          {loading ? (
            <span className="loading-dots">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
          ) : (
            <>
              <span>[PAY]</span>
              <span>Thanh toan ngay</span>
            </>
          )}
        </button>

        {errorMessage ? (
          <div className="footer-note" role="alert">
            {errorMessage}
          </div>
        ) : null}

        <div className="footer-note">Thanh toan an toan qua PayOS, nhan QR ngan hang tuc thi</div>
      </div>
    </div>
  );
}

function SuccessPage({ amount, quantity }) {
  return (
    <div className="page">
      <Petals />
      <div className="card success-card">
        <div className="success-icon">OK</div>
        <h2 className="success-title">Thanh toan thanh cong</h2>
        <p className="success-msg">
          Ban da gui <strong>{quantity} phong li xi</strong> tri gia{" "}
          <strong>{formatVND(Number(amount))}</strong>.
        </p>
        <p className="success-wish">Chuc mung nam moi, van su nhu y, phat tai phat loc</p>
        <button className="pay-btn" onClick={() => window.location.assign("/")}>
          Back - Gui them li xi
        </button>
      </div>
    </div>
  );
}

function CanceledPage() {
  return (
    <div className="page">
      <Petals />
      <div className="card success-card">
        <div className="success-icon">X</div>
        <h2 className="success-title">Thanh toan bi huy</h2>
        <p className="success-msg">Don hang da bi huy. Ban co the thu lai bat cu luc nao.</p>
        <button className="pay-btn" onClick={() => window.location.assign("/")}>
          Back - Quay lai
        </button>
      </div>
    </div>
  );
}

function readQueryPositiveInteger(query, key, fallback) {
  const raw = query.get(key);
  if (!raw || !/^[0-9]+$/.test(raw)) return fallback;
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export default function App() {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState("order");
  const [successData, setSuccessData] = useState({ amount: 0, quantity: 1 });
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("success")) {
      setSuccessData({
        amount: readQueryPositiveInteger(query, "amount", 0),
        quantity: readQueryPositiveInteger(query, "quantity", 1),
      });
      setPage("success");
      return;
    }

    if (query.get("canceled")) {
      setPage("canceled");
    }
  }, []);

  const handlePay = async () => {
    if (!Number.isInteger(quantity) || quantity < 1) {
      setErrorMessage("Invalid quantity. Please choose at least 1 item.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/create-payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: quantity * PRICE_PER_ENVELOPE, quantity }),
      });

      let data = null;
      try {
        data = await response.json();
      } catch (parseError) {
        data = null;
      }

      if (!response.ok) {
        throw new Error(data?.error || `Request failed with status ${response.status}.`);
      }

      if (typeof data?.checkoutUrl === "string" && data.checkoutUrl.length > 0) {
        window.location.assign(data.checkoutUrl);
        return;
      }

      throw new Error("Server did not return a valid checkout URL.");
    } catch (error) {
      setErrorMessage(error?.message || "Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  if (page === "success") return <SuccessPage {...successData} />;
  if (page === "canceled") return <CanceledPage />;

  return (
    <EnvelopeCard
      quantity={quantity}
      onAdd={() => setQuantity((value) => value + 1)}
      onMinus={() => setQuantity((value) => Math.max(1, value - 1))}
      onPay={handlePay}
      loading={loading}
      errorMessage={errorMessage}
    />
  );
}
