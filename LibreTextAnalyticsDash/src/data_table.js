import React from 'react';
import ReactTable from 'react-table-6';
import {matchSorter} from 'match-sorter';
import { CSVLink, CSVDownload } from "react-csv";
import {Button} from "grommet";
import {Download} from "grommet-icons"

export default function DataTable({
  tab,
  data
  }) {
    const [pageSize, setPageSize] = React.useState(20);
    let reactTable = React.useRef(null);
    const [exportData, setExportData] = React.useState(data)
    //console.log(this.props.data)
    if (tab === "student") {
      var column2Label = "Unique Pages Accessed";
      var column3Label = "Total Page Views"
      var idAccessor = "_id";
      var filename = "student-data.csv"
    } else if (tab === "page") {
      var column3Label = "Number of Times Viewed";
      var column2Label = "Total Students Who Viewed"
      var idAccessor = "pageTitle";
      var filename = "page-data.csv"
    }
    function createLink(pageInfo) {
      var title = pageInfo.original.pageTitle
      var url = pageInfo.original.pageURL
      var tab = "page"
      if (url === undefined) {
        tab = "student"
      }
      if (tab === "page") {
        return <a href={url} target="_blank">{title}</a>
      } else if (tab === "student") {
        return pageInfo.original._id
      }
    }
    function formatDate(val) {
      var d = new Date(val.original.max)
      //console.log(d.toString())
      return d.toString()
    }
    
    //console.log(this.props.data)
    var headers = [
      {label: 'Name', key: idAccessor},
      {label: column2Label, key: 'objectCount'}
    ]
    if (tab === "page") {
      headers.push(
        {label: 'Average Page Duration', key: 'durationInMinutes'},
        {label: 'Average Percent', key: 'percentAvg'}
      )
    } else if (tab === "student") {
      headers.push(
        {label: 'Most Recent Page Load', key: 'max'},
        {label: 'Unique Interaction Days', key: 'dateCount'}
      )
    }

    var columns = [
      {Header: "Name", width: 250, accessor: idAccessor, Cell: val => (createLink(val)),
            filterMethod: (filter, rows) =>
              matchSorter(rows, filter.value, { keys: [idAccessor] }),
            filterAll: true},
      {Header: column2Label, accessor: "objectCount",
            filterMethod: (filter, rows) =>
              matchSorter(rows, filter.value, { keys: ["objectCount"] }),
            filterAll: true},
      {Header: column3Label, accessor: "viewCount",
            filterMethod: (filter, rows) =>
              matchSorter(rows, filter.value, { keys: ["viewCount"] }),
            filterAll: true}
    ]

    if (tab === "student") {
      columns.push({Header: "Most Recent Page Load", accessor: "max", Cell: val => formatDate(val),
            filterMethod: (filter, rows) =>
              matchSorter(rows, filter.value, { keys: ["max"] }),
            filterAll: true},
      {Header: "Unique Interaction Days", accessor: "dateCount",
            filterMethod: (filter, rows) =>
              matchSorter(rows, filter.value, { keys: ["dateCount"] }),
            filterAll: true})
    } else if (tab === "page") {
      columns.push({Header: "Average Page Duration", accessor: "durationInMinutes",
                  filterMethod: (filter, rows) =>
                    matchSorter(rows, filter.value, { keys: ["durationInMinutes"] }),
                  filterAll: true},
            {Header: "Average Percent", accessor: "percentAvg",
                  filterMethod: (filter, rows) =>
                    matchSorter(rows, filter.value, { keys: ["percentAvg"] }),
                  filterAll: true})
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
