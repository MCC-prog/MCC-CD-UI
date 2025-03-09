import React from 'react';
import { Input } from 'reactstrap';

interface ColumnFilter {
  filterValue: any;
  setFilter: any;
  column: any;
}

export const Filter = ({ column }: any) => {
  return (
    <>
      {column.Filter && (
        <div style={{ marginTop: 5 }}>
          {column.render('Filter')}
        </div>
      )}
    </>
  );
};

export const DefaultColumnFilter = ({
  column: {
    filterValue,
    setFilter,
    preFilteredRows: { length },
  }
}: ColumnFilter) => {
  return (
    <Input
      value={filterValue || ''}
      onChange={(e) => {
        setFilter(e.target.value || undefined);
      }}
      placeholder={`search (${length}) ...`}
    />
  );
};
