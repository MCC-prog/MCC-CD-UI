import React, { useEffect, useState } from "react";
import Select from "react-select";
import { APIClient } from "../../helpers/api_helper";

const api = new APIClient();

interface GetAllClassesProps {
  value: any;
  onChange: (selectedOption: any) => void;
  placeholder?: string;
  isInvalid?: boolean;
}

const GetAllClasses: React.FC<GetAllClassesProps> = ({
  value,
  onChange,
  placeholder = "Select Class",
  isInvalid = false,
}) => {
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const fetchGetAllClasses = async () => {
    try {
      const response = await api.get("/getAllDispalayClasses", "");

      const classList = response.map((department: any) => ({
        value: department.id,
        label: department.className,
      }));

      console.log("Mapped Class Options:", classList);

      setOptions(classList);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch all Classes");
      setLoading(false);
    }
  };

  fetchGetAllClasses();
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

export default GetAllClasses;
