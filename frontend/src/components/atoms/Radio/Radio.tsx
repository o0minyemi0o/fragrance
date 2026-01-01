import React from 'react';
import styles from './Radio.module.css';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  value: string;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
}

export const Radio: React.FC<RadioProps> = ({
  label,
  value,
  checked,
  disabled,
  onChange,
  name,
  className,
  ...props
}) => {
  return (
    <label className={`${styles.radioLabel} ${className || ''}`}>
      <input
        type="radio"
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        name={name}
        className={styles.radioInput}
        {...props}
      />
      {label}
    </label>
  );
};
