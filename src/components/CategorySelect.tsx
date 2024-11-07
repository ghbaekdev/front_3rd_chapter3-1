import { FormControl, FormLabel, Select } from '@chakra-ui/react';
import React from 'react';

import { categories } from '../lib';

interface CategorySelectProps {
  label: string;
  value: string;
  // eslint-disable-next-line no-unused-vars
  handleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const CustomSelect = ({ label, value, handleChange }: CategorySelectProps) => {
  return (
    <FormControl>
      <FormLabel>{label}</FormLabel>
      <Select value={value} onChange={handleChange}>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </Select>
    </FormControl>
  );
};

export default CustomSelect;
