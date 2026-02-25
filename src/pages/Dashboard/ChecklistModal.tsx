// import AcademicYearDropdown from "Components/DropDowns/AcademicYearDropdown";
// import React, { useEffect, useState } from "react";
// import { Modal, ModalBody, ModalHeader, Table, Label } from "reactstrap";
// import { APIClient } from "../../helpers/api_helper";

// const api = new APIClient();

// // Local types for checklist modal
// interface Props {
//   show: boolean;
//   onClose: () => void;
// }

// interface ScreenUsageItemDto {
//   screenName: string;
//   tableName: string;
//   filledCount: number;
//   rowIds: Array<string | number>;
// }

// interface ScreenUsageResponseDto {
//   totalScreens: number;
//   screens: ScreenUsageItemDto[];
// }

// const ChecklistModal: React.FC<Props> = ({ show, onClose }) => {
//   const [academicYear, setAcademicYear] = useState<{
//     value: number;
//     label: number;
//   } | null>(null);
//   const [screenData, setScreenData] = useState<ScreenUsageResponseDto | null>(
//     null
//   );

//   useEffect(() => {
//     if (!academicYear) return;

//     api
//       .get(
//         `/screenUsage/getByUserAndYear?academicYear=${academicYear.value}`,
//         ""
//       )
//       .then((res) => {
//         console.log("API RESPONSE:", res);
//         setScreenData(res); // ⭐ Correct
//       })
//       .catch((err) => console.error("Error fetching checklist:", err));
//   }, [academicYear]);

//   return (
//     <Modal
//       isOpen={show}
//       toggle={onClose}
//       size="xl"
//       centered
//       style={{ maxWidth: "95%", marginTop: "20px" }} // ⭐ Good width & position
//     >
//       <ModalHeader toggle={onClose}>📊 Screen Completion Checklist</ModalHeader>

//       <ModalBody>
//         {/* Academic Year */}
//         <Label>Academic Year</Label>
//         <AcademicYearDropdown
//           value={academicYear}
//           onChange={(selectedOption) => setAcademicYear(selectedOption)}
//         />

//         {screenData && (
//           <div className="mt-3">
//             <h5>
//               Total Screens Filled: <b>{screenData.totalScreens}</b>
//             </h5>

//             <Table bordered hover responsive>
//               <thead>
//                 <tr>
//                   <th>Screen Name</th>
//                   <th>Filled Count</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {screenData.screens.map((scr) => (
//                   <tr key={scr.screenName}>
//                     <td>{scr.tableName}</td>
//                     <td>{scr.filledCount}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </Table>
//           </div>
//         )}
//       </ModalBody>
//     </Modal>
//   );
// };

// export default ChecklistModal;

import AcademicYearDropdown from "Components/DropDowns/AcademicYearDropdown";
import React, { useEffect, useState } from "react";
import { Modal, ModalBody, ModalHeader, Table, Label, Pagination, PaginationItem, PaginationLink } from "reactstrap";
import { APIClient } from "../../helpers/api_helper";

const api = new APIClient();

interface Props {
  show: boolean;
  onClose: () => void;
}

interface ScreenUsageItemDto {
  screenName: string;
  tableName: string;
  filledCount: number;
  rowIds: Array<string | number>;
}

interface ScreenUsageResponseDto {
  totalScreens: number;
  screens: ScreenUsageItemDto[];
}

const ChecklistModal: React.FC<Props> = ({ show, onClose }) => {
  const [academicYear, setAcademicYear] = useState<{ value: number; label: number } | null>(null);
  const [screenData, setScreenData] = useState<ScreenUsageResponseDto | null>(null);

  
  const [currentPage, setCurrentPage] = useState<number>(1);
  const recordsPerPage = 10;

 
  useEffect(() => {
    if (!academicYear) return;

    api
      .get(`/screenUsage/getByUserAndYear?academicYear=${academicYear.value}`, "")
      .then((res) => {
        setScreenData(res);
        setCurrentPage(1); // reset to page 1 whenever year changes
      })
      .catch((err) => console.error("Error fetching checklist:", err));
  }, [academicYear]);

 
  const totalRecords = screenData?.screens.length || 0;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;

  const currentRecords =
    screenData?.screens.slice(indexOfFirstRecord, indexOfLastRecord) || [];


  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleClose = () => {
  setAcademicYear(null);   // reset dropdown
  setScreenData(null);     // clear data
  onClose();               // close modal
};

  return (
    <Modal className="checklist-modal" isOpen={show} toggle={handleClose} size="xl" centered style={{ maxWidth: "95%", marginTop: "20px" }}>
      <ModalHeader toggle={handleClose}>📊 Screen Completion Checklist</ModalHeader>

      <ModalBody>
        {/* Academic Year */}
        <Label>Academic Year</Label>
        <AcademicYearDropdown value={academicYear} onChange={setAcademicYear} />

        {screenData && (
          <div className="mt-3">
            <h5>
              Total Screens Filled: <b>{screenData.totalScreens}</b>
            </h5>

            <Table bordered hover responsive>
              <thead>
                <tr>
                  <th>Sl. No.</th>
                  <th>Screen Name</th>
                  <th>Filled Count</th>
                </tr>
              </thead>
              <tbody>
                {currentRecords.map((scr) => (
                  <tr key={scr.screenName}>
                    <td>{screenData.screens.indexOf(scr) + 1}</td>
                    <td>{scr.tableName}</td>
                    <td>{scr.filledCount}</td>
                  </tr>
                ))}
              </tbody>
            </Table>

            
            {totalPages > 1 && (
              <Pagination className="justify-content-center">
                {/* Prev */}
                <PaginationItem disabled={currentPage === 1}>
                  <PaginationLink
                    previous
                    onClick={() => handlePageChange(currentPage - 1)}
                  />
                </PaginationItem>

            
                {Array.from({ length: totalPages }, (_, i) => (
                  <PaginationItem active={currentPage === i + 1} key={i}>
                    <PaginationLink onClick={() => handlePageChange(i + 1)}>
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                {/* Next */}
                <PaginationItem disabled={currentPage === totalPages}>
                  <PaginationLink
                    next
                    onClick={() => handlePageChange(currentPage + 1)}
                  />
                </PaginationItem>
              </Pagination>
            )}
          </div>
        )}
      </ModalBody>
    </Modal>
  );
};

export default ChecklistModal;

