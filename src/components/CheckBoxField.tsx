import { Checkbox, FormControl, FormLabel } from '@chakra-ui/react';
import React from 'react';

interface CheckBoxFieldProps {
  label: string;
  isChecked: boolean;
  // eslint-disable-next-line no-unused-vars
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CheckBoxField = ({ label, isChecked, handleChange }: CheckBoxFieldProps) => {
  return (
    <FormControl>
      <FormLabel>{label}</FormLabel>
      <Checkbox isChecked={isChecked} onChange={handleChange}>
        반복 일정
      </Checkbox>
    </FormControl>
  );
};

export default CheckBoxField;
