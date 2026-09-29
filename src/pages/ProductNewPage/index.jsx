import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createProduct, fetchCategories } from "../../api/products.js";
import { useAuthStore } from "../../store/authStore.js";
import { ROUTES } from "../../routes.js";
import Button from "../../components/Button.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import styles from "./ProductNewPage.module.css";

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

export default function ProductNewPage() {
  const navigate = useNavigate();
  const accessToken = useAuthStore((s) => s.accessToken);

  // 7. 비로그인 보호: 비로그인 접근 시 ROUTES.LOGIN으로 리다이렉트
  useEffect(() => {
    if (!accessToken) {
      navigate(ROUTES.LOGIN, { state: { from: ROUTES.PRODUCT_NEW }, replace: true });
    }
  }, [accessToken, navigate]);

  // 1. 카테고리 select: 컴포넌트 마운트 시 GET /api/categories 호출
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoadingCategories(true);
    fetchCategories()
      .then((res) => {
        if (alive && Array.isArray(res)) {
          setCategories(res);
        }
      })
      .catch(() => { })
      .finally(() => {
        if (alive) setLoadingCategories(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  // Form State
  const [form, setForm] = useState({
    title: "",
    categoryId: "",
    priceKrw: "",
    conditionGrade: "",
    description: "",
  });

  // Images State: Array of { id, file, previewUrl }
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);

  // Error & Status States
  const [errors, setErrors] = useState({});
  const [imageWarning, setImageWarning] = useState("");
  const [imageError, setImageError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 3. 메모리 누수 방지 (중요): 컴포넌트 언마운트 시 활성 previewUrl 전부 revoke
  const imagesRef = useRef(images);
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((item) => {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  // 2. 이미지 미리보기 및 4. 이미지 개수/형식/용량 검증
  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    // input 값 리셋하여 동일 파일 재선택 시에도 onChange 발생 보장
    e.target.value = "";
    setImageError("");

    const totalCount = images.length + selectedFiles.length;
    // 4. 프론트에서 6장 이상 선택 시 사전 안내 경고 표출 (최대 5장 제한)
    if (totalCount > MAX_IMAGES) {
      setImageWarning(`첨부 가능한 파일 수를 초과했습니다. 최대 ${MAX_IMAGES}장까지 등록할 수 있습니다. (현재 ${totalCount}장)`);
    } else {
      setImageWarning("");
    }

    const newItems = [];
    for (const file of selectedFiles) {
      const ext = file.name.split(".").pop().toLowerCase();
      const isAllowedExt = ALLOWED_EXTENSIONS.includes(ext);
      const isAllowedType = ["image/jpeg", "image/png", "image/webp"].includes(file.type);

      if (!isAllowedExt && !isAllowedType) {
        setImageError("허용되지 않는 파일 형식입니다. (jpg, png, webp만 가능)");
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setImageError("파일당 최대 5MB까지 첨부할 수 있습니다.");
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      newItems.push({
        id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 9)}`,
        file,
        previewUrl,
      });
    }

    setImages((prev) => [...prev, ...newItems]);
  };

  // 2. 이미지 개별 삭제 (X 버튼) 및 3. URL.revokeObjectURL 즉시 실행
  const handleRemoveImage = (indexToRemove) => {
    setImages((prev) => {
      const target = prev[indexToRemove];
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      const updated = prev.filter((_, idx) => idx !== indexToRemove);
      if (updated.length <= MAX_IMAGES) {
        setImageWarning("");
        setImageError("");
      }
      return updated;
    });
  };

  // 5. 제출 중 중복 방지 및 폼 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setErrors({});
    setImageError("");
    setGeneralError("");

    try {
      const productPayload = {
        title: form.title.trim(),
        description: form.description.trim(),
        priceKrw: form.priceKrw === "" ? null : Number(form.priceKrw),
        conditionGrade: form.conditionGrade || null,
        categoryId: form.categoryId || null,
      };

      const imageFiles = images.map((item) => item.file);

      // API 호출 (multipart/form-data Blob + File[])
      await createProduct(productPayload, imageFiles);

      // 6. 성공 후 필수 안내: "관리자 검수 후 판매중으로 전환됩니다" 안내 후 ROUTES.MYPAGE 이동
      if (typeof window !== "undefined" && window.alert) {
        window.alert("관리자 검수 후 판매중으로 전환됩니다");
      }
      navigate(ROUTES.MYPAGE);
    } catch (err) {
      if (err.code === "VALIDATION_ERROR") {
        // 400 VALIDATION_ERROR: fields[] 배열에 필드별 검증 실패 사유 포함 (각 입력창 하단에 표출)
        const nextErrors = {};
        if (Array.isArray(err.fields)) {
          err.fields.forEach((f) => {
            const fieldName = f.name || f.field;
            const message = f.message || f.reason;
            if (fieldName && message) {
              nextErrors[fieldName] = message;
            }
          });
        }
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length === 0 || nextErrors.general) {
          setGeneralError(err.message || "입력값을 다시 확인해 주세요.");
        }
      } else if (err.code === "FILE_COUNT_EXCEEDED") {
        // 400 FILE_COUNT_EXCEEDED: 서버 에러 message("첨부 가능한 파일 수를 초과했습니다") 그대로 표출
        const msg = err.message || "첨부 가능한 파일 수를 초과했습니다.";
        setImageError(msg);
        setGeneralError(msg);
      } else if (err.code === "FILE_TYPE_NOT_ALLOWED") {
        // 400 FILE_TYPE_NOT_ALLOWED
        const msg = err.message || "허용되지 않는 파일 형식입니다.";
        setImageError(msg);
        setGeneralError(msg);
      } else if (err.code === "FILE_TOO_LARGE") {
        // 400 FILE_TOO_LARGE
        const msg = err.message || "파일 크기는 최대 5MB까지 가능합니다.";
        setImageError(msg);
        setGeneralError(msg);
      } else {
        setGeneralError(err.message || "상품 등록 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const parsedPrice = form.priceKrw ? Number(form.priceKrw) : 0;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <nav className={styles.breadcrumb} aria-label="경로">
          <Link to={ROUTES.HOME} className={styles.bcLink}>상품 목록</Link>
          <span>›</span>
          <span>상품 등록</span>
        </nav>

        <section className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>상품 등록</h1>
            <p className={styles.subtitle}>
              안전거래와 전문 검수를 거쳐 판매될 상품 정보를 입력해 주세요.
            </p>
          </div>

          <div className={styles.noticeCard}>
            <p className={styles.noticeTitle}>안전거래 검수 안내</p>
            <p className={styles.noticeDesc}>
              등록된 상품은 관리자의 전문 검수(INSPECTING) 완료 후 일반 구매자에게 노출됩니다.
              등록 직후에는 마이페이지의 &apos;내 상품&apos; 탭에서 상태를 확인하실 수 있습니다.
            </p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            {/* 카테고리 */}
            <div className={styles.field}>
              <div className={styles.labelRow}>
                <label className={styles.label} htmlFor="categoryId">
                  카테고리<span className={styles.requiredMark}>*</span>
                </label>
                {loadingCategories && <LoadingSpinner size="sm" label="카테고리 로딩 중…" />}
              </div>
              <select
                id="categoryId"
                name="categoryId"
                className={`${styles.select} ${errors.categoryId ? styles.inputError : ""}`}
                value={form.categoryId}
                onChange={handleChange}
                aria-invalid={Boolean(errors.categoryId)}
                aria-describedby={errors.categoryId ? "categoryId-error" : undefined}
                required
              >
                <option value="">카테고리를 선택해 주세요</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p id="categoryId-error" className={styles.fieldError}>
                  {errors.categoryId}
                </p>
              )}
            </div>

            {/* 상품명 */}
            <div className={styles.field}>
              <div className={styles.labelRow}>
                <label className={styles.label} htmlFor="title">
                  상품명<span className={styles.requiredMark}>*</span>
                </label>
              </div>
              <input
                id="title"
                name="title"
                type="text"
                className={`${styles.input} ${errors.title ? styles.inputError : ""}`}
                placeholder="상품명을 입력해 주세요 (예: 맥북 프로 14인치 M3 512GB)"
                value={form.title}
                onChange={handleChange}
                aria-invalid={Boolean(errors.title)}
                aria-describedby={errors.title ? "title-error" : undefined}
                required
              />
              {errors.title && (
                <p id="title-error" className={styles.fieldError}>
                  {errors.title}
                </p>
              )}
            </div>

            {/* 판매 가격 */}
            <div className={styles.field}>
              <div className={styles.labelRow}>
                <label className={styles.label} htmlFor="priceKrw">
                  판매 가격 (원)<span className={styles.requiredMark}>*</span>
                  {parsedPrice > 0 && (
                    <span className={styles.pricePreview}>
                      ({parsedPrice.toLocaleString()}원)
                    </span>
                  )}
                </label>
              </div>
              <input
                id="priceKrw"
                name="priceKrw"
                type="number"
                min="0"
                step="1000"
                className={`${styles.input} ${errors.priceKrw ? styles.inputError : ""}`}
                placeholder="숫자만 입력해 주세요 (예: 850000)"
                value={form.priceKrw}
                onChange={handleChange}
                aria-invalid={Boolean(errors.priceKrw)}
                aria-describedby={errors.priceKrw ? "priceKrw-error" : undefined}
                required
              />
              {errors.priceKrw && (
                <p id="priceKrw-error" className={styles.fieldError}>
                  {errors.priceKrw}
                </p>
              )}
            </div>

            {/* 상태 등급 */}
            <div className={styles.field}>
              <div className={styles.labelRow}>
                <label className={styles.label} htmlFor="conditionGrade">
                  상태 등급<span className={styles.requiredMark}>*</span>
                </label>
              </div>
              <select
                id="conditionGrade"
                name="conditionGrade"
                className={`${styles.select} ${errors.conditionGrade ? styles.inputError : ""}`}
                value={form.conditionGrade}
                onChange={handleChange}
                aria-invalid={Boolean(errors.conditionGrade)}
                aria-describedby={errors.conditionGrade ? "conditionGrade-error" : undefined}
                required
              >
                <option value="">상태 등급을 선택해 주세요</option>
                <option value="S">S급 — 미개봉 / 새상품급</option>
                <option value="A">A급 — 사용감 적음 / 기능 이상 없는 깨끗한 상품</option>
                <option value="B">B급 — 사용감 있음 / 생활 흠집 있으나 정상 작동</option>
                <option value="C">C급 — 흠집 다수 / 외관 손상 있으나 작동 가능</option>
              </select>
              {errors.conditionGrade && (
                <p id="conditionGrade-error" className={styles.fieldError}>
                  {errors.conditionGrade}
                </p>
              )}
            </div>

            {/* 상품 설명 */}
            <div className={styles.field}>
              <div className={styles.labelRow}>
                <label className={styles.label} htmlFor="description">
                  상품 설명<span className={styles.requiredMark}>*</span>
                </label>
              </div>
              <textarea
                id="description"
                name="description"
                className={`${styles.textarea} ${errors.description ? styles.inputError : ""}`}
                placeholder="구매 시기, 사용 빈도, 구성품 유무, 기기 외관 상태 및 배터리 성능 등을 상세히 적어주세요."
                value={form.description}
                onChange={handleChange}
                aria-invalid={Boolean(errors.description)}
                aria-describedby={errors.description ? "description-error" : undefined}
                required
              />
              {errors.description && (
                <p id="description-error" className={styles.fieldError}>
                  {errors.description}
                </p>
              )}
            </div>

            {/* 이미지 첨부 및 미리보기 */}
            <div className={styles.imageSection}>
              <div className={styles.labelRow}>
                <span className={styles.label}>
                  상품 이미지
                  <span className={styles.imageCount}> ({images.length}/{MAX_IMAGES})</span>
                </span>
                <span className={styles.optionalMark}>최대 5장 · jpg, png, webp (파일당 5MB)</span>
              </div>

              {/* 숨겨진 파일 인풋 */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                multiple
                className={styles.hiddenFileInput}
                onChange={handleImageChange}
              />

              {/* 이미지 업로드 드롭존 버튼 */}
              <div
                className={styles.uploadArea}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
              >
                <div className={styles.uploadPrompt}>
                  <span className={styles.uploadIcon} aria-hidden="true">+</span>
                  <span className={styles.uploadText}>사진 추가하기</span>
                  <span className={styles.uploadSubtext}>클릭하여 이미지를 선택하세요 (최대 5장)</span>
                </div>
              </div>

              {/* 4. 프론트 6장 이상 선택 시 사전 안내 경고 표출 */}
              {imageWarning && (
                <div className={styles.warningBanner} role="status">
                  <span className={styles.warningIcon} aria-hidden="true">!</span>
                  <span>{imageWarning}</span>
                </div>
              )}

              {/* 이미지 에러 (FILE_COUNT_EXCEEDED, FILE_TYPE_NOT_ALLOWED, FILE_TOO_LARGE 등) */}
              {(imageError || errors.images) && (
                <p className={styles.fieldError}>{imageError || errors.images}</p>
              )}

              {/* 2. 이미지 미리보기 그리드 및 개별 삭제 */}
              {images.length > 0 && (
                <div className={styles.previewGrid} aria-label="선택된 이미지 목록">
                  {images.map((item, idx) => (
                    <div key={item.id} className={styles.previewCard}>
                      {idx === 0 && <span className={styles.repBadge}>대표</span>}
                      <img
                        src={item.previewUrl}
                        alt={`첨부 이미지 ${idx + 1}`}
                        className={styles.previewImage}
                      />
                      <button
                        type="button"
                        className={styles.deleteBtn}
                        onClick={() => handleRemoveImage(idx)}
                        aria-label={`이미지 ${idx + 1} 삭제`}
                        title="이미지 삭제"
                      >
                        ×
                      </button>
                      <span className={styles.fileMeta} title={item.file.name}>
                        {item.file.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 일반 에러 배너 */}
            {generalError && (
              <div className={styles.errorBanner} role="alert">
                <span className={styles.errorIcon} aria-hidden="true">!</span>
                <span>{generalError}</span>
              </div>
            )}

            {/* 제출 버튼 (요청 중 비활성 및 로딩 상태) */}
            <div className={styles.actions}>
              <Button
                variant="secondary"
                size="lg"
                type="button"
                onClick={() => navigate(-1)}
                disabled={submitting}
              >
                취소
              </Button>
              <Button
                variant="primary"
                size="lg"
                type="submit"
                loading={submitting}
                disabled={submitting}
              >
                {submitting ? "등록 중…" : "상품 등록하기"}
              </Button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
