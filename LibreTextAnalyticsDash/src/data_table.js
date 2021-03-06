import React from "react";
import ReactTable from "react-table-6";
import { matchSorter } from "match-sorter";
import { CSVLink, CSVDownload } from "react-csv";
import { Button, Text, Tip } from "grommet";
import { Download } from "grommet-icons";
import "./index.css";

export default function DataTable({
  tab,
  data,
  hasAdapt,
  showColumns,
  activityFilter,
  showNonStudents,
  ltCourse,
  adaptCourse,
  displayMode
}) {
  const [pageSize, setPageSize] = React.useState(20);
  let reactTable = React.useRef(null);
  const [exportData, setExportData] = React.useState(data);
  //console.log(this.props.data)
  if (tab === "student" && !displayMode) {
    var column2Label = "Unique Pages Accessed";
    var column3Label = "Total Page Views";
    var idAccessor = "_id";
    var filename = "student-data.csv";
    var pageLength = 8;
  } else if (tab === "student" && displayMode) {
    var column2Label = "Unique Pages Accessed";
    var column3Label = "Total Page Views";
    var idAccessor = "displayModeStudent";
    var filename = "student-data.csv";
    var pageLength = 8;
  } else if (tab === "page") {
    var column3Label = "Number of Times Viewed";
    var column2Label = "Total Students Who Viewed";
    var idAccessor = "pageTitle";
    var filename = "page-data.csv";
    var pageLength = 9;
  }

  if (tab === "student") {
    var getTrProps = (state, rowInfo, instance) => {
      if (rowInfo) {
        //console.log(rowInfo)
        return {
          style: {
            background: rowInfo.original.isEnrolled ? "white" : "Gainsboro",
            opacity: rowInfo.original.isEnrolled ? 1 : 0.4,
          },
        };
      }
      return {};
    };
  }
  var showData = JSON.parse(JSON.stringify(data));
  if (showNonStudents === false) {
    showData = showData.filter(o => o.isEnrolled)
  }

  showData.forEach((val, index) => {
    if (Object.keys(val).includes("max")) {
      showData[index]["max"] = formatDate(val["max"]);
    } else if (!Object.keys(val).includes("max")) {
      showData[index]["max"] = "";
    }
    if (val["mostRecentAdaptLoad"]) {
      showData[index]["mostRecentAdaptLoad"] = formatDate(
        val["mostRecentAdaptLoad"]
      );
    }
    showData[index]["enrolled"] = val["isEnrolled"] ? "Yes" : "No";
  });
  //console.log(showData)

  // if (activityFilter === "No Recent LibreText Activity") {
  //   data.sort((a, b) => {
  //     return a - b
  //   })
  // } else if (activityFilter === "No Recent Adapt Activity") {
  //
  // } else if (activityFilter === "Low Adapt Performance") {
  //
  // }

  function numMatch(rows, filter, val) {
    var key = val.keys[0];

    var match = filter.substring(0, 2).replace(/[0-9]/g, "");

    if (match === "<=") {
      var f = filter.replaceAll("<=", "").trim();
      f = parseInt(f);
      return rows.filter((row) => row[key] <= f);
    } else if (match.trim() === "<") {
      var f = filter.replaceAll("<", "").trim();
      f = parseInt(f);
      return rows.filter((row) => row[key] < f);
    } else if (match.trim() === ">") {
      var f = filter.replaceAll(">", "").trim();
      f = parseInt(f);
      return rows.filter((row) => row[key] > f);
    } else if (match === ">=") {
      var f = filter.replaceAll(">=", "").trim();
      f = parseInt(f);
      return rows.filter((row) => row[key] >= f);
    } else if (parseInt(filter) || match.trim() === "=") {
      var f = filter.replaceAll("=", "").trim();
      f = parseInt(f);
      return rows.filter((row) => row[key] === f);
    } else {
      return [];
    }
  }

  function dateMatch(rows, filter, val) {
    var key = val.keys[0];

    var date = new Date(filter);

    return rows.filter((row) => new Date(row[key]) >= date);
  }

  function createLink(pageInfo, idAccessor) {
    var title = pageInfo.original.pageTitle;
    var hasData = pageInfo.original.hasData;
    var isEnrolled = pageInfo.original.isEnrolled;
    var url = pageInfo.original.pageURL;
    var tab = "page";
    //console.log(pageInfo)
    if (!url || url.length === 0) {
      tab = "student";
    }
    if (tab === "page") {
      return (
        <a href={url} target="_blank">
          {title}
        </a>
      );
    } else if (tab === "student" && hasData) {
      return pageInfo.original[idAccessor];
    } else if (tab === "student" && !hasData) {
      return <Text weight="bold">{pageInfo.original[idAccessor]}</Text>;
    }
  }

  function formatDate(val, type) {
    // if (type === "lt" && val.original.max) {
    //   var d = new Date(val.original.max)
    // } else if (type === "adapt" && val.original.mostRecentAdaptLoad) {
    //   var d = new Date(val.original.mostRecentAdaptLoad)
    // } else {
    //   return ""
    // }
    if (val) {
      var d = new Date(val);
      var arr = d.toString().split(" ");
      //console.log(d.toString())
      return arr[1] + " " + arr[2] + " " + arr[3];
    } else {
      return "";
    }
  }

  //console.log(data)
  var headers = [
    { label: "Name", key: idAccessor },
    { label: "LT " + column2Label, key: "objectCount" }
  ];

  var columns = [
    {
      Header: <Tip content="Name">Name</Tip>,
      width: 250,
      accessor: idAccessor,
      Cell: (val) => createLink(val, idAccessor),
      filterMethod: (filter, rows) =>
        matchSorter(rows, filter.value, { keys: [idAccessor] }),
      filterAll: true,
    },
  ];

  if (tab === "student" && ltCourse) {
    headers.splice(1, 0, { label: "Is Enrolled", key: "enrolled" })
    headers.push(
      { label: "LT " + column3Label, key: "viewCount" },
      { label: "LT Most Recent Page Load", key: "max" },
      { label: "LT Unique Interaction Days", key: "dateCount" }
    );
    columns.push(
      {
        Header: <Tip content={column2Label}>{column2Label}</Tip>,
        headerClassName: "lt-data wordwrap",
        accessor: "objectCount",
        show: showColumns["LT " + column2Label],
        getProps: (state, rowInfo, column) => {
          return {
            style: {
              background: "rgb(255, 255, 158, .5)",
            },
          };
        },
        filterMethod: (filter, rows) =>
          numMatch(rows, filter.value, { keys: ["objectCount"] }),
        filterAll: true,
      },
      {
        Header: <Tip content={column3Label}>{column3Label}</Tip>,
        headerClassName: "lt-data wordwrap",
        accessor: "viewCount",
        show: showColumns["LT " + column3Label],
        getProps: (state, rowInfo, column) => {
          return {
            style: {
              background: "rgb(255, 255, 158, .5)",
            },
          };
        },
        filterMethod: (filter, rows) =>
          numMatch(rows, filter.value, { keys: ["viewCount"] }),
        filterAll: true,
      },
      {
        Header: (
          <Tip style={{ opacity: 1 }} content="Most Recent Page Load">
            Most Recent Page Load
          </Tip>
        ),
        headerClassName: "lt-data wordwrap",
        accessor: "max",
        show: showColumns["LT Most Recent Page Load"],
        //Cell: val => formatDate(val, "lt"),
        getProps: (state, rowInfo, column) => {
          return {
            style: {
              background: "rgb(255, 255, 158, .5)",
            },
          };
        },
        filterMethod: (filter, rows) =>
          matchSorter(rows, filter.value, { keys: ["max"] }),
        filterAll: true,
      },
      {
        Header: (
          <Tip content="Unique Interaction Days">Unique Interaction Days</Tip>
        ),
        headerClassName: "lt-data wordwrap",
        accessor: "dateCount",
        show: showColumns["LT Unique Interaction Days"],
        getProps: (state, rowInfo, column) => {
          return {
            style: {
              background: "rgb(255, 255, 158, .5)",
            },
          };
        },
        filterMethod: (filter, rows) =>
          numMatch(rows, filter.value, { keys: ["dateCount"] }),
        filterAll: true,
      }
    );
  } else if (tab === "page") {
    headers.push(
      { label: "Average Page Duration", key: "durationInMinutes" },
      { label: "Average Percent Scrolled", key: "percentAvg" }
    );
    columns.push(
      {
        Header: column2Label,
        accessor: "objectCount",
        filterMethod: (filter, rows) =>
          numMatch(rows, filter.value, { keys: ["objectCount"] }),
        filterAll: true,
      },
      {
        Header: "Average Page Duration (minutes)",
        accessor: "durationInMinutes",
        filterMethod: (filter, rows) =>
          numMatch(rows, filter.value, { keys: ["durationInMinutes"] }),
        filterAll: true,
      },
      {
        Header: "Average Percent Scrolled",
        accessor: "percentAvg",
        filterMethod: (filter, rows) =>
          numMatch(rows, filter.value, { keys: ["percentAvg"] }),
        filterAll: true,
      }
    );
  }

  if (tab === "student" && (hasAdapt || adaptCourse)) {
    headers.push(
      {
        label: "Adapt Unique Interaction Days",
        key: "adaptUniqueInteractionDays",
      },
      { label: "Adapt Unique Assignments", key: "adaptUniqueAssignments" },
      { label: "Adapt Most Recent Page Load", key: "mostRecentAdaptLoad" }
    );
    columns.push(
      {
        Header: (
          <Tip content="Unique Interaction Days">Unique Interaction Days</Tip>
        ),
        headerClassName: "adapt-data wordwrap",
        accessor: "adaptUniqueInteractionDays",
        show: showColumns["Adapt Unique Interaction Days"],
        getProps: (state, rowInfo, column) => {
          return {
            style: {
              background: "rgb(171, 247, 177, .5)",
            },
          };
        },
        filterMethod: (filter, rows) =>
          numMatch(rows, filter.value, {
            keys: ["adaptUniqueInteractionDays"],
          }),
        filterAll: true,
      },
      {
        Header: <Tip content="Unique Assignments">Unique Assignments</Tip>,
        headerClassName: "adapt-data wordwrap",
        accessor: "adaptUniqueAssignments",
        show: showColumns["Adapt Unique Assignments"],
        getProps: (state, rowInfo, column) => {
          return {
            style: {
              background: "rgb(171, 247, 177, .5)",
            },
          };
        },
        filterMethod: (filter, rows) =>
          numMatch(rows, filter.value, { keys: ["adaptUniqueAssignments"] }),
        filterAll: true,
      },
      {
        Header: (
          <Tip content="Most Recent Page Load">Most Recent Page Load</Tip>
        ),
        headerClassName: "adapt-data wordwrap",
        accessor: "mostRecentAdaptLoad",
        show: showColumns["Adapt Most Recent Page Load"],
        //Cell: val => formatDate(val, "adapt"),
        getProps: (state, rowInfo, column) => {
          return {
            style: {
              background: "rgb(171, 247, 177, .5)",
            },
          };
        },
        filterMethod: (filter, rows) =>
          matchSorter(rows, filter.value, { keys: ["mostRecentAdaptLoad"] }),
        filterAll: true,
      },
      {
        Header: <Tip content="Average Percent Per Assignment">Average Percent Per Assignment</Tip>,
        headerClassName: "adapt-data wordwrap",
        accessor: "adaptAvgPercentScore",
        show: true,
        //Cell: val => formatDate(val, "adapt"),
        getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        background: 'rgb(171, 247, 177, .5)'
                    },
                };
            },
        filterMethod: (filter, rows) =>
          matchSorter(rows, filter.value, { keys: ["adaptAvgPercentScore"] }),
        filterAll: true
      },
      {
        Header: <Tip content="Average Attempts Per Assignment">Average Attempts Per Assignment</Tip>,
        headerClassName: "adapt-data wordwrap",
        accessor: "adaptAvgAttempts",
        show: true,
        //Cell: val => formatDate(val, "adapt"),
        getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        background: 'rgb(171, 247, 177, .5)'
                    },
                };
            },
        filterMethod: (filter, rows) =>
          matchSorter(rows, filter.value, { keys: ["adaptAvgAttempts"] }),
        filterAll: true
      }
    );
  }

  return (
    <>
      <ReactTable
        data={showData}
        ref={(r) => {
          reactTable = r;
        }}
        onFilteredChange={() => {
          setExportData(reactTable.getResolvedState().sortedData);
        }}
        columns={columns}
        style={{ textAlign: "center", overflow: "hidden" }}
        minRows={1}
        defaultPageSize={pageLength}
        gridArea="table"
        filterable={true}
        getTrProps={getTrProps}
      ></ReactTable>
      <div>
        <CSVLink data={exportData} headers={headers} filename={filename}>
          <Button secondary icon={<Download />} />
        </CSVLink>
      </div>
    </>
  );
}
