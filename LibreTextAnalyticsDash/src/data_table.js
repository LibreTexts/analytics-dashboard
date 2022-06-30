import React from 'react';
import ReactTable from 'react-table-6';
import {matchSorter} from 'match-sorter';
import { CSVLink, CSVDownload } from "react-csv";
import {Button, Text, Tip} from "grommet";
import {Download} from "grommet-icons"
import "./index.css"

export default function DataTable({
  tab,
  data,
  hasAdapt,
  showColumns
  }) {
    //console.log("TAB", tab)
    //console.log(showColumns)
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

    if (tab === "student") {
      var getTrProps = (state, rowInfo, instance) => {
      if (rowInfo) {
        //console.log(rowInfo)
        return {
          style: {
            background: rowInfo.original.isEnrolled ? 'white' : 'Gainsboro',
            opacity: rowInfo.original.isEnrolled ? 1 : .4
          }
        }
      }
      return {};
    }
  }

    data.forEach((val, index) => {
      if (Object.keys(val).includes('max')) {
        data[index]['max'] = formatDate(val['max'])
      } else if (!Object.keys(val).includes('max')) {
        data[index]['max'] = ""
      }
      if (val['mostRecentAdaptLoad']) {
        data[index]['mostRecentAdaptLoad'] = formatDate(val['mostRecentAdaptLoad'])
      }
    })

    function numMatch(rows, filter, val) {
      var key = val.keys[0]

      var match = filter.substring(0, 2).replace(/[0-9]/g, '')

      if (match === "<=") {
        var f = filter.replaceAll("<=", "").trim()
        f = parseInt(f)
        return rows.filter(row => row[key] <= f)
      } else if (match.trim() === "<") {
        var f = filter.replaceAll("<", "").trim()
        f = parseInt(f)
        return rows.filter(row => row[key] < f)
      } else if (match.trim() === ">") {
        var f = filter.replaceAll(">", "").trim()
        f = parseInt(f)
        return rows.filter(row => row[key] > f)
      } else if (match === ">=") {
        var f = filter.replaceAll(">=", "").trim()
        f = parseInt(f)
        return rows.filter(row => row[key] >= f)
      } else if (parseInt(filter) || match.trim() === "="){
        var f = filter.replaceAll("=", "").trim()
        f = parseInt(f)
        return rows.filter(row => row[key] === f)
      } else {
        return []
      }
    }

    function dateMatch(rows, filter, val) {
      var key = val.keys[0]

      var date = new Date(filter)

      return rows.filter(row => new Date(row[key]) >= date)
    }

    function createLink(pageInfo, idAccessor) {
      var title = pageInfo.original.pageTitle
      var hasData = pageInfo.original.hasData
      var isEnrolled = pageInfo.original.isEnrolled
      var url = pageInfo.original.pageURL
      var tab = "page"
      if (!url || url.length === 0) {
        tab = "student"
      }
      if (tab === "page") {
        return <a href={url} target="_blank">{title}</a>
      } else if (tab === "student" && hasData) {
        return pageInfo.original._id
      } else if (tab === "student" && !hasData) {
        return <Text weight="bold">{pageInfo.original._id}</Text>
      }
    }

    function formatDate(val, type) {
      if (val) {
        var d = new Date(val)
        var arr = (d.toString().split(" "))

        return arr[1]+" "+arr[2]+" "+arr[3]
      } else {
        return ""
      }
    }

    //console.log(data)
    var headers = [
      {label: 'Name', key: idAccessor},
      {label: 'LT '+column2Label, key: 'objectCount'}
    ]

    var columns = [
      {Header: <Tip content="Name">Name</Tip>, width: 250, accessor: idAccessor,
        Cell: val => (createLink(val, idAccessor)),
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
      {
        Header: <Tip content={column2Label}>{column2Label}</Tip>,
        headerClassName: "lt-data",
        accessor: "objectCount",
        show: showColumns["LT " + column2Label],
        getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        background: 'rgb(255, 255, 158, .5)',
                    },
                };
            },
        filterMethod: (filter, rows) =>
          numMatch(rows, filter.value, { keys: ["objectCount"] }),
        filterAll: true
        },
        {
          Header: <Tip content={column3Label}>{column3Label}</Tip>,
          headerClassName: "lt-data",
          accessor: "viewCount",
          show: showColumns['LT '+ column3Label],
          getProps: (state, rowInfo, column) => {
                  return {
                      style: {
                          background: 'rgb(255, 255, 158, .5)',
                      },
                  };
              },
          filterMethod: (filter, rows) =>
            numMatch(rows, filter.value, { keys: ["viewCount"] }),
          filterAll: true
        },
        {
          Header: <Tip style={{opacity: 1}} content="Most Recent Page Load">Most Recent Page Load</Tip>,
          headerClassName: "lt-data",
          accessor: "max",
          show: showColumns["LT Most Recent Page Load"],
          //Cell: val => formatDate(val, "lt"),
          getProps: (state, rowInfo, column) => {
                  return {
                      style: {
                          background: 'rgb(255, 255, 158, .5)',
                      },
                  };
              },
          filterMethod: (filter, rows) =>
            matchSorter(rows, filter.value, { keys: ["max"] }),
          filterAll: true
        },
        {
          Header: <Tip content="Unique Interaction Days">Unique Interaction Days</Tip>,
          headerClassName: "lt-data",
          accessor: "dateCount",
          show: showColumns['LT Unique Interaction Days'],
          getProps: (state, rowInfo, column) => {
                  return {
                      style: {
                          background: 'rgb(255, 255, 158, .5)',
                      },
                  };
              },
          filterMethod: (filter, rows) =>
            numMatch(rows, filter.value, { keys: ["dateCount"] }),
          filterAll: true
        })
    } else if (tab === "page") {
      headers.push(
        {label: 'Average Page Duration', key: 'durationInMinutes'},
        {label: 'Average Percent Scrolled', key: 'percentAvg'}
      )
      columns.push(
      {
        Header: column2Label,
        accessor: "objectCount",
        filterMethod: (filter, rows) =>
          numMatch(rows, filter.value, { keys: ["objectCount"] }),
        filterAll: true
      },
      {
        Header: "Average Page Duration (minutes)",
        accessor: "durationInMinutes",
        filterMethod: (filter, rows) =>
          numMatch(rows, filter.value, { keys: ["durationInMinutes"] }),
        filterAll: true
      },
      {
        Header: "Average Percent Scrolled", accessor: "percentAvg",
        filterMethod: (filter, rows) =>
          numMatch(rows, filter.value, { keys: ["percentAvg"] }),
        filterAll: true
      })
    }

    if (tab === "student" && hasAdapt) {
      headers.push(
        {label: 'Adapt Unique Interaction Days', key: 'adaptUniqueInteractionDays'},
        {label: 'Adapt Unique Assignments', key: 'adaptUniqueAssignments'},
        {label: 'Adapt Most Recent Page Load', key: 'mostRecentAdaptLoad'}
      )
      columns.push(
      {
        Header: <Tip content="Unique Interaction Days">Unique Interaction Days</Tip>,
        headerClassName: "adapt-data",
        accessor: "adaptUniqueInteractionDays",
        show: showColumns['Adapt Unique Interaction Days'],
        getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        background: 'rgb(171, 247, 177, .5)',
                    },
                };
            },
        filterMethod: (filter, rows) =>
          numMatch(rows, filter.value, { keys: ["adaptUniqueInteractionDays"] }),
        filterAll: true
      },
      {
        Header: <Tip content="Unique Assignments">Unique Assignments</Tip>,
        headerClassName: "adapt-data",
        accessor: "adaptUniqueAssignments",
        show: showColumns['Adapt Unique Assignments'],
        getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        background: 'rgb(171, 247, 177, .5)',
                    },
                };
            },
        filterMethod: (filter, rows) =>
          numMatch(rows, filter.value, { keys: ["adaptUniqueAssignments"] }),
        filterAll: true
      },
      {
        Header: <Tip content="Most Recent Page Load">Most Recent Page Load</Tip>,
        headerClassName: "adapt-data",
        accessor: "mostRecentAdaptLoad",
        show: showColumns['Adapt Most Recent Page Load'],
        //Cell: val => formatDate(val, "adapt"),
        getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        background: 'rgb(171, 247, 177, .5)'
                    },
                };
            },
        filterMethod: (filter, rows) =>
          matchSorter(rows, filter.value, { keys: ["mostRecentAdaptLoad"] }),
        filterAll: true
      })
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
        getTrProps={getTrProps}
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
