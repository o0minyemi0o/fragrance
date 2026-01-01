import React, { useEffect } from 'react';
import { Button } from '../../atoms/Button/Button';
import styles from './Modal.module.css';

export interface ModalProps {
  /**
   * 모달 열림 상태
   */
  isOpen: boolean;

  /**
   * 모달 닫기 핸들러
   */
  onClose: () => void;

  /**
   * 모달 제목
   */
  title?: string;

  /**
   * 모달 내용
   */
  children: React.ReactNode;

  /**
   * 모달 크기
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';

  /**
   * 오버레이 클릭 시 닫기 여부
   */
  closeOnOverlayClick?: boolean;

  /**
   * Footer 영역 (버튼 등)
   */
  footer?: React.ReactNode;

  /**
   * 닫기 버튼 숨김 여부
   */
  hideCloseButton?: boolean;
}

/**
 * Modal 컴포넌트
 *
 * 중앙에 표시되는 범용 모달입니다.
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  footer,
  hideCloseButton = false,
}) => {
  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // 모달 열릴 때 body 스크롤 방지
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={`${styles.modal} ${styles[size]}`}>
        {/* Header */}
        {(title || !hideCloseButton) && (
          <div className={styles.header}>
            {title && <h2 className={styles.title}>{title}</h2>}
            {!hideCloseButton && (
              <Button
                onClick={onClose}
                variant="outline"
                aria-label="Close modal"
                className={styles.closeButton}
              >
                ×
              </Button>
            )}
          </div>
        )}

        {/* Body */}
        <div className={styles.body}>{children}</div>

        {/* Footer */}
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  );
};

/**
 * ModalHeader 서브컴포넌트 (커스텀 헤더용)
 */
export const ModalHeader = ({ children, className = '', ...rest }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={`${styles.header} ${className}`} {...rest}>
      {children}
    </div>
  );
};

ModalHeader.displayName = 'ModalHeader';

/**
 * ModalBody 서브컴포넌트 (커스텀 바디용)
 */
export const ModalBody = ({ children, className = '', ...rest }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={`${styles.body} ${className}`} {...rest}>
      {children}
    </div>
  );
};

ModalBody.displayName = 'ModalBody';

/**
 * ModalFooter 서브컴포넌트 (커스텀 푸터용)
 */
export const ModalFooter = ({ children, className = '', ...rest }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={`${styles.footer} ${className}`} {...rest}>
      {children}
    </div>
  );
};

ModalFooter.displayName = 'ModalFooter';
