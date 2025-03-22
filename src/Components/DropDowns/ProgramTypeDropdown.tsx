import React, { useEffect, useState } from "react";
import Select from "react-select";
import { APIClient } from "../../helpers/api_helper";

const api = new APIClient();

interface AcademicYearDropdownProps {
  value: any;
  onChange: (selectedOption: any) => void;
  placeholder?: string;
  isInvalid?: boolean;
}

const AcademicYearDropdown: React.FC<AcademicYearDropdownProps> = ({
  value,
  onChange,
  placeholder = "Select Program Type",
  isInvalid = false,
}) => {
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const programType = [
    { value: "Undergraduate", label: "Undergraduate" },
    { value: "Postgraduate", label: "Postgraduate" },
  ];

  useEffect(() => {
    const fetchAcademicYears = async () => {
      try {
        // Fetch data from API
        //const response = await api.get("/api/academic-years", '');
        const response = programType;
        const data = response.map((year: any) => ({
          value: year.value,
          label: year.label,
        }));
        setOptions(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch academic years");
        setLoading(false);
      }
    };

    fetchAcademicYears();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-danger">{error}</div>;
  }

  return (
    <Select
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={isInvalid ? "select-error" : ""}
      styles={{
        menu: (provided) => ({ ...provided, zIndex: 9999 }),
      }}
    />
  );
};

export default AcademicYearDropdown;