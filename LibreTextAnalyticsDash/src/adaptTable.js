import React from 'react';
import ReactTable from 'react-table-6';
import {matchSorter} from 'match-sorter';
import { CSVLink, CSVDownload } from "react-csv";
import {Button} from "grommet";
import {Download} from "grommet-icons"

export default function AdaptTable({
  tab,
  data
  }) {
    const [pageSize, setPageSize] = React.useState(20);
    let reactTable = React.useRef(null);
    const [exportData, setExportData] = React.useState(data)
    var filename = "adapt-students.csv"
    console.log(data)
    //console.log(this.props.data)
    var headers = [
      {label: 'Name', key: "_id"},
      {label: "Most Recent Page Load", key: 'lastDate'},
      {label: "Unique Assignment Attempts", key: "uniqueAssignments"}
    ]

    var columns = [
      {Header: "Student", width: 250, accessor: "_id",
            filterMethod: (filter, rows) =>
              matchSorter(rows, filter.value, { keys: ["_id"] }),
            filterAll: true},
      {Header: "Most Recent Page Load", accessor: "lastDate", Cell: value => formatDate(value),
            filterMethod: (filter, rows) =>
              matchSorter(rows, filter.value, { keys: ["lastDate"] }),
            filterAll: true},
      {Header: "Unique Assignment Attempts", width: 250, accessor: "uniqueAssignments",
            filterMethod: (filter, rows) =>
              matchSorter(rows, filter.value, { keys: ["uniqueAssignments"] }),
            filterAll: true}
    ]

    function formatDate(val) {
      var d = new Date(val.original.lastDate)
      //console.log(d.toString())
      return d.toString()
    }

    return (
      <>
      <ReactTable
        data={data}
        ref={(r) => {
          reactTable = r;
        }}
        onFilteredChange={() => {
          setExportData(reactTable.getResolvedState().sortedData);
        }}
        columns={columns}
        style={{textAlign: 'center', overflow: 'hidden'}}
        minRows={1}
        gridArea="table"
        filterable={true}
      >
      </ReactTable>
      <div>
        <CSVLink data={exportData} headers={headers} filename={filename}>
          <Button secondary icon={<Download/>} />
        </CSVLink>
      </div>
      </>
    )
  }
