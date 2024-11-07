import { FormControl, FormLabel, Input } from '@chakra-ui/react';
import React from 'react';

interface InputFieldProps {
  value: string;
  title: string;
  type: 'string' | 'number' | 'date';
  // eslint-disable-next-line no-unused-vars
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputField = ({ title, type, handleChange, value }: InputFieldProps) => {
  return (
    <FormControl>
      <FormLabel>{title}</FormLabel>
      <Input value={value} type={type} onChange={handleChange} />
    </FormControl>
  );
};

export default InputField;
