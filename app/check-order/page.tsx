"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

type OrderResult = {
  order_number: string;
  product: string;
  name: string;
  quantity: number;
  total_price: number;
  status?: string;
  payment_status?: string;
  created_at?: string;
};

export default function CheckOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [order, setOrder] = useState<OrderResult | null>(null);

  const handleSearch = async () => {
    const trimmed = orderNumber.trim();

    if (!trimmed) {
      setMessage("주문번호를 입력해 주세요.");
      setOrder(null);
      return;
    }

    setLoading(true);
    setMessage("");
    setOrder(null);

    const { data, error } = await supabase
      .from("orders")
      .select(
        "order_number, product, name, quantity, total_price, status, payment_status, created_at"
      )
      .eq("order_number", trimmed)
      .limit(1)
      .maybeSingle();

    if (error) {
      setMessage(`조회 실패: ${error.message}`);
      setLoading(false);
      return;
    }

    if (!data) {
      setMessage("해당 주문번호를 찾을 수 없습니다.");
      setLoading(false);
      return;
    }

    setOrder(data);
    setLoading(false);
  };

  const getStatusText = (status?: string) => {
    if (status === "접수") return "주문이 접수되었습니다.";
    if (status === "준비중") return "상품을 준비하고 있습니다.";
    if (status === "배송중") return "상품이 배송 중입니다.";
    if (status === "완료") return "주문이 완료되었습니다.";
    return "주문 상태를 확인 중입니다.";
  };

  const getPaymentText = (paymentStatus?: string) => {
    if (paymentStatus === "입금대기") return "입금 확인 전입니다.";
    if (paymentStatus === "입금확인") return "입금이 확인되었습니다.";
    return "입금 상태를 확인 중입니다.";
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#f7f1dc",
        color: "#222222",
        padding: "20px 14px 50px",
      }}
    >
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>
        <header
          style={{
            backgroundColor: "#fffdf7",
            border: "2px solid #d8cfb0",
            borderRadius: "20px",
            padding: "20px",
            marginBottom: "18px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h1
                style={{
                  margin: "0 0 10px 0",
                  fontSize: "clamp(28px, 5vw, 34px)",
                  lineHeight: "1.25",
                  fontWeight: 800,
                }}
              >
                주문 진행상황 확인
              </h1>
              <p
                style={{
                  margin: 0,
                  fontSize: "clamp(17px, 3.8vw, 20px)",
                  lineHeight: "1.6",
                  color: "#444444",
                  fontWeight: 600,
                }}
              >
                주문번호를 입력하면 현재 진행상태를 볼 수 있습니다.
              </p>
            </div>

            <nav
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                width: "100%",
                maxWidth: "520px",
              }}
            >
              <Link href="/" style={navButtonStyle}>
                홈
              </Link>
              <Link href="/order" style={navButtonStyle}>
                주문하기
              </Link>
              <Link href="/check-order" style={navButtonStyle}>
                주문조회
              </Link>
              <Link href="/admin" style={navButtonStyle}>
                관리자
              </Link>
            </nav>
          </div>
        </header>

        <section style={sectionBoxStyle}>
          <h2 style={sectionTitleStyle}>1. 주문번호 입력</h2>
          <label style={labelStyle}>주문번호</label>
          <input
            type="text"
            placeholder="예: ORD-20260412-111"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            style={inputStyle}
          />

          <div style={{ marginTop: "16px" }}>
            <button
              onClick={handleSearch}
              style={searchButtonStyle}
              disabled={loading}
            >
              {loading ? "조회 중입니다..." : "주문 상태 확인하기"}
            </button>
          </div>
        </section>

        {message && (
          <section
            style={{
              ...sectionBoxStyle,
              border: "2px solid #d8cfb0",
              backgroundColor: "#fffdf7",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "21px",
                lineHeight: "1.8",
                fontWeight: 700,
              }}
            >
              {message}
            </p>
          </section>
        )}

        {order && (
          <section
            style={{
              ...sectionBoxStyle,
              border: "2px solid #b9cfb1",
              backgroundColor: "#fcfff9",
            }}
          >
            <h2 style={sectionTitleStyle}>2. 주문 조회 결과</h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "14px",
                marginBottom: "18px",
              }}
            >
              <div style={infoCardStyle}>
                <div style={infoLabelStyle}>주문번호</div>
                <div style={infoValueStyle}>{order.order_number}</div>
              </div>

              <div style={infoCardStyle}>
                <div style={infoLabelStyle}>상품명</div>
                <div style={infoValueStyle}>{order.product}</div>
              </div>

              <div style={infoCardStyle}>
                <div style={infoLabelStyle}>주문자</div>
                <div style={infoValueStyle}>{order.name}</div>
              </div>

              <div style={infoCardStyle}>
                <div style={infoLabelStyle}>수량</div>
                <div style={infoValueStyle}>{order.quantity}개</div>
              </div>

              <div style={infoCardStyle}>
                <div style={infoLabelStyle}>총 금액</div>
                <div style={infoValueStyle}>
                  {order.total_price.toLocaleString()}원
                </div>
              </div>

              <div style={infoCardStyle}>
                <div style={infoLabelStyle}>주문시간</div>
                <div style={infoValueStyle}>{order.created_at || "시간 없음"}</div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "14px",
              }}
            >
              <div
                style={{
                  backgroundColor: "#eef6ff",
                  borderRadius: "16px",
                  padding: "18px",
                }}
              >
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: 800,
                    marginBottom: "8px",
                  }}
                >
                  주문 상태
                </div>
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: 800,
                    marginBottom: "8px",
                  }}
                >
                  {order.status || "확인중"}
                </div>
                <div
                  style={{
                    fontSize: "19px",
                    lineHeight: "1.7",
                    color: "#444444",
                    fontWeight: 700,
                  }}
                >
                  {getStatusText(order.status)}
                </div>
              </div>

              <div
                style={{
                  backgroundColor: "#fff6e8",
                  borderRadius: "16px",
                  padding: "18px",
                }}
              >
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: 800,
                    marginBottom: "8px",
                  }}
                >
                  입금 상태
                </div>
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: 800,
                    marginBottom: "8px",
                  }}
                >
                  {order.payment_status || "확인중"}
                </div>
                <div
                  style={{
                    fontSize: "19px",
                    lineHeight: "1.7",
                    color: "#444444",
                    fontWeight: 700,
                  }}
                >
                  {getPaymentText(order.payment_status)}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

const navButtonStyle: React.CSSProperties = {
  display: "inline-block",
  flex: "1 1 110px",
  textAlign: "center",
  padding: "14px 16px",
  border: "2px solid #8f8769",
  borderRadius: "14px",
  backgroundColor: "#ffffff",
  color: "#111111",
  textDecoration: "none",
  fontSize: "18px",
  fontWeight: 800,
  boxSizing: "border-box",
};

const sectionBoxStyle: React.CSSProperties = {
  backgroundColor: "#fffdf7",
  border: "2px solid #d8cfb0",
  borderRadius: "20px",
  padding: "20px",
  marginBottom: "18px",
};

const sectionTitleStyle: React.CSSProperties = {
  margin: "0 0 16px 0",
  fontSize: "clamp(24px, 4.8vw, 30px)",
  fontWeight: 800,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "8px",
  fontSize: "20px",
  fontWeight: 800,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "15px",
  fontSize: "19px",
  lineHeight: "1.5",
  color: "#111111",
  backgroundColor: "#ffffff",
  border: "2px solid #a59d83",
  borderRadius: "14px",
  boxSizing: "border-box",
};

const searchButtonStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  textAlign: "center",
  padding: "18px 14px",
  borderRadius: "16px",
  backgroundColor: "#2f5d3a",
  border: "2px solid #2f5d3a",
  color: "#ffffff",
  fontSize: "22px",
  fontWeight: 800,
  cursor: "pointer",
  boxSizing: "border-box",
};

const infoCardStyle: React.CSSProperties = {
  backgroundColor: "#f8f3e4",
  borderRadius: "16px",
  padding: "14px",
};

const infoLabelStyle: React.CSSProperties = {
  fontSize: "17px",
  color: "#555555",
  fontWeight: 700,
  marginBottom: "6px",
};

const infoValueStyle: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: 800,
  lineHeight: "1.5",
  color: "#111111",
  wordBreak: "break-word",
};