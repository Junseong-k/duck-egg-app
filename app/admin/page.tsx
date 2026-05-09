"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getFriendlyErrorMessage } from "@/lib/friendlyError";

type AdminOrder = {
  id: number;
  order_number: string;
  product: string;
  name: string;
  phone: string;
  address: string;
  detail_address: string;
  depositor_name: string;
  quantity: number;
  total_price: number;
  created_at?: string;
  status?: string;
  payment_status?: string;
};

type StockRow = {
  id: number;
  product: string;
  stock: number;
  updated_at?: string;
};

type StockMap = {
  [key: string]: number;
};

const DEFAULT_STOCKS: StockMap = {
  "유정 오리알 10구": 15,
  "유정 오리알 30구": 0,
  "훈제 오리알 세트": 20,
};

const PRODUCT_NAMES = [
  "유정 오리알 10구",
  "유정 오리알 30구",
  "훈제 오리알 세트",
];

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [loginMessage, setLoginMessage] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem("admin-auth");
    if (saved === "ok") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    if (!ADMIN_PASSWORD) {
      setLoginMessage("관리자 비밀번호가 아직 설정되지 않았습니다.");
      return;
    }

    if (passwordInput === ADMIN_PASSWORD) {
      sessionStorage.setItem("admin-auth", "ok");
      setIsAuthenticated(true);
      setLoginMessage("");
      return;
    }

    setLoginMessage("비밀번호가 맞지 않습니다.");
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin-auth");
    setIsAuthenticated(false);
    setPasswordInput("");
    setLoginMessage("");
  };

  if (!isAuthenticated) {
    return (
      <main
        style={{
          minHeight: "100vh",
          backgroundColor: "#f7f1dc",
          color: "#222222",
          padding: "20px 14px 50px",
        }}
      >
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
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
                  관리자 로그인
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
                  관리자 비밀번호를 입력해 주세요.
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
              </nav>
            </div>
          </header>

          <section style={sectionBoxStyle}>
            <h2 style={sectionTitleStyle}>관리자 페이지 보호</h2>

            <div style={{ display: "grid", gap: "16px" }}>
              <div>
                <label style={labelStyle}>비밀번호</label>
                <input
                  type="password"
                  placeholder="관리자 비밀번호 입력"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <button onClick={handleLogin} style={orderButtonStyle}>
                관리자 로그인
              </button>

              {loginMessage && (
                <div
                  style={{
                    padding: "14px",
                    borderRadius: "14px",
                    backgroundColor: "#fff1f1",
                    color: "#8b0000",
                    fontSize: "18px",
                    fontWeight: 700,
                  }}
                >
                  {loginMessage}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    );
  }

  return <AdminDashboard onLogout={handleLogout} />;
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [stocks, setStocks] = useState<StockMap>(DEFAULT_STOCKS);
  const [stockInputs, setStockInputs] = useState<StockMap>(DEFAULT_STOCKS);
  const [searchText, setSearchText] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("전체");
  const [selectedStatus, setSelectedStatus] = useState("전체");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("전체");
  const [loadingMessage, setLoadingMessage] = useState("주문 정보를 불러오는 중입니다...");

  const loadOrders = useCallback(async () => {
    setLoadingMessage("주문 정보를 불러오는 중입니다...");

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setLoadingMessage(getFriendlyErrorMessage(error));
      setOrders([]);
      return;
    }

    setOrders(data || []);
    setLoadingMessage("");
  }, []);

  const loadStocks = useCallback(async () => {
    const { data, error } = await supabase
      .from("stocks")
      .select("id, product, stock, updated_at")
      .order("id", { ascending: true });

    if (error) {
      alert(getFriendlyErrorMessage(error));
      setStocks(DEFAULT_STOCKS);
      setStockInputs(DEFAULT_STOCKS);
      return;
    }

    const stockMap: StockMap = {};
    (data || []).forEach((item: StockRow) => {
      stockMap[item.product] = item.stock;
    });

    const mergedStocks = {
      ...DEFAULT_STOCKS,
      ...stockMap,
    };

    setStocks(mergedStocks);
    setStockInputs(mergedStocks);
  }, []);

  useEffect(() => {
    loadOrders();
    loadStocks();

    const handleFocus = () => {
      loadOrders();
      loadStocks();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [loadOrders, loadStocks]);

  const filteredOrders = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !keyword ||
        order.order_number.toLowerCase().includes(keyword) ||
        order.product.toLowerCase().includes(keyword) ||
        order.name.toLowerCase().includes(keyword) ||
        order.phone.toLowerCase().includes(keyword) ||
        order.address.toLowerCase().includes(keyword) ||
        order.detail_address.toLowerCase().includes(keyword) ||
        order.depositor_name.toLowerCase().includes(keyword);

      const matchesProduct =
        selectedProduct === "전체" || order.product === selectedProduct;

      const matchesStatus =
        selectedStatus === "전체" || order.status === selectedStatus;

      const matchesPaymentStatus =
        selectedPaymentStatus === "전체" ||
        order.payment_status === selectedPaymentStatus;

      return (
        matchesSearch &&
        matchesProduct &&
        matchesStatus &&
        matchesPaymentStatus
      );
    });
  }, [orders, searchText, selectedProduct, selectedStatus, selectedPaymentStatus]);

  const summary = useMemo(() => {
    const tenEggCount = orders.filter(
      (order) => order.product === "유정 오리알 10구"
    ).length;

    const thirtyEggCount = orders.filter(
      (order) => order.product === "유정 오리알 30구"
    ).length;

    const smokedEggCount = orders.filter(
      (order) => order.product === "훈제 오리알 세트"
    ).length;

    const totalOrderCount = orders.length;

    const totalSales = orders.reduce((sum, order) => sum + order.total_price, 0);

    return {
      tenEggCount,
      thirtyEggCount,
      smokedEggCount,
      totalOrderCount,
      totalSales,
    };
  }, [orders]);

  const changeStatus = async (id: number, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      alert(getFriendlyErrorMessage(error));
      return;
    }

    await loadOrders();
  };

  const changePaymentStatus = async (id: number, newPaymentStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ payment_status: newPaymentStatus })
      .eq("id", id);

    if (error) {
      alert(getFriendlyErrorMessage(error));
      return;
    }

    await loadOrders();
  };

  const resetOrders = async () => {
    const { error } = await supabase
      .from("orders")
      .delete()
      .neq("id", 0);

    if (error) {
      alert(getFriendlyErrorMessage(error));
      return;
    }

    await loadOrders();
  };

  const resetStocks = async () => {
    const now = new Date().toISOString();

    const updates = [
      { product: "유정 오리알 10구", stock: 15, updated_at: now },
      { product: "유정 오리알 30구", stock: 0, updated_at: now },
      { product: "훈제 오리알 세트", stock: 20, updated_at: now },
    ];

    for (const item of updates) {
      const { error } = await supabase
        .from("stocks")
        .update({
          stock: item.stock,
          updated_at: item.updated_at,
        })
        .eq("product", item.product);

      if (error) {
        alert(getFriendlyErrorMessage(error));
        return;
      }
    }

    await loadStocks();
    alert("재고가 초기값으로 초기화되었습니다.");
  };

  const updateStock = async (product: string) => {
    const newStock = Number(stockInputs[product]);

    if (Number.isNaN(newStock)) {
      alert("숫자를 입력해주세요.");
      return;
    }

    if (newStock < 0) {
      alert("재고는 0 이상이어야 합니다.");
      return;
    }

    const { error } = await supabase
      .from("stocks")
      .update({
        stock: newStock,
        updated_at: new Date().toISOString(),
      })
      .eq("product", product);

    if (error) {
      alert(getFriendlyErrorMessage(error));
      return;
    }

    await loadStocks();
    alert(`${product} 재고가 ${newStock}개로 수정되었습니다.`);
  };

  const resetFilters = () => {
    setSearchText("");
    setSelectedProduct("전체");
    setSelectedStatus("전체");
    setSelectedPaymentStatus("전체");
  };

  const downloadCsv = () => {
    if (filteredOrders.length === 0) {
      alert("다운로드할 주문이 없습니다.");
      return;
    }

    const header = [
      "주문번호",
      "주문시간",
      "상품",
      "주문자",
      "전화번호",
      "주소",
      "상세주소",
      "입금자명",
      "수량",
      "주문상태",
      "입금상태",
      "총금액",
    ];

    const rows = filteredOrders.map((order) => [
      order.order_number,
      order.created_at || "",
      order.product,
      order.name,
      order.phone,
      order.address,
      order.detail_address,
      order.depositor_name,
      String(order.quantity),
      order.status || "",
      order.payment_status || "",
      String(order.total_price),
    ]);

    const csvContent = [header, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "orders.csv";
    link.click();
    URL.revokeObjectURL(url);
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
                  fontSize: "clamp(28px, 5vw, 34px)",
                  lineHeight: "1.25",
                  fontWeight: 800,
                }}
              >
                관리자 페이지
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
                주문 상태와 재고를 쉽게 확인하고 수정할 수 있습니다.
              </p>
            </div>

            <nav
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                width: "100%",
                maxWidth: "640px",
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
              <button onClick={onLogout} style={actionButtonStyle}>
                로그아웃
              </button>
            </nav>
          </div>
        </header>

        <section style={sectionBoxStyle}>
          <h2 style={sectionTitleStyle}>빠른 작업</h2>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <button onClick={() => { loadOrders(); loadStocks(); }} style={actionButtonStyle}>
              주문정보 새로고침
            </button>

            <button
              onClick={resetOrders}
              style={{
                ...actionButtonStyle,
                backgroundColor: "#fff1f1",
                border: "2px solid #d86b6b",
                color: "#8b0000",
              }}
            >
              주문내역 전체 초기화
            </button>

            <button
              onClick={resetStocks}
              style={{
                ...actionButtonStyle,
                backgroundColor: "#fff7e8",
                border: "2px solid #d9b159",
                color: "#7a5a00",
              }}
            >
              재고 초기화
            </button>

            <button
              onClick={downloadCsv}
              style={{
                ...actionButtonStyle,
                backgroundColor: "#eefaf2",
                border: "2px solid #5f9878",
                color: "#1b4332",
              }}
            >
              CSV 다운로드
            </button>
          </div>
        </section>

        <section style={sectionBoxStyle}>
          <h2 style={sectionTitleStyle}>현재 재고 관리</h2>

          <div style={{ display: "grid", gap: "14px" }}>
            {PRODUCT_NAMES.map((product) => (
              <div
                key={product}
                style={{
                  backgroundColor: "#f8f3e4",
                  borderRadius: "16px",
                  padding: "16px",
                }}
              >
                <div
                  style={{
                    fontSize: "23px",
                    fontWeight: 800,
                    marginBottom: "12px",
                  }}
                >
                  {product}
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "stretch",
                    flexWrap: "wrap",
                  }}
                >
                  <input
                    type="number"
                    value={stockInputs[product] ?? 0}
                    onChange={(e) =>
                      setStockInputs((prev) => ({
                        ...prev,
                        [product]: Number(e.target.value),
                      }))
                    }
                    style={stockInputStyle}
                  />

                  <button
                    onClick={() => updateStock(product)}
                    style={actionButtonStyle}
                  >
                    재고 저장
                  </button>

                  <span
                    style={{
                      fontSize: "19px",
                      color: "#555555",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    현재 저장값: {stocks[product] ?? 0}개
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={sectionBoxStyle}>
          <h2 style={sectionTitleStyle}>주문 요약</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "14px",
            }}
          >
            <div style={summaryCardStyle}>
              <div style={summaryLabelStyle}>유정 오리알 10구</div>
              <div style={summaryValueStyle}>{summary.tenEggCount}건</div>
            </div>

            <div style={summaryCardStyle}>
              <div style={summaryLabelStyle}>유정 오리알 30구</div>
              <div style={summaryValueStyle}>{summary.thirtyEggCount}건</div>
            </div>

            <div style={summaryCardStyle}>
              <div style={summaryLabelStyle}>훈제 오리알 세트</div>
              <div style={summaryValueStyle}>{summary.smokedEggCount}건</div>
            </div>

            <div style={summaryCardStyle}>
              <div style={summaryLabelStyle}>전체 주문 수</div>
              <div style={summaryValueStyle}>{summary.totalOrderCount}건</div>
            </div>

            <div style={summaryCardStyle}>
              <div style={summaryLabelStyle}>전체 매출</div>
              <div style={summaryValueStyle}>
                {summary.totalSales.toLocaleString()}원
              </div>
            </div>
          </div>
        </section>

        <section style={sectionBoxStyle}>
          <h2 style={sectionTitleStyle}>주문 검색 / 필터</h2>

          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>검색</label>
            <input
              type="text"
              placeholder="주문번호, 상품명, 주문자, 전화번호로 검색"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "14px",
            }}
          >
            <div>
              <label style={labelStyle}>상품 필터</label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                style={inputStyle}
              >
                <option value="전체">전체</option>
                <option value="유정 오리알 10구">유정 오리알 10구</option>
                <option value="유정 오리알 30구">유정 오리알 30구</option>
                <option value="훈제 오리알 세트">훈제 오리알 세트</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>주문상태 필터</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={inputStyle}
              >
                <option value="전체">전체</option>
                <option value="접수">접수</option>
                <option value="준비중">준비중</option>
                <option value="배송중">배송중</option>
                <option value="완료">완료</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>입금상태 필터</label>
              <select
                value={selectedPaymentStatus}
                onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                style={inputStyle}
              >
                <option value="전체">전체</option>
                <option value="입금대기">입금대기</option>
                <option value="입금확인">입금확인</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: "16px" }}>
            <button onClick={resetFilters} style={actionButtonStyle}>
              필터 초기화
            </button>
          </div>

          <p
            style={{
              marginTop: "16px",
              fontSize: "19px",
              fontWeight: 700,
              color: "#555555",
            }}
          >
            검색 결과: <strong>{filteredOrders.length}건</strong>
          </p>
        </section>

        {loadingMessage && (
          <section style={noticeBoxStyle}>
            <strong>{loadingMessage}</strong>
          </section>
        )}

        <section>
          <h2
            style={{
              margin: "0 0 18px 4px",
              fontSize: "clamp(26px, 4.8vw, 30px)",
              fontWeight: 800,
            }}
          >
            주문 목록
          </h2>

          <div style={{ display: "grid", gap: "16px" }}>
            {filteredOrders.length === 0 ? (
              <div style={sectionBoxStyle}>
                <p
                  style={{
                    margin: 0,
                    fontSize: "20px",
                    fontWeight: 700,
                    color: "#555555",
                  }}
                >
                  검색된 주문이 없습니다.
                </p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <article
                  key={order.id}
                  style={{
                    backgroundColor: "#fffdf7",
                    border: "2px solid #d8cfb0",
                    borderRadius: "20px",
                    padding: "18px",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: "10px",
                      marginBottom: "16px",
                    }}
                  >
                    <div style={orderInfoCardStyle}>
                      <div style={orderInfoLabelStyle}>주문번호</div>
                      <div style={orderInfoValueStyle}>{order.order_number}</div>
                    </div>

                    <div style={orderInfoCardStyle}>
                      <div style={orderInfoLabelStyle}>주문시간</div>
                      <div style={orderInfoValueStyle}>
                        {order.created_at || "시간 없음"}
                      </div>
                    </div>

                    <div style={orderInfoCardStyle}>
                      <div style={orderInfoLabelStyle}>상품</div>
                      <div style={orderInfoValueStyle}>{order.product}</div>
                    </div>

                    <div style={orderInfoCardStyle}>
                      <div style={orderInfoLabelStyle}>주문자</div>
                      <div style={orderInfoValueStyle}>{order.name}</div>
                    </div>

                    <div style={orderInfoCardStyle}>
                      <div style={orderInfoLabelStyle}>전화번호</div>
                      <div style={orderInfoValueStyle}>{order.phone}</div>
                    </div>

                    <div style={orderInfoCardStyle}>
                      <div style={orderInfoLabelStyle}>주소</div>
                      <div style={orderInfoValueStyle}>{order.address}</div>
                    </div>

                    <div style={orderInfoCardStyle}>
                      <div style={orderInfoLabelStyle}>상세주소</div>
                      <div style={orderInfoValueStyle}>{order.detail_address}</div>
                    </div>

                    <div style={orderInfoCardStyle}>
                      <div style={orderInfoLabelStyle}>입금자명</div>
                      <div style={orderInfoValueStyle}>{order.depositor_name}</div>
                    </div>

                    <div style={orderInfoCardStyle}>
                      <div style={orderInfoLabelStyle}>수량</div>
                      <div style={orderInfoValueStyle}>{order.quantity}</div>
                    </div>

                    <div style={orderInfoCardStyle}>
                      <div style={orderInfoLabelStyle}>총 금액</div>
                      <div style={orderInfoValueStyle}>
                        {order.total_price.toLocaleString()}원
                      </div>
                    </div>

                    <div style={orderInfoCardStyle}>
                      <div style={orderInfoLabelStyle}>주문상태</div>
                      <div style={orderInfoValueStyle}>{order.status}</div>
                    </div>

                    <div style={orderInfoCardStyle}>
                      <div style={orderInfoLabelStyle}>입금상태</div>
                      <div style={orderInfoValueStyle}>{order.payment_status}</div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: "#f8f3e4",
                        borderRadius: "16px",
                        padding: "14px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "20px",
                          fontWeight: 800,
                          marginBottom: "12px",
                        }}
                      >
                        주문 상태 변경
                      </div>

                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <button
                          onClick={() => changeStatus(order.id, "접수")}
                          style={smallActionButtonStyle}
                        >
                          접수
                        </button>
                        <button
                          onClick={() => changeStatus(order.id, "준비중")}
                          style={smallActionButtonStyle}
                        >
                          준비중
                        </button>
                        <button
                          onClick={() => changeStatus(order.id, "배송중")}
                          style={smallActionButtonStyle}
                        >
                          배송중
                        </button>
                        <button
                          onClick={() => changeStatus(order.id, "완료")}
                          style={smallActionButtonStyle}
                        >
                          완료
                        </button>
                      </div>
                    </div>

                    <div
                      style={{
                        backgroundColor: "#f8f3e4",
                        borderRadius: "16px",
                        padding: "14px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "20px",
                          fontWeight: 800,
                          marginBottom: "12px",
                        }}
                      >
                        입금 상태 변경
                      </div>

                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <button
                          onClick={() => changePaymentStatus(order.id, "입금대기")}
                          style={smallActionButtonStyle}
                        >
                          입금대기
                        </button>
                        <button
                          onClick={() => changePaymentStatus(order.id, "입금확인")}
                          style={smallActionButtonStyle}
                        >
                          입금확인
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
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

const actionButtonStyle: React.CSSProperties = {
  padding: "14px 16px",
  border: "2px solid #8f8769",
  borderRadius: "14px",
  backgroundColor: "#ffffff",
  color: "#111111",
  fontSize: "18px",
  fontWeight: 800,
  cursor: "pointer",
};

const smallActionButtonStyle: React.CSSProperties = {
  padding: "10px 12px",
  border: "2px solid #8f8769",
  borderRadius: "12px",
  backgroundColor: "#ffffff",
  color: "#111111",
  fontSize: "17px",
  fontWeight: 800,
  cursor: "pointer",
};

const stockInputStyle: React.CSSProperties = {
  width: "120px",
  padding: "14px",
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

const orderInfoCardStyle: React.CSSProperties = {
  backgroundColor: "#f8f3e4",
  borderRadius: "16px",
  padding: "14px",
};

const orderInfoLabelStyle: React.CSSProperties = {
  fontSize: "17px",
  color: "#555555",
  fontWeight: 700,
  marginBottom: "6px",
};

const orderInfoValueStyle: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: 800,
  lineHeight: "1.5",
  color: "#111111",
  wordBreak: "break-word",
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