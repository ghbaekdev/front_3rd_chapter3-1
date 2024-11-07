import { FormControl, FormLabel, Input, Tooltip } from '@chakra-ui/react';
import React from 'react';

interface DateFieldProps {
  type: 'time' | 'date';
  value: string;
  // eslint-disable-next-line no-unused-vars
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBlur: () => void;
  error: string | null;
  label: string;
}

const DateField = ({ type, value, handleChange, error, label, handleBlur }: DateFieldProps) => {
  return (
    <FormControl>
      <FormLabel>{label}</FormLabel>
      <Tooltip label={error} isOpen={!!error} placement="top">
        <Input
          type={type}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          isInvalid={!!error}
        />
      </Tooltip>
    </FormControl>
  );
};

export default DateField;
