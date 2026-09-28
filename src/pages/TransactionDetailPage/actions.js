// 1. 접속한 유저의 역할 판정
export const isBuyer  = (txn, me) => txn.buyerId === me?.id;
export const isSeller = (txn, me) => txn.sellerId === me?.id;

// 2. 버튼 노출 조건 판정 (BE-D 상태 전이표 기준)
// 판매자: 결제완료(PAID) 상태일 때 송장 입력 가능
export const canRegisterShipping = (txn, me) => isSeller(txn, me) && txn.status === "PAID";

// 구매자: 배송중(SHIPPING) 상태일 때 구매 확정 가능
export const canConfirm = (txn, me) => isBuyer(txn, me) && txn.status === "SHIPPING";

// 구매자: 결제완료(PAID) 또는 배송중(SHIPPING) 상태일 때 분쟁 신고 가능
export const canOpenDispute = (txn, me) => isBuyer(txn, me) && ["PAID", "SHIPPING"].includes(txn.status);