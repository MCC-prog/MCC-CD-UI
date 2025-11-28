import React, { useEffect, useState } from "react";
import Select from "react-select";
import { APIClient } from "../../helpers/api_helper";

const api = new APIClient();

interface GetAllSubjectDropdownProps {
  streamId: string | null;
  depId: string | null;
  value: any;
  onChange: (selectedOption: any) => void;
  placeholder?: string;
  isInvalid?: boolean;
}

const GetAllSubjectDropdown: React.FC<GetAllSubjectDropdownProps> = ({
  streamId,
  depId,
  value,
  onChange,
  placeholder = "Select Subject",
  isInvalid = false,
}) => {
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!streamId || !depId) {
      setOptions([]);
      return;
    }

    const fetchSubjects = async () => {
      setLoading(true);
      setOptions([]);
      try {
        const response = await api.get(
          `/getSubjectsByDeptIdStreamId?deptId=${depId}&streamId=${streamId}`,
          ""
        );
        const subjects = response.map((sub: any) => ({
          value: sub.id,
          label: sub.name,
        }));

        setOptions(subjects);
      } catch (err) {
        console.error("API error:", err);
        setError("Failed to fetch subjects");
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [streamId, depId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-danger">{error}</div>;

  return (
    <Select
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={isInvalid ? "select-error" : ""}
          styles={{
                menu: (provided) => ({ ...provided, zIndex: 9999 }),
                menuList: (provided) => ({
                    ...provided,
                    maxHeight: "170px",
                    overflowY: "auto",
                }),
            }}
    />
  );
};

export default GetAllSubjectDropdown;
