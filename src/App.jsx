import React, { useState } from 'react';
import Select from 'react-select';
import CustomOption from './CustomOption';

const App = () => {
  // Define the options array
  const options = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'orange', label: 'Orange' },
    { value: 'grape', label: 'Grape' },
  ];

  // State to store selected options
  const [selectedOptions, setSelectedOptions] = useState([]);

  // Handle selection change
  const handleChange = (selected) => {
    setSelectedOptions(selected);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>Multi-select Dropdown with Checkbox</h2>
      <Select
        isMulti
        options={options}
        components={{ Option: CustomOption }}
        value={selectedOptions}
        onChange={handleChange}
        closeMenuOnSelect={false}
      />
      <div style={{ marginTop: '20px' }}>
        <h3>Selected Items:</h3>
        <ul>
          {selectedOptions.map((option) => (
            <li key={option.value}>{option.label}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;