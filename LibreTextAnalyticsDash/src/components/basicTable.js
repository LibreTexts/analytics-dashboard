import React from "react";
import { Button, Box, Text, Tip } from "grommet";
import { Download } from "grommet-icons";
import { matchSorter } from "match-sorter";
import { CSVLink } from "react-csv";
import ReactTable from "react-table-6";
import "../css/index.css";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

export default function DataTable({
  data,
  gridArea,
  columnVals
}) {
  let reactTable = React.useRef(null);
  var columns = []
  Object.keys(columnVals).forEach((key) => {
    columns.push({
      Header: key,
      accessor: columnVals[key]
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
