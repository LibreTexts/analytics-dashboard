import React from "react";
import ReactTable from "react-table-6";
import { Tip } from "grommet";

export default function StudentTextbookEngagementTable({
  data,
  headers,
  filename,
}) {
  var columns = [
    {
      Header: <Tip content="Unique Pages">Unique Pages</Tip>,
      accessor: "_id",
    },
  ];

  //create a table with 1 column of the unique pages a student read
  return (
    <ReactTable
      data={data}
      columns={columns}
      style={{ textAlign: "center", overflow: "hidden" }}
      defaultPageSize={5}
      gridArea="table"
      filterable={true}
    />
  );
}
