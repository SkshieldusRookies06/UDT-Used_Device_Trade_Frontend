// 접속한 유저의 역할 판정 (문자열 변환 비교로 안전하게 처리)
export const isBuyer = (txn, me) =>
  Boolean(txn?.buyerId && me?.id && String(txn.buyerId) === String(me.id));

export const isSeller = (txn, me) =>
  Boolean(txn?.sellerId && me?.id && String(txn.sellerId) === String(me.id));

// 버튼 노출 조건 판정 (BE-D 상태 전이표 및 SPEC §4.5~4.8 기준)
// 판매자: 결제완료(PAID) 상태일 때 송장 입력 가능
export const canRegisterShipping = (txn, me) =>
  isSeller(txn, me) && txn?.status === "PAID";

// 구매자: 배송중(SHIPPING) 상태일 때 구매 확정 가능
export const canConfirm = (txn, me) =>
  isBuyer(txn, me) && txn?.status === "SHIPPING";

// 구매자: 결제완료(PAID) 또는 배송중(SHIPPING) 상태일 때 분쟁 신고 가능
export const canOpenDispute = (txn, me) =>
  isBuyer(txn, me) && ["PAID", "SHIPPING"].includes(txn?.status);