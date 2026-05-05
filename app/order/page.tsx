"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

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

const PRODUCT_OPTIONS = [
  "유정 오리알 10구",
  "유정 오리알 30구",
  "훈제 오리알 세트",
];

export default function OrderPage() {
  const searchParams = useSearchParams();
  const productFromQuery = searchParams.get("product") || "유정 오리알 10구";

  const [selectedProduct, setSelectedProduct] = useState(productFromQuery);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [depositorName, setDepositorName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [message, setMessage] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [stocks, setStocks] = useState<StockMap>(DEFAULT_STOCKS);
  const [loadingText, setLoadingText] = useState("재고를 불러오는 중입니다...");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadStocks = async () => {
    setLoadingText("재고를 불러오는 중입니다...");

    const { data, error } = await supabase
      .from("stocks")
      .select("product, stock");

    if (error) {
      setLoadingText(`재고 조회 실패: ${error.message}`);
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
  };

  useEffect(() => {
    loadStocks();
  }, []);

  useEffect(() => {
    const queryProduct = searchParams.get("product");
    if (queryProduct && PRODUCT_OPTIONS.includes(queryProduct)) {
      setSelectedProduct(queryProduct);
    }
  }, [searchParams]);

  useEffect(() => {
    setMessage("");
    setOrderNumber("");
    setQuantity("1");
  }, [selectedProduct]);

  const getProductPrice = () => {
    if (selectedProduct === "유정 오리알 10구") return 12000;
    if (selectedProduct === "유정 오리알 30구") return 32000;
    if (selectedProduct === "훈제 오리알 세트") return 18000;
    return 0;
  };

  const productPrice = getProductPrice();
  const productStock = stocks[selectedProduct] ?? 0;
  const totalPrice = productPrice * Number(quantity || 0);

  const createOrderNumber = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const random = Math.floor(100 + Math.random() * 900);

    return `ORD-${year}${month}${day}-${random}`;
  };

  const handleOrder = async () => {
    const quantityNumber = Number(quantity);

    if (productStock === 0) {
      setMessage("현재 품절 상태입니다.");
      setOrderNumber("");
      return;
    }

    if (
      !name ||
      !phone ||
      !address ||
      !detailAddress ||
      !depositorName ||
      !quantity
    ) {
      setMessage("모든 정보를 입력해주세요.");
      setOrderNumber("");
      return;
    }

    if (quantityNumber <= 0) {
      setMessage("수량은 1개 이상 입력해주세요.");
      setOrderNumber("");
      return;
    }

    if (quantityNumber > productStock) {
      setMessage(`재고가 부족합니다. 현재 재고는 ${productStock}개입니다.`);
      setOrderNumber("");
      return;
    }

    setIsSubmitting(true);

    const newOrderNumber = createOrderNumber();
    const newStock = productStock - quantityNumber;

    const { error: insertError } = await supabase.from("orders").insert([
      {
        order_number: newOrderNumber,
        product: selectedProduct,
        name,
        phone,
        address,
        detail_address: detailAddress,
        depositor_name: depositorName,
        quantity: quantityNumber,
        total_price: totalPrice,
        status: "접수",
        payment_status: "입금대기",
      },
    ]);

    if (insertError) {
      setMessage(`주문 저장 실패: ${insertError.message}`);
      setOrderNumber("");
      setIsSubmitting(false);
      return;
    }

    const { error: stockError } = await supabase
      .from("stocks")
      .update({
        stock: newStock,
        updated_at: new Date().toISOString(),
      })
      .eq("product", selectedProduct);

    if (stockError) {
      setMessage(`재고 차감 실패: ${stockError.message}`);
      setOrderNumber("");
      setIsSubmitting(false);
      return;
    }

    setStocks((prev) => ({
      ...prev,
      [selectedProduct]: newStock,
    }));

    setOrderNumber(newOrderNumber);
    setMessage(
      `${name}님, ${selectedProduct} 주문이 접수되었습니다. 입금자명은 ${depositorName}이며, 결제 금액은 ${totalPrice.toLocaleString()}원입니다. 남은 재고는 ${newStock}개입니다.`
    );

    setName("");
    setPhone("");
    setAddress("");
    setDetailAddress("");
    setDepositorName("");
    setQuantity("1");
    setIsSubmitting(false);
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
      <div style={{ maxWidth: "920px", margin: "0 auto" }}>
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
                주문 페이지
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
                상품을 고른 뒤 아래 순서대로 입력해 주세요.
              </p>
            </div>

            <nav
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                width: "100%",
                maxWidth: "420px",
              }}
            >
              <Link href="/" style={navButtonStyle}>
                홈
              </Link>
              <Link href="/order" style={navButtonStyle}>
                주문하기
              </Link>
              <Link href="/admin" style={navButtonStyle}>
                관리자
              </Link>
            </nav>
          </div>
        </header>

        {loadingText && (
          <section style={noticeBoxStyle}>
            <strong>{loadingText}</strong>
          </section>
        )}

        <section style={sectionBoxStyle}>
          <h2 style={sectionTitleStyle}>1. 상품 선택</h2>
          <label style={labelStyle}>주문할 상품</label>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            style={inputStyle}
          >
            {PRODUCT_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </section>

        <section style={sectionBoxStyle}>
          <h2 style={sectionTitleStyle}>2. 주문 정보 확인</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "14px",
            }}
          >
            <div style={summaryCardStyle}>
              <div style={summaryLabelStyle}>선택한 상품</div>
              <div style={summaryValueStyle}>{selectedProduct}</div>
            </div>

            <div style={summaryCardStyle}>
              <div style={summaryLabelStyle}>상품 가격</div>
              <div style={summaryValueStyle}>{productPrice.toLocaleString()}원</div>
            </div>

            <div style={summaryCardStyle}>
              <div style={summaryLabelStyle}>현재 재고</div>
              <div
                style={{
                  ...summaryValueStyle,
                  color: productStock === 0 ? "#b00020" : "#234b2b",
                }}
              >
                {productStock}개
              </div>
            </div>

            <div style={summaryCardStyle}>
              <div style={summaryLabelStyle}>총 금액</div>
              <div style={summaryValueStyle}>{totalPrice.toLocaleString()}원</div>
            </div>
          </div>

          {productStock === 0 && (
            <div
              style={{
                marginTop: "16px",
                padding: "18px",
                borderRadius: "16px",
                backgroundColor: "#fff1f1",
                border: "2px solid #d86b6b",
                color: "#b00020",
                fontSize: "22px",
                fontWeight: 800,
                textAlign: "center",
              }}
            >
              현재 품절된 상품입니다.
            </div>
          )}
        </section>

        <section style={sectionBoxStyle}>
          <h2 style={sectionTitleStyle}>3. 주문자 정보 입력</h2>

          <div style={{ display: "grid", gap: "18px" }}>
            <div>
              <label style={labelStyle}>이름</label>
              <input
                type="text"
                placeholder="이름을 입력하세요"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyle}
                disabled={productStock === 0 || isSubmitting}
              />
            </div>

            <div>
              <label style={labelStyle}>전화번호</label>
              <input
                type="text"
                placeholder="010-1234-5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={inputStyle}
                disabled={productStock === 0 || isSubmitting}
              />
            </div>

            <div>
              <label style={labelStyle}>주소</label>
              <input
                type="text"
                placeholder="주소를 입력하세요"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={inputStyle}
                disabled={productStock === 0 || isSubmitting}
              />
            </div>

            <div>
              <label style={labelStyle}>상세주소</label>
              <input
                type="text"
                placeholder="상세주소를 입력하세요"
                value={detailAddress}
                onChange={(e) => setDetailAddress(e.target.value)}
                style={inputStyle}
                disabled={productStock === 0 || isSubmitting}
              />
            </div>

            <div>
              <label style={labelStyle}>입금자명</label>
              <input
                type="text"
                placeholder="입금자명을 입력하세요"
                value={depositorName}
                onChange={(e) => setDepositorName(e.target.value)}
                style={inputStyle}
                disabled={productStock === 0 || isSubmitting}
              />
            </div>

            <div>
              <label style={labelStyle}>수량</label>
              <input
                type="number"
                placeholder="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                style={inputStyle}
                disabled={productStock === 0 || isSubmitting}
              />
            </div>
          </div>
        </section>

        <section style={sectionBoxStyle}>
          <h2 style={sectionTitleStyle}>4. 주문 접수</h2>

          {productStock === 0 ? (
            <div
              style={{
                display: "block",
                width: "100%",
                textAlign: "center",
                padding: "20px 16px",
                borderRadius: "16px",
                backgroundColor: "#eeeeee",
                border: "2px solid #bbbbbb",
                color: "#555555",
                fontSize: "24px",
                fontWeight: 800,
                boxSizing: "border-box",
              }}
            >
              품절
            </div>
          ) : (
            <button
              onClick={handleOrder}
              style={orderButtonStyle}
              disabled={isSubmitting}
            >
              {isSubmitting ? "주문 처리 중입니다..." : "주문 접수하기"}
            </button>
          )}
        </section>

        {message && (
          <section
            style={{
              ...sectionBoxStyle,
              border: "2px solid #b9cfb1",
              backgroundColor: "#fcfff9",
            }}
          >
            <h2 style={sectionTitleStyle}>주문 안내</h2>
            <p
              style={{
                fontSize: "21px",
                lineHeight: "1.8",
                fontWeight: 700,
                marginTop: 0,
              }}
            >
              {message}
            </p>

            {orderNumber && (
              <p
                style={{
                  fontSize: "22px",
                  fontWeight: 800,
                  marginBottom: "18px",
                }}
              >
                주문번호: {orderNumber}
              </p>
            )}

            <div
              style={{
                borderTop: "2px solid #d9e5d4",
                paddingTop: "16px",
              }}
            >
              <h3
                style={{
                  margin: "0 0 10px 0",
                  fontSize: "24px",
                  fontWeight: 800,
                }}
              >
                무통장입금 안내
              </h3>
              <p style={infoTextStyle}>은행명: 국민은행</p>
              <p style={infoTextStyle}>계좌번호: 123-456-789012</p>
              <p style={infoTextStyle}>예금주: 홍길동</p>
              <p style={infoTextStyle}>
                입금자명은 주문서에 입력한 이름과 같게 해주세요.
              </p>
              <p style={infoTextStyle}>입금 확인 후 배송이 시작됩니다.</p>
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

const noticeBoxStyle: React.CSSProperties = {
  backgroundColor: "#fffdf7",
  border: "2px solid #d8cfb0",
  borderRadius: "20px",
  padding: "14px 18px",
  marginBottom: "18px",
  fontSize: "18px",
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

const summaryCardStyle: React.CSSProperties = {
  backgroundColor: "#f8f3e4",
  borderRadius: "16px",
  padding: "16px",
};

const summaryLabelStyle: React.CSSProperties = {
  fontSize: "18px",
  color: "#555555",
  fontWeight: 700,
  marginBottom: "8px",
};

const summaryValueStyle: React.CSSProperties = {
  fontSize: "clamp(24px, 4.5vw, 28px)",
  fontWeight: 800,
  lineHeight: "1.3",
  color: "#111111",
  wordBreak: "keep-all",
};

const orderButtonStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  textAlign: "center",
  padding: "18px 14px",
  borderRadius: "16px",
  backgroundColor: "#2f5d3a",
  border: "2px solid #2f5d3a",
  color: "#ffffff",
  fontSize: "clamp(22px, 5vw, 26px)",
  fontWeight: 800,
  cursor: "pointer",
  boxSizing: "border-box",
};

const infoTextStyle: React.CSSProperties = {
  margin: "0 0 8px 0",
  fontSize: "19px",
  lineHeight: "1.7",
};