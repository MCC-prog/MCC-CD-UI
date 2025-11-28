import React, { useEffect, useState } from "react";
import Select from "react-select";
import { APIClient } from "../../helpers/api_helper";

const api = new APIClient();

interface StreamDropdownProps {
  value: any;
  onChange: (selectedOption: any) => void;
  placeholder?: string;
  isInvalid?: boolean;
}

const StreamDropdown: React.FC<StreamDropdownProps> = ({
  value,
  onChange,
  placeholder = "Select School",
  isInvalid = false,
}) => {
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        // Fetch data from API
        const response = await api.get("/getAllStream", '');
        
        // Filter the response where isActive is true
        const filteredStreamList = response.filter(
          (stream: any) => stream.isActive
        );

        // Map the filtered data to the required format
        const streamList = filteredStreamList.map((stream: any) => ({
          value: stream.id,
          label: stream.name
        }));
       
        setOptions(streamList);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch all schools");
        setLoading(false);
      }
    };

    fetchStreams();
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
                menuList: (provided) => ({
                    ...provided,
                    maxHeight: "170px",
                    overflowY: "auto",
                }),
            }}
    />
  );
};

export default StreamDropdown;