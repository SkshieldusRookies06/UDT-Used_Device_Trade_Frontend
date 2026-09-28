import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styles from "./TransactionDetailPage.module.css";

// 실제 API 및 공용 컴포넌트 임포트
import { fetchTransaction, confirmTransaction, registerShipping, openDispute } from "../../api/transactions.js";
import Button from "../../components/Button.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import { canRegisterShipping, canConfirm, canOpenDispute } from "./actions.js";

export default function TransactionDetailPage() {
  const { id } = useParams();
  
  const [txn, setTxn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  // 현재 로그인한 사용자 정보 (백엔드 세션/토큰 연동 전까지 임시 매핑 또는 API 연동)
  // TODO: 실제 유저 정보 연동 필요
  const [me] = useState({ id: 1 }); 

  // 분쟁 신고 폼 상태
  const [isDisputeFormOpen, setIsDisputeFormOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeFiles, setDisputeFiles] = useState([]);

  // 실제 API 데이터 페치 (useEffect + alive 패턴)
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    fetchTransaction(id)
      .then((res) => {
        if (alive) {
          // axios 응답 구조에 맞게 설정 (res.data 또는 res)
          setTxn(res.data ?? res);
        }
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

  // 구매 확정 핸들러
  const handleConfirm = async () => {
    if (!window.confirm("구매를 확정하시겠습니까?")) return;
    try {
      await confirmTransaction(id);
      setReloadKey((k) => k + 1); // 데이터 새로고침
    } catch (e) {
      alert(e.message || "구매 확정 실패");
    }
  };

  // 첨부파일 선택 핸들러
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setDisputeFiles((prev) => [...prev, ...newFiles]);
  };

  // 첨부파일 삭제 핸들러
  const handleRemoveFile = (index) => {
    setDisputeFiles((prev) => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  // 분쟁 신고 제출 핸들러
  const handleSubmitDispute = async () => {
    if (!disputeReason.trim()) {
      alert("사유를 입력해주세요.");
      return;
    }
    if (!window.confirm("분쟁 신고를 접수하시겠습니까?")) return;

    try {
      const rawFiles = disputeFiles.map(f => f.file);
      await openDispute(id, disputeReason, rawFiles);
      alert("분쟁 신고가 접수되었습니다.");
      setIsDisputeFormOpen(false);
      setReloadKey((k) => k + 1);
    } catch (e) {
      alert(e.message || "분쟁 신고 실패");
    }
  };

  // 1. 로딩 상태
  if (loading) return <LoadingSpinner />;

  // 2. 에러 상태
  if (error) {
    return (
      <div className={styles.state}>
        <p>{error.message || "거래 정보를 불러오지 못했습니다."}</p>
        <Button variant="secondary" onClick={() => setReloadKey((v) => v + 1)}>다시 시도</Button>
      </div>
    );
  }

  // 3. 빈 결과 / 데이터 없음
  if (!txn) {
    return (
      <div className={styles.state}>
        <p>존재하지 않거나 접근할 수 없는 거래입니다.</p>
      </div>
    );
  }

  // 4. 정상 렌더링 상태
  return (
    <section className={styles.wrapper}>
      <h1 className={styles.heading}>거래 상세</h1>
      
      <div className={styles.infoBox}>
        <p><strong>상품명:</strong> {txn.product?.name}</p>
        <p><strong>결제 금액:</strong> {txn.amountKrw?.toLocaleString()}원</p>
        <p>
          <strong>현재 상태:</strong> <StatusBadge status={txn.status} />
        </p>
      </div>

      {/* 액션 버튼 영역 */}
      <div className={styles.actionGroup}>
        {canRegisterShipping(txn, me) && (
          <Button variant="primary" onClick={() => alert("송장 입력 모달 기능 연결 필요")}>
            송장 입력
          </Button>
        )}
        
        {canConfirm(txn, me) && (
          <Button variant="primary" onClick={handleConfirm}>
            구매 확정
          </Button>
        )}
        
        {canOpenDispute(txn, me) && (
          <Button variant="danger" onClick={() => setIsDisputeFormOpen(!isDisputeFormOpen)}>
            {isDisputeFormOpen ? "분쟁 신고 취소" : "분쟁 신고"}
          </Button>
        )}
      </div>

      {/* 분쟁 신고 폼 */}
      {isDisputeFormOpen && (
        <div className={styles.disputeForm}>
          <h3>분쟁 신고 접수</h3>
          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", marginBottom: "4px" }}>사유 입력</label>
            <textarea 
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder="상세한 신고 사유를 입력하세요"
              style={{ width: "100%", height: "80px", padding: "8px" }}
            />
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", marginBottom: "4px" }}>증빙 자료 첨부</label>
            <input type="file" multiple accept="image/*" onChange={handleFileChange} />
            
            {disputeFiles.length > 0 && (
              <div style={{ display: "flex", gap: "8px", marginTop: "8px", flexWrap: "wrap" }}>
                {disputeFiles.map((f, idx) => (
                  <div key={idx} style={{ position: "relative" }}>
                    <img src={f.preview} alt="미리보기" style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "4px" }} />
                    <button 
                      onClick={() => handleRemoveFile(idx)}
                      style={{ position: "absolute", top: "-4px", right: "-4px", background: "#000", color: "#fff", border: "none", borderRadius: "50%", width: "18px", height: "18px", fontSize: "10px", cursor: "pointer" }}
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button variant="danger" onClick={handleSubmitDispute}>
            신고 제출하기
          </Button>
        </div>
      )}
    </section>
  );
}