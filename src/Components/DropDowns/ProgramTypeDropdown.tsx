import React, { useEffect, useState } from "react";
import Select from "react-select";
import { APIClient } from "../../helpers/api_helper";

const api = new APIClient();

interface ProgramTypeDropdownProps {
  deptId: string | null;
  value: any;
  onChange: (selectedOption: any) => void;
  placeholder?: string;
  isInvalid?: boolean;
}

const ProgramTypeDropdown: React.FC<ProgramTypeDropdownProps> = ({
  deptId,
  value,
  onChange,
  placeholder = "Select Program Type",
  isInvalid = false,
}) => {
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!deptId) {
      setOptions([]);
      return;
    }

    const fetchProgramTypes = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/getProgramTypeByDept?deptId=${deptId}`, "");
        const programTypes = response.map((program: any) => ({
          value: program.id,
          label: program.name,
        }));
        setOptions(programTypes);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch program types");
        setLoading(false);
      }
    };

    fetchProgramTypes();
  }, [deptId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-danger">{error}</div>;

  return (
    <Select
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={isInvalid ? "select-error" : ""}
    />
  );
};

export default ProgramTypeDropdown;