import React from 'react';
import { Label } from '../../atoms/Label/Label';
import { Input } from '../../atoms/Input/Input';
import { Textarea } from '../../atoms/Textarea/Textarea';
import { Select } from '../../atoms/Select/Select';
import type { InputProps } from '../../atoms/Input/Input';
import type { TextareaProps } from '../../atoms/Textarea/Textarea';
import type { SelectProps } from '../../atoms/Select/Select';
import styles from './FormField.module.css';

type InputType = 'input' | 'textarea' | 'select';

interface BaseFormFieldProps {
  /**
   * 라벨 텍스트
   */
  label: string;

  /**
   * 필수 필드 여부
   */
  required?: boolean;

  /**
   * 에러 메시지
   */
  errorMessage?: string;

  /**
   * 도움말 텍스트
   */
  helpText?: string;

  /**
   * 입력 필드 ID (접근성)
   */
  id: string;
}

type FormFieldProps = BaseFormFieldProps &
  (
    | ({ type?: 'input' } & InputProps)
    | ({ type: 'textarea' } & TextareaProps)
    | ({ type: 'select' } & SelectProps)
  );

/**
 * FormField 컴포넌트
 *
 * Label과 Input/Textarea/Select를 결합한 폼 필드입니다.
 */
export const FormField = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  FormFieldProps
>(({ label, required = false, errorMessage, helpText, id, type = 'input', ...rest }, ref) => {
  const hasError = !!errorMessage;

  const renderInput = () => {
    const commonProps = {
      id,
      error: hasError,
      fullWidth: true,
      ...rest,
    };

    switch (type) {
      case 'textarea':
        return <Textarea ref={ref as React.Ref<HTMLTextAreaElement>} {...(commonProps as TextareaProps)} />;
      case 'select':
        return <Select ref={ref as React.Ref<HTMLSelectElement>} {...(commonProps as SelectProps)} />;
      default:
        return <Input ref={ref as React.Ref<HTMLInputElement>} {...(commonProps as InputProps)} />;
    }
  };

  return (
    <div className={styles.formField}>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      {renderInput()}
      {helpText && !hasError && <p className={styles.helpText}>{helpText}</p>}
      {hasError && <p className={styles.errorMessage}>{errorMessage}</p>}
    </div>
  );
});

FormField.displayName = 'FormField';
