import React from 'react';
import ReactTable from 'react-table-6';
import {matchSorter} from 'match-sorter';
import { CSVLink, CSVDownload } from "react-csv";
import {Button, Tip} from "grommet";
import {Download} from "grommet-icons"
import "./index.css"

export default function DataTable({
  tab,
  data,
  hasAdapt
  }) {
    //console.log("TAB", tab)
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
    function createLink(pageInfo, idAccessor) {
      var title = pageInfo.original.pageTitle
      var url = pageInfo.original.pageURL
      var tab = "page"
      if (url.length === 0) {
        tab = "student"
      }
      if (tab === "page") {
        return <a href={url} target="_blank">{title}</a>
      } else if (tab === "student") {
        return pageInfo.original._id
      }
    }

    function formatDate(val, type) {
      if (type === "lt" && val.original.max) {
        var d = new Date(val.original.max)
      } else if (type === "adapt" && val.original.mostRecentAdaptLoad) {
        var d = new Date(val.original.mostRecentAdaptLoad)
      } else {
        return ""
      }
      var arr = (d.toString().split(" "))
      //console.log(d.toString())
      return arr[1]+" "+arr[2]+" "+arr[3]
    }

    //console.log(data)
    var headers = [
      {label: 'Name', key: idAccessor},
      {label: 'LT '+column2Label, key: 'objectCount'}
    ]

    var columns = [
      {Header: <Tip content="Name">Name</Tip>, width: 250, accessor: idAccessor, Cell: val => (createLink(val, idAccessor)),
            filterMethod: (filter, rows) =>
              matchSorter(rows, filter.value, { keys: [idAccessor] }),
            filterAll: true}
    ]

    if (tab === "student") {
      headers.push(
        {label: 'LT '+column3Label, key: 'viewCount'},
        {label: 'LT Most Recent Page Load', key: 'max'},
        {label: 'LT Unique Interaction Days', key: 'dateCount'}
      )
      columns.push(
    {Header: <Tip content={column2Label}>{column2Label}</Tip>, headerClassName: "lt-data", accessor: "objectCount",
      getProps: (state, rowInfo, column) => {
              return {
                  style: {
                      background: 'rgb(255, 255, 158, .5)',
                  },
              };
          },
          filterMethod: (filter, rows) =>
            matchSorter(rows, filter.value, { keys: ["objectCount"] }),
          filterAll: true},
      {Header: <Tip content={column3Label}>{column3Label}</Tip>, headerClassName: "lt-data", accessor: "viewCount",
        getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        background: 'rgb(255, 255, 158, .5)',
                    },
                };
            },
      filterMethod: (filter, rows) =>
        matchSorter(rows, filter.value, { keys: ["viewCount"] }),
      filterAll: true},
      {Header: <Tip style={{opacity: 1}} content="Most Recent Page Load">Most Recent Page Load</Tip>, headerClassName: "lt-data", accessor: "max", Cell: val => formatDate(val, "lt"),
        getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        background: 'rgb(255, 255, 158, .5)',
                    },
                };
            },
            filterMethod: (filter, rows) =>
              matchSorter(rows, filter.value, { keys: ["max"] }),
            filterAll: true},
      {Header: <Tip content="Unique Interaction Days">Unique Interaction Days</Tip>, headerClassName: "lt-data", accessor: "dateCount",
        getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        background: 'rgb(255, 255, 158, .5)',
                    },
                };
            },
            filterMethod: (filter, rows) =>
              matchSorter(rows, filter.value, { keys: ["dateCount"] }),
            filterAll: true})
    } else if (tab === "page") {
      headers.push(
        {label: 'Average Page Duration', key: 'durationInMinutes'},
        {label: 'Average Percent', key: 'percentAvg'}
      )
      columns.push(
      {Header: column2Label, accessor: "objectCount",
            filterMethod: (filter, rows) =>
              matchSorter(rows, filter.value, { keys: ["objectCount"] }),
            filterAll: true},
      {Header: "Average Page Duration", accessor: "durationInMinutes",
                  filterMethod: (filter, rows) =>
                    matchSorter(rows, filter.value, { keys: ["durationInMinutes"] }),
                  filterAll: true},
            {Header: "Average Percent", accessor: "percentAvg",
                  filterMethod: (filter, rows) =>
                    matchSorter(rows, filter.value, { keys: ["percentAvg"] }),
                  filterAll: true})
    }
    if (tab === "student" && hasAdapt) {
      headers.push(
        {label: 'Adapt Unique Interaction Days', key: 'adaptUniqueInteractionDays'},
        {label: 'Adapt Unique Assignments', key: 'adaptUniqueAssignments'},
        {label: 'Adapt Most Recent Page Load', key: 'mostRecentAdaptLoad'}
      )
      columns.push({Header: <Tip content="Unique Interaction Days">Unique Interaction Days</Tip>, headerClassName: "adapt-data", accessor: "adaptUniqueInteractionDays",
        getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        background: 'rgb(171, 247, 177, .5)',
                    },
                };
            },
      filterMethod: (filter, rows) =>
        matchSorter(rows, filter.value, { keys: ["adaptUniqueInteractionDays"] }),
      filterAll: true},
      {Header: <Tip content="Unique Assignments">Unique Assignments</Tip>, headerClassName: "adapt-data", accessor: "adaptUniqueAssignments",
        getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        background: 'rgb(171, 247, 177, .5)',
                    },
                };
            },
            filterMethod: (filter, rows) =>
              matchSorter(rows, filter.value, { keys: ["adaptUniqueAssignments"] }),
            filterAll: true},
      {Header: <Tip content="Most Recent Page Load">Most Recent Page Load</Tip>, headerClassName: "adapt-data", accessor: "mostRecentAdaptLoad", Cell: val => formatDate(val, "adapt"),
        getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        background: 'rgb(171, 247, 177, .5)'
                    },
                };
            },
            filterMethod: (filter, rows) =>
              matchSorter(rows, filter.value, { keys: ["mostRecentAdaptLoad"] }),
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
