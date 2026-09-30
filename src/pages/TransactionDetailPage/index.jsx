import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useParams, useNavigate } from "react-router-dom";
import { ROUTES } from "../../routes.js";
import { useAuthStore } from "../../store/authStore.js";
import { fetchMe } from "../../api/auth.js";
import {
  fetchTransaction,
  confirmTransaction,
  registerShipping,
  openDispute,
  downloadDisputeFile,
} from "../../api/transactions.js";

import Button from "../../components/Button.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import {
  canRegisterShipping,
  canConfirm,
  canOpenDispute,
  isBuyer,
  isSeller,
} from "./actions.js";
import styles from "./TransactionDetailPage.module.css";

function Thumbnail({ src, alt }) {
  const [hasError, setHasError] = useState(!src);

  useEffect(() => {
    setHasError(!src);
  }, [src]);

  const fullSrc =
    !hasError && src
      ? src.startsWith("http://") || src.startsWith("https://")
        ? src
        : `${import.meta.env.VITE_API_URL}${src}`
      : null;

  if (!fullSrc || hasError) {
    return <div className={styles.productThumb}>사진 없음</div>;
  }

  return (
    <img
      src={fullSrc}
      alt={alt}
      className={styles.productThumb}
      onError={() => setHasError(true)}
    />
  );
}

Thumbnail.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string.isRequired,
};

function TransactionStepper({ status }) {
  const isPaid = ["PAID", "SHIPPING", "CONFIRMED"].includes(status);
  const isShipping = ["SHIPPING", "CONFIRMED"].includes(status);
  const isConfirmed = status === "CONFIRMED";
  const isDisputed = status === "DISPUTED";
  const isRefunded = status === "REFUNDED";

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>거래 진행 상태</h3>
      <div className={styles.stepperContainer}>
        <div className={styles.stepItem}>
          <div
            className={`${styles.stepCircle} ${
              isShipping || isConfirmed
                ? styles.stepCircleDone
                : isPaid
                ? styles.stepCircleActive
                : ""
            }`}
          >
            {isShipping || isConfirmed ? "✓" : "1"}
          </div>
          <p className={styles.stepLabel}>결제완료</p>
          <p className={styles.stepSubText}>PAID</p>
        </div>

        <div
          className={`${styles.stepperLine} ${
            isShipping || isConfirmed ? styles.stepperLineActive : ""
          }`}
        />

        <div className={styles.stepItem}>
          <div
            className={`${styles.stepCircle} ${
              isConfirmed
                ? styles.stepCircleDone
                : isShipping
                ? styles.stepCircleActive
                : ""
            }`}
          >
            {isConfirmed ? "✓" : "2"}
          </div>
          <p className={styles.stepLabel}>배송중</p>
          <p className={styles.stepSubText}>SHIPPING</p>
        </div>

        <div
          className={`${styles.stepperLine} ${
            isConfirmed ? styles.stepperLineActive : ""
          }`}
        />

        <div className={styles.stepItem}>
          <div
            className={`${styles.stepCircle} ${
              isConfirmed ? styles.stepCircleActive : ""
            }`}
          >
            3
          </div>
          <p className={styles.stepLabel}>구매확정</p>
          <p className={styles.stepSubText}>CONFIRMED</p>
        </div>
      </div>

      {(isDisputed || isRefunded) && (
        <div className={styles.stepperNotice}>
          <span>⚠️ 현재 분기 상태:</span>
          {isDisputed && <StatusBadge status="DISPUTED" />}
          {isRefunded && <StatusBadge status="REFUNDED" />}
        </div>
      )}
    </div>
  );
}

TransactionStepper.propTypes = {
  status: PropTypes.string.isRequired,
};

export default function TransactionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [txn, setTxn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  const [isShippingFormOpen, setIsShippingFormOpen] = useState(false);
  const [courier, setCourier] = useState("CJ대한통운");
  const [trackingNo, setTrackingNo] = useState("");
  const [shippingErrors, setShippingErrors] = useState({});

  const [isDisputeFormOpen, setIsDisputeFormOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeFiles, setDisputeFiles] = useState([]);
  const [disputeErrors, setDisputeErrors] = useState({});

  useEffect(() => {
    fetchMe()
      .then((res) => {
        const freshUser = res?.user || res?.data || res;
        if (freshUser && typeof freshUser === "object" && freshUser.id) {
          setUser(freshUser);
        }
      })
      .catch(() => {});
  }, [setUser]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    fetchTransaction(id)
      .then((res) => {
        if (!alive) return;
        const transactionData = res?.data ?? res;
        setTxn(transactionData);
      })
      .catch((e) => {
        if (alive) setError(e);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [id, reloadKey]);

  useEffect(() => {
    return () => {
      disputeFiles.forEach((f) => URL.revokeObjectURL(f.preview));
    };
  }, [disputeFiles]);

  const handleRegisterShipping = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!courier.trim()) errors.courier = "택배사를 입력하거나 선택해 주세요.";
    const cleanTrackingNo = trackingNo.replace(/[^0-9]/g, "");
    if (!cleanTrackingNo || cleanTrackingNo.length < 8 || cleanTrackingNo.length > 20) {
      errors.trackingNo = "송장번호는 숫자 8~20자리여야 합니다.";
    }

    if (Object.keys(errors).length > 0) {
      setShippingErrors(errors);
      return;
    }

    setActionLoading(true);
    setShippingErrors({});

    try {
      const updated = await registerShipping(id, {
        courier: courier.trim(),
        trackingNo: cleanTrackingNo,
      });
      alert("배송 정보가 등록되었습니다.");
      setIsShippingFormOpen(false);
      setTxn(updated?.data ?? updated ?? txn);
      setReloadKey((k) => k + 1);
    } catch (err) {
      if (err.fields && err.fields.length) {
        const fieldMap = {};
        err.fields.forEach((f) => {
          fieldMap[f.name] = f.message;
        });
        setShippingErrors(fieldMap);
      } else {
        alert(err.message || "송장 등록에 실패했습니다.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirm = async () => {
    const isOk = window.confirm(
      `구매를 확정하시겠습니까?\n구매확정 후에는 취소나 환불이 불가능하며, 판매자에게 대금이 정산됩니다.`
    );
    if (!isOk) return;

    setActionLoading(true);
    try {
      const updated = await confirmTransaction(id);
      alert("구매가 확정되었습니다. 거래가 완료되었습니다.");
      setTxn(updated?.data ?? updated ?? txn);
      setReloadKey((k) => k + 1);
    } catch (err) {
      alert(err.message || "구매 확정 처리 중 오류가 발생했습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    if (disputeFiles.length + selected.length > 3) {
      alert("증빙 파일은 최대 3개까지만 첨부할 수 있습니다.");
      return;
    }

    const newFiles = selected.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setDisputeFiles((prev) => [...prev, ...newFiles]);
    e.target.value = "";
  };

  const handleRemoveFile = (index) => {
    setDisputeFiles((prev) => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[index].preview);
      copy.splice(index, 1);
      return copy;
    });
  };

  const handleSubmitDispute = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!disputeReason.trim() || disputeReason.trim().length < 10) {
      errors.reason = "분쟁 사유는 최소 10자 이상 구체적으로 작성해 주세요.";
    } else if (disputeReason.trim().length > 500) {
      errors.reason = "분쟁 사유는 500자 이하로 작성해 주세요.";
    }

    if (Object.keys(errors).length > 0) {
      setDisputeErrors(errors);
      return;
    }

    const isOk = window.confirm(
      "분쟁을 신고하시겠습니까? 접수 즉시 거래 진행이 중단되며 관리자가 검토합니다."
    );
    if (!isOk) return;

    setActionLoading(true);
    setDisputeErrors({});

    try {
      const rawFiles = disputeFiles.map((f) => f.file);
      const updated = await openDispute(id, disputeReason.trim(), rawFiles);
      alert("분쟁 신고가 정상적으로 접수되었습니다.");
      setIsDisputeFormOpen(false);
      setTxn(updated?.data ?? updated ?? txn);
      setReloadKey((k) => k + 1);
    } catch (err) {
      alert(err.message || "분쟁 신고 접수 중 오류가 발생했습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadFile = async (disputeId, fileId, filename) => {
    try {
      await downloadDisputeFile(disputeId, fileId, filename || `dispute-${fileId}`);
    } catch (err) {
      alert(err.message || "파일 다운로드에 실패했습니다.");
    }
  };

  if (loading) {
    return (
      <section className={styles.container}>
        <LoadingSpinner />
      </section>
    );
  }

  if (error) {
    const isForbidden =
      error.status === 403 ||
      error.code === "ACCESS_DENIED" ||
      error.code === "TRANSACTION_FORBIDDEN";

    return (
      <section className={styles.state}>
        <h2 className={`${styles.cardTitle} ${styles.stateError}`}>
          {isForbidden ? "접근 제한 안내" : "거래 조회 오류"}
        </h2>
        <p className={styles.stateMessage}>
          {isForbidden
            ? "해당 거래의 당사자가 아닙니다. 본인이 참여한 거래만 확인할 수 있습니다."
            : error.message || "거래 정보를 불러오지 못했습니다."}
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <Button variant="primary" onClick={() => navigate(ROUTES.MYPAGE)}>
            마이페이지로 이동
          </Button>
          {!isForbidden && (
            <Button variant="secondary" onClick={() => setReloadKey((v) => v + 1)}>
              다시 시도
            </Button>
          )}
        </div>
      </section>
    );
  }

  if (!txn) {
    return (
      <section className={styles.state}>
        <p className={styles.stateMessage}>존재하지 않거나 접근할 수 없는 거래입니다.</p>
        <Button variant="primary" onClick={() => navigate(ROUTES.MYPAGE)}>
          마이페이지로 이동
        </Button>
      </section>
    );
  }

  const productTitle = txn.productTitle || txn.product?.title || txn.product?.name || "상품명 정보 없음";
  const productThumb = txn.thumbnailUrl || txn.product?.thumbnailUrl;
  const amount = txn.amountKrw ?? txn.priceKrw ?? 0;
  const counterpartText = isBuyer(txn, user)
    ? `판매자 ${txn.sellerNickname || "-"}`
    : `구매자 ${txn.buyerNickname || "-"}`;

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>거래 상세</h1>
          <span className={styles.orderId}>#{txn.id}</span>
          <StatusBadge status={txn.status} />
        </div>
        <p className={styles.headerNotice}>거래 당사자만 접근할 수 있습니다</p>
      </div>

      <TransactionStepper status={txn.status} />

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>거래 상품</h3>
        <div className={styles.productCardBody}>
          <div className={styles.productMain}>
            <Thumbnail src={productThumb} alt={productTitle} />
            <div>
              <p className={styles.productTitle}>{productTitle}</p>
              <p className={styles.productMeta}>
                {counterpartText} · 결제일 {(txn.createdAt || "").slice(0, 10)}
              </p>
            </div>
          </div>
          <div className={styles.productAmountBox}>
            <div className={styles.productAmountLabel}>결제 금액 amountKrw</div>
            <div className={styles.productAmount}>{amount.toLocaleString()}원</div>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>배송 정보</h3>
        {txn.courier && txn.trackingNo ? (
          <div className={styles.shippingInfoGrid}>
            <div className={styles.shippingInfoItem}>
              <span className={styles.shippingInfoLabel}>택배사 courier</span>
              <span className={styles.shippingInfoValue}>{txn.courier}</span>
            </div>
            <div className={styles.shippingInfoItem}>
              <span className={styles.shippingInfoLabel}>송장번호 trackingNo</span>
              <span className={styles.shippingInfoValue}>{txn.trackingNo}</span>
            </div>
          </div>
        ) : (
          <p className={styles.shippingEmptyNotice}>
            판매자가 아직 송장을 입력하지 않았습니다.
          </p>
        )}
      </div>

      <div className={styles.card}>
        <div className={styles.actionCardHeader}>
          <h3 className={styles.cardTitle}>
            내가 할 수 있는 일{" "}
            <span style={{ fontSize: "13px", fontWeight: "normal", color: "var(--color-text-muted)" }}>
              (현재: {isBuyer(txn, user) ? "구매자" : isSeller(txn, user) ? "판매자" : "방문자"} · {txn.status})
            </span>
          </h3>
        </div>

        <div className={styles.actionButtonGroup}>
          {canRegisterShipping(txn, user) && (
            <Button
              variant="primary"
              disabled={actionLoading}
              onClick={() => setIsShippingFormOpen(!isShippingFormOpen)}
            >
              {isShippingFormOpen ? "송장 입력 닫기" : "배송 정보 입력"}
            </Button>
          )}

          {canConfirm(txn, user) && (
            <Button
              variant="primary"
              disabled={actionLoading}
              onClick={handleConfirm}
            >
              구매 확정
            </Button>
          )}

          {canOpenDispute(txn, user) && (
            <Button
              variant="danger"
              disabled={actionLoading}
              onClick={() => setIsDisputeFormOpen(!isDisputeFormOpen)}
            >
              {isDisputeFormOpen ? "분쟁 신고 닫기" : "분쟁 신고"}
            </Button>
          )}
        </div>

        {txn.status === "PAID" && isBuyer(txn, user) && (
          <p className={styles.actionNotice}>
            판매자의 상품 발송 및 송장 번호 입력을 기다리고 있습니다. 문제 발생 시 분쟁을 신고할 수 있습니다.
          </p>
        )}
        {txn.status === "SHIPPING" && isBuyer(txn, user) && (
          <p className={styles.actionNotice}>
            구매확정을 누르면 판매자에게 {amount.toLocaleString()}원이 정산되고 되돌릴 수 없습니다. 물건을 확인한 뒤 눌러주세요.
          </p>
        )}
        {txn.status === "SHIPPING" && isSeller(txn, user) && (
          <p className={styles.actionNotice}>
            구매자의 물품 수령 및 구매 확정을 기다리는 중입니다.
          </p>
        )}
        {txn.status === "CONFIRMED" && (
          <p className={styles.completionNotice}>
            ✓ 거래가 정상적으로 완료되었습니다.
          </p>
        )}
        {txn.status === "REFUNDED" && (
          <p className={styles.actionNotice}>
            환불이 완료되었습니다. (구매자 계좌/가상 잔액으로 복구됨)
          </p>
        )}

        {isShippingFormOpen && canRegisterShipping(txn, user) && (
          <form className={styles.formSection} onSubmit={handleRegisterShipping}>
            <h4 className={styles.formTitle}>배송 정보 등록</h4>
            <div className={styles.formField}>
              <label htmlFor="courierSelect" className={styles.formLabel}>택배사</label>
              <select
                id="courierSelect"
                className={styles.input}
                value={courier}
                onChange={(e) => setCourier(e.target.value)}
              >
                <option value="CJ대한통운">CJ대한통운</option>
                <option value="우체국택배">우체국택배</option>
                <option value="한진택배">한진택배</option>
                <option value="롯데택배">롯데택배</option>
                <option value="로젠택배">로젠택배</option>
              </select>
              {shippingErrors.courier && (
                <p className={styles.fieldError}>{shippingErrors.courier}</p>
              )}
            </div>

            <div className={styles.formField}>
              <label htmlFor="trackingInput" className={styles.formLabel}>송장번호 (숫자 8~20자리)</label>
              <input
                id="trackingInput"
                type="text"
                className={styles.input}
                value={trackingNo}
                onChange={(e) => setTrackingNo(e.target.value)}
                placeholder="예: 123456789012"
              />
              {shippingErrors.trackingNo && (
                <p className={styles.fieldError}>{shippingErrors.trackingNo}</p>
              )}
            </div>

            <div className={styles.formButtonRow}>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsShippingFormOpen(false)}
              >
                취소
              </Button>
              <Button type="submit" variant="primary" disabled={actionLoading}>
                {actionLoading ? "등록 중..." : "송장 등록 완료"}
              </Button>
            </div>
          </form>
        )}

        {isDisputeFormOpen && canOpenDispute(txn, user) && (
          <form className={styles.formSection} onSubmit={handleSubmitDispute}>
            <h4 className={styles.formTitle}>분쟁 신고 접수</h4>
            <div className={styles.formField}>
              <label htmlFor="disputeTextarea" className={styles.formLabel}>신고 사유 (10~500자)</label>
              <textarea
                id="disputeTextarea"
                className={styles.textarea}
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="신고 사유를 구체적으로 작성해 주세요 (최소 10자)"
              />
              {disputeErrors.reason && (
                <p className={styles.fieldError}>{disputeErrors.reason}</p>
              )}
            </div>

            <div className={styles.formField}>
              <label htmlFor="disputeFileInput" className={styles.formLabel}>증빙 자료 첨부 (최대 3개)</label>
              <input
                id="disputeFileInput"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
              />
              {disputeFiles.length > 0 && (
                <div className={styles.filePreviewList}>
                  {disputeFiles.map((f, idx) => (
                    <div key={idx} className={styles.filePreviewItem}>
                      <img src={f.preview} alt="미리보기" className={styles.previewImg} />
                      <button
                        type="button"
                        className={styles.fileRemoveBtn}
                        onClick={() => handleRemoveFile(idx)}
                        aria-label="파일 삭제"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.formButtonRow}>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsDisputeFormOpen(false)}
              >
                취소
              </Button>
              <Button type="submit" variant="danger" disabled={actionLoading}>
                {actionLoading ? "제출 중..." : "신고 제출하기"}
              </Button>
            </div>
          </form>
        )}
      </div>

      {txn.status === "DISPUTED" && txn.dispute && (
        <div className={styles.disputePanel}>
          <div className={styles.disputeHeader}>
            <h3 className={styles.cardTitle} style={{ margin: 0 }}>
              분쟁 처리 상태
            </h3>
            <span style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>
              접수일시: {(txn.dispute.createdAt || "").slice(0, 16).replace("T", " ")}
            </span>
          </div>

          <div className={styles.disputeReasonBox}>
            <strong>신고 사유:</strong> {txn.dispute.reason}
          </div>

          {txn.dispute.files && txn.dispute.files.length > 0 && (
            <div>
              <p style={{ fontSize: "13px", fontWeight: "bold", margin: "0 0 8px 0" }}>
                증빙 파일 목록:
              </p>
              <div className={styles.disputeFilesList}>
                {txn.dispute.files.map((file) => (
                  <button
                    key={file.id}
                    type="button"
                    className={styles.fileDownloadBtn}
                    onClick={() => handleDownloadFile(txn.dispute.id, file.id, file.originalName)}
                  >
                    {file.originalName || `파일 #${file.id}`} (다운로드)
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}