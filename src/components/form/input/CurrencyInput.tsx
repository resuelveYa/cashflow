import React, { forwardRef, useState, useEffect } from 'react';
import InputField from './InputField';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'min' | 'max' | 'step'> {
  success?: boolean;
  error?: boolean;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  step?: number;
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({
  error, success, hint, value, onChange, className = "", ...props
}) => {
  const [displayValue, setDisplayValue] = useState('');

  // Formatear valor al cambiar desde props
  useEffect(() => {
    if (value === '') {
      setDisplayValue('');
      return;
    }
    const num = parseInt(value.replace(/\D/g, ''));
    if (!isNaN(num)) {
      setDisplayValue(new Intl.NumberFormat('es-CL').format(num));
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, ''); // Solo números

    if (rawValue === '') {
      setDisplayValue('');
      onChange('');
      return;
    }

    const numValue = parseInt(rawValue);
    if (!isNaN(numValue)) {
      // Formatear para mostrar
      setDisplayValue(new Intl.NumberFormat('es-CL').format(numValue));
      // Guardar valor puro
      onChange(rawValue);
    }
  };

  return (
    <InputField
      error={error}
      success={success}
      hint={hint}
      value={displayValue}
      onChange={handleInputChange}
      className={className}
      placeholder="0"
      {...props}
    />
  );
};

export default CurrencyInput;
