import React from "react";
import { Box } from "grommet";
import ReactTable from "react-table-6";
import "../css/index.css";

export default function DataTable({
  data,
  gridArea,
  columnVals
}) {
  var columns = []
  Object.keys(columnVals).forEach((key) => {
    columns.push({
      Header: <a tabIndex={0} href="/#">{key}</a>,
      accessor: columnVals[key],
      Cell: (val) => <a tabIndex={0} href="/#" a11ytitle={key}>{val.original[columnVals[key]]}</a>
    })
  })

  return (
    <Box width="1000px">
      <ReactTable
        data={data}
        columns={columns}
        style={{ textAlign: "center", overflow: "hidden" }}
        minRows={1}
        defaultPageSize={8}
        filterable={true}
        pageSizeOptions={[10, 25, 50]}
      ></ReactTable>
    </Box>
  );
}
