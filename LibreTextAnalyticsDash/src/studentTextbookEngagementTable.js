import React from "react";
import ReactTable from "react-table-6";
import { matchSorter } from "match-sorter";
import { CSVLink, CSVDownload } from "react-csv";
import { Button, Text, Tip } from "grommet";
import { Download } from "grommet-icons";

export default function StudentTextbookEngagementTable({
data,
headers,
filename
}) {
  var columns = [
    {
      Header: (
        <Tip content="Unique Pages">Unique Pages</Tip>
      ),
      accessor: "_id"
    }
  ]

  return (
      <ReactTable
        data={data}
        columns={columns}
        style={{ textAlign: "center", overflow: "hidden" }}
        defaultPageSize={5}
        gridArea="table"
        filterable={true}
      ></ReactTable>
  )
}
