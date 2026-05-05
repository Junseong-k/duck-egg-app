"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getFriendlyErrorMessage } from "@/lib/friendlyError";

type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  shortLabel: string;
  description: string;
};

type StockRow = {
  product: string;
  stock: number;
};

type StockMap = {
  [key: string]: number;
};

const DEFAULT_STOCKS: StockMap = {
  "유정 오리알 10구": 15,
  "유정 오리알 30구": 0,
  "훈제 오리알 세트": 20,
};

export default function Home() {
  const [stocks, setStocks] = useState<StockMap>(DEFAULT_STOCKS);
  const [loadingText, setLoadingText] = useState("재고를 불러오는 중입니다...");

  const loadStocks = useCallback(async () => {
    setLoadingText("재고를 불러오는 중입니다...");

    const { data, error } = await supabase
      .from("stocks")
      .select("product, stock");

    if (error) {
      setLoadingText(getFriendlyErrorMessage(error));
      setStocks(DEFAULT_STOCKS);
      return;
    }

    const stockMap: StockMap = {};
    (data || []).forEach((item: StockRow) => {
      stockMap[item.product] = item.stock;
    });

    setStocks({
      ...DEFAULT_STOCKS,
      ...stockMap,
    });
    setLoadingText("");
  }, []);

  useEffect(() => {
    loadStocks();

    const handleFocus = () => {
      loadStocks();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [loadStocks]);

  const products: Product[] = [
    {
      id: 1,
      name: "유정 오리알 10구",
      price: 12000,
      stock: stocks["유정 오리알 10구"] ?? 0,
      shortLabel: "10구",
      description: "신선한 유정 오리알 10개 구성",
    },
    {
      id: 2,
      name: "유정 오리알 30구",
      price: 32000,
      stock: stocks["유정 오리알 30구"] ?? 0,
      shortLabel: "30구",
      description: "가정용으로 넉넉한 30개 구성",
    },
    {
      id: 3,
      name: "훈제 오리알 세트",
      price: 18000,
      stock: stocks["훈제 오리알 세트"] ?? 0,
      shortLabel: "훈제",
      description: "바로 드시기 좋은 훈제 오리알 세트",
    },
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#f7f1dc",
        color: "#222222",
        padding: "20px 14px 50px",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
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
                  fontSize: "clamp(28px, 5vw, 36px)",
                  lineHeight: "1.25",
                  fontWeight: 800,
                }}
              >
                오리알 판매 앱
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
                상품을 고르고 바로 주문할 수 있습니다.
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

        {loadingText && (
          <section
            style={{
              backgroundColor: "#fffdf7",
              border: "2px solid #d8cfb0",
              borderRadius: "20px",
              padding: "14px 18px",
              marginBottom: "18px",
              fontSize: "18px",
              fontWeight: 700,
            }}
          >
            {loadingText}
          </section>
        )}

        <section
          style={{
            backgroundColor: "#fffdf7",
            border: "2px solid #d8cfb0",
            borderRadius: "20px",
            padding: "18px",
            marginBottom: "18px",
          }}
        >
          <h2
            style={{
              margin: "0 0 14px 0",
              fontSize: "clamp(24px, 4.5vw, 28px)",
              fontWeight: 800,
            }}
          >
            이용 안내
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "12px",
            }}
          >
            <div style={guideCardStyle}>
              <div style={guideNumberStyle}>1</div>
              <div>
                <div style={guideTitleStyle}>상품 선택</div>
                <div style={guideTextStyle}>원하는 상품을 고릅니다.</div>
              </div>
            </div>

            <div style={guideCardStyle}>
              <div style={guideNumberStyle}>2</div>
              <div>
                <div style={guideTitleStyle}>주문서 작성</div>
                <div style={guideTextStyle}>이름, 주소, 수량을 입력합니다.</div>
              </div>
            </div>

            <div style={guideCardStyle}>
              <div style={guideNumberStyle}>3</div>
              <div>
                <div style={guideTitleStyle}>입금 확인</div>
                <div style={guideTextStyle}>입금 후 배송이 진행됩니다.</div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2
            style={{
              margin: "0 0 18px 4px",
              fontSize: "clamp(26px, 4.8vw, 30px)",
              fontWeight: 800,
            }}
          >
            상품 목록
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "18px",
            }}
          >
            {products.map((product) => {
              const isSoldOut = product.stock === 0;

              return (
                <article
                  key={product.id}
                  style={{
                    backgroundColor: "#fffdf7",
                    border: "2px solid #d8cfb0",
                    borderRadius: "22px",
                    padding: "20px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                  }}
                >
                  <div
                    style={{
                      height: "130px",
                      borderRadius: "18px",
                      backgroundColor: "#ece6d1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "32px",
                      fontWeight: 800,
                      color: "#5f5a4b",
                      marginBottom: "16px",
                    }}
                  >
                    {product.shortLabel}
                  </div>

                  <h3
                    style={{
                      margin: "0 0 10px 0",
                      fontSize: "clamp(24px, 4.5vw, 28px)",
                      lineHeight: "1.35",
                      fontWeight: 800,
                    }}
                  >
                    {product.name}
                  </h3>

                  <p
                    style={{
                      margin: "0 0 16px 0",
                      fontSize: "18px",
                      lineHeight: "1.7",
                      color: "#555555",
                    }}
                  >
                    {product.description}
                  </p>

                  <div
                    style={{
                      backgroundColor: "#f8f3e4",
                      borderRadius: "16px",
                      padding: "16px",
                      marginBottom: "16px",
                    }}
                  >
                    <p
                      style={{
                        margin: "0 0 10px 0",
                        fontSize: "clamp(24px, 4.5vw, 28px)",
                        fontWeight: 800,
                        color: "#111111",
                      }}
                    >
                      {product.price.toLocaleString()}원
                    </p>

                    <p
                      style={{
                        margin: 0,
                        fontSize: "20px",
                        fontWeight: 800,
                        color: isSoldOut ? "#b00020" : "#234b2b",
                      }}
                    >
                      {isSoldOut ? "현재 품절" : `재고 ${product.stock}개`}
                    </p>
                  </div>

                  {isSoldOut ? (
                    <div
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "center",
                        padding: "16px 14px",
                        borderRadius: "16px",
                        backgroundColor: "#fff1f1",
                        border: "2px solid #d86b6b",
                        color: "#b00020",
                        fontSize: "21px",
                        fontWeight: 800,
                        boxSizing: "border-box",
                      }}
                    >
                      품절
                    </div>
                  ) : (
                    <Link
                      href={`/order?product=${encodeURIComponent(product.name)}`}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "center",
                        padding: "16px 14px",
                        borderRadius: "16px",
                        backgroundColor: "#2f5d3a",
                        border: "2px solid #2f5d3a",
                        color: "#ffffff",
                        textDecoration: "none",
                        fontSize: "21px",
                        fontWeight: 800,
                        boxSizing: "border-box",
                      }}
                    >
                      이 상품 주문하기
                    </Link>
                  )}
                </article>
              );
            })}
          </div>
        </section>
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

const guideCardStyle: React.CSSProperties = {
  display: "flex",
  gap: "12px",
  alignItems: "flex-start",
  padding: "16px",
  borderRadius: "16px",
  backgroundColor: "#f8f3e4",
};

const guideNumberStyle: React.CSSProperties = {
  minWidth: "40px",
  height: "40px",
  borderRadius: "999px",
  backgroundColor: "#2f5d3a",
  color: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 800,
  fontSize: "20px",
};

const guideTitleStyle: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: 800,
  marginBottom: "6px",
};

const guideTextStyle: React.CSSProperties = {
  fontSize: "18px",
  lineHeight: "1.6",
  color: "#555555",
};