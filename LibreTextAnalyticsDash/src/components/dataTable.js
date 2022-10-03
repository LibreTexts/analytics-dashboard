import React from "react";
import { Button, Text, Tip } from "grommet";
import { Download } from "grommet-icons";
import { matchSorter } from "match-sorter";
import { CSVLink } from "react-csv";
import ReactTable from "react-table-6";
import "../css/index.css";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

export default function DataTable({
  tab,
  data,
  hasAdapt,
  showColumns,
  activityFilter,
  showNonStudents,
  ltCourse,
  adaptCourse,
  displayMode,
  student = false,
  disableStudent = false,
}) {
  let reactTable = React.useRef(null);
  let column2Label, column3Label, idAccessor, filename, pageLength;

  if (tab === "student" && !displayMode) {
    column2Label = "Unique Pages Accessed";
    column3Label = "Total Page Views";
    idAccessor = "_id";
    filename = "student-data.csv";
    pageLength = 10;
  } else if (tab === "student" && displayMode) {
    column2Label = "Unique Pages Accessed";
    column3Label = "Total Page Views";
    idAccessor = "displayModeStudent";
    filename = "student-data.csv";
    pageLength = 10;
  } else if (tab === "page") {
    column3Label = "Number of Times Viewed";
    column2Label = "Total Students Who Viewed";
    idAccessor = "pageTitle";
    filename = "page-data.csv";
    pageLength = 10;
  }
  //if a student is chosen on the student tab, they will be moved to
  //the top of the table and highlighted
  var matchFound = 0;
  if (student && tab === "student" && disableStudent) {
    if (!displayMode) {
      var studentFound = data.findIndex((obj) => obj._id === student);
    } else {
      studentFound = data.findIndex(
        (obj) => obj.displayModeStudent === student
      );
    }
    data.splice(0, 0, data[studentFound]);
    data.splice(studentFound + 1, 1);
    matchFound = matchFound + 1;
  }
  //turn the background of students who aren't enrolled gray,
  //and chosen students yellow
  if (tab === "student") {
    var getTrProps = (state, rowInfo, instance) => {
      if (rowInfo) {
        return {
          style: {
            background:
              matchFound === 0
                ? rowInfo.original.isEnrolled
                  ? "white"
                  : "Gainsboro"
                : rowInfo.index > 0 && rowInfo.original.isEnrolled
                ? "white"
                : rowInfo.index === 0
                ? "Yellow"
                : "Gainsboro",
            opacity: rowInfo.original.isEnrolled ? 1 : 0.4,
            tabindex: "0"
          },
        };
      }
      return {};
    };
  }

  var showData = JSON.parse(JSON.stringify(data));
  if (showNonStudents === false) {
    showData = showData.filter((o) => o.isEnrolled);
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
  //need to define this here to get the reformatted data
  const [exportData, setExportData] = React.useState(showData);

  // Takes in a string filter, and filters out the data/rows
  // based on the equality operation
  function numMatch(rows, filter, val) {
    var key = val.keys[0];

    var match = filter.substring(0, 2).replace(/[0-9]/g, "");
    let f;
    if (match === "<=") {
      f = filter.replaceAll("<=", "").trim();
      f = parseInt(f);
      return rows.filter((row) => row[key] <= f);
    } else if (match.trim() === "<") {
      f = filter.replaceAll("<", "").trim();
      f = parseInt(f);
      return rows.filter((row) => row[key] < f);
    } else if (match.trim() === ">") {
      f = filter.replaceAll(">", "").trim();
      f = parseInt(f);
      return rows.filter((row) => row[key] > f);
    } else if (match === ">=") {
      f = filter.replaceAll(">=", "").trim();
      f = parseInt(f);
      return rows.filter((row) => row[key] >= f);
    } else if (parseInt(filter) || match.trim() === "=") {
      f = filter.replaceAll("=", "").trim();
      f = parseInt(f);
      return rows.filter((row) => row[key] === f);
    } else {
      return [];
    }
  }

  //if it's the student tab, names are displayed
  //if it's the page tab, the page name and link to that page are displayed
  function createLink(pageInfo, idAccessor) {
    var title = pageInfo.original.pageTitle;
    var hasData = pageInfo.original.hasData;
    var url = pageInfo.original.pageURL;
    var tab = "page";

    if (!url || url.length === 0) {
      tab = "student";
    }
    if (tab === "page") {
      return (
        <a href={url} target="_blank" rel="noreferrer">
          {title}
        </a>
      );
    } else if (tab === "student" && hasData) {
      return pageInfo.original[idAccessor];
    } else if (tab === "student" && !hasData) {
      return <Text weight="bold">{pageInfo.original[idAccessor]}</Text>;
    }
  }

  function formatCells(idAccessor) {

  }

  function formatDate(val, type) {
    if (val) {
      var d = new Date(val);
      var arr = d.toString().split(" ");
      return arr[1] + " " + arr[2] + " " + arr[3];
    } else {
      return "";
    }
  }

  // used for the csv export file
  var headers = [
    { label: "Name", key: idAccessor },
    { label: "LT " + column2Label, key: "objectCount" },
  ];
  // used to render the react table
  var columns = [
    {
      Header: (
        <Tippy content="Name" arrow={true}>
          <Text>Name</Text>
        </Tippy>
      ),
      width: 250,
      accessor: idAccessor,
      Cell: (val) => createLink(val, idAccessor),
      filterMethod: (filter, rows) =>
        matchSorter(rows, filter.value, { keys: [idAccessor] }),
      filterAll: true,
    },
  ];

  //use different headers and accessors for the student table and page table
  //only need the adapt data for the student table; no page tab for adapt-only courses
  if (tab === "student" && ltCourse) {
    headers.splice(1, 0, { label: "Is Enrolled", key: "enrolled" });
    headers.push(
      { label: "LT " + column3Label, key: "viewCount" },
      { label: "LT Most Recent Page Load", key: "max" },
      { label: "LT Unique Interaction Days", key: "dateCount" },
      { label: "LT Hours on Site", key: "timeStudied" }
    );
    //inserting into the columns attribute to make "LibreText" and "ADAPT" headers above the other attributes
    columns.push({
      Header: "LibreText",
      getHeaderProps: (state, rowInfo, column) => {
        return {
          style: {
            background: "rgb(255, 255, 158)",
          },
        };
      },
      columns: [],
    });

    columns[1].columns.push(
      {
        Header: (
          <Tippy content={column2Label}>
            <Text>{column2Label}</Text>
          </Tippy>
        ),
        headerClassName: "lt-data wordwrap",
        accessor: "objectCount",
        show: showColumns["LT " + column2Label],
        getProps: (state, rowInfo, column) => {
          return {
            style: {
              background: "rgb(255, 255, 158, .5)",
              tabindex: "0"
            },
          };
        },
        filterMethod: (filter, rows) =>
          numMatch(rows, filter.value, { keys: ["objectCount"] }),
        filterAll: true,
      },
      {
        Header: (
          <Tippy content={column3Label}>
            <Text>{column3Label}</Text>
          </Tippy>
        ),
        headerClassName: "lt-data wordwrap",
        accessor: "viewCount",
        show: showColumns["LT " + column3Label],
        getProps: (state, rowInfo, column) => {
          return {
            style: {
              background: "rgb(255, 255, 158, .5)",
              tabindex: "0"
            },
          };
        },
        filterMethod: (filter, rows) =>
          numMatch(rows, filter.value, { keys: ["viewCount"] }),
        filterAll: true,
      },
      {
        Header: (
          <Tippy content="Most Recent Page Load">
            <Text>Most Recent Page Load</Text>
          </Tippy>
        ),
        headerClassName: "lt-data wordwrap",
        accessor: "max",
        show: showColumns["LT Most Recent Page Load"],
        getProps: (state, rowInfo, column) => {
          return {
            style: {
              background: "rgb(255, 255, 158, .5)",
              tabindex: "0"
            },
          };
        },
        filterMethod: (filter, rows) =>
          matchSorter(rows, filter.value, { keys: ["max"] }),
        filterAll: true,
      },
      {
        Header: (
          <Tippy content="Unique Interaction Days">
            <Text>Unique Interaction Days</Text>
          </Tippy>
        ),
        headerClassName: "lt-data wordwrap",
        accessor: "dateCount",
        show: showColumns["LT Unique Interaction Days"],
        getProps: (state, rowInfo, column) => {
          return {
            style: {
              background: "rgb(255, 255, 158, .5)",
              tabindex: "0"
            },
          };
        },
        filterMethod: (filter, rows) =>
          numMatch(rows, filter.value, { keys: ["dateCount"] }),
        filterAll: true,
      },
      {
        Header: (
          <Tippy content="Hours on Site">
            <Text>Hours on Site</Text>
          </Tippy>
        ),
        headerClassName: "lt-data wordwrap",
        accessor: "timeStudied",
        show: showColumns["LT Hours on Site"],
        getProps: (state, rowInfo, column) => {
          return {
            style: {
              background: "rgb(255, 255, 158, .5)",
              tabindex: "0"
            },
          };
        },
        filterMethod: (filter, rows) =>
          numMatch(rows, filter.value, { keys: ["timeStudied"] }),
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
        label: "ADAPT Unique Interaction Days",
        key: "adaptUniqueInteractionDays",
      },
      { label: "ADAPT Unique Assignments", key: "adaptUniqueAssignments" },
      { label: "ADAPT Most Recent Page Load", key: "mostRecentAdaptLoad" },
      {
        label: "ADAPT Average Percent Per Assignment",
        key: "adaptAvgPercentScore",
      },
      {
        label: "ADAPT Average Attempts Per Assignment",
        key: "adaptAvgAttempts",
      }
    );
    columns.push({
      Header: "ADAPT",
      getHeaderProps: (state, rowInfo, column) => {
        return {
          style: {
            background: "rgb(171, 247, 177)",
          },
        };
      },
      columns: [],
    });
    //handling the index in case it is an adapt-only course
    columns[ltCourse ? 2 : 1].columns.push(
      {
        Header: (
          <Tippy content="Unique Interaction Days">
            <Text>Unique Interaction Days</Text>
          </Tippy>
        ),
        headerClassName: "adapt-data wordwrap",
        accessor: "adaptUniqueInteractionDays",
        show: showColumns["ADAPT Unique Interaction Days"],
        getProps: (state, rowInfo, column) => {
          return {
            style: {
              background: "rgb(171, 247, 177, .5)",
              tabindex: "0"
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
        Header: (
          <Tippy content="Unique Assignments">
            <Text>Unique Assignments</Text>
          </Tippy>
        ),
        headerClassName: "adapt-data wordwrap",
        accessor: "adaptUniqueAssignments",
        show: showColumns["ADAPT Unique Assignments"],
        getProps: (state, rowInfo, column) => {
          return {
            style: {
              background: "rgb(171, 247, 177, .5)",
              tabindex: "0"
            },
          };
        },
        filterMethod: (filter, rows) =>
          numMatch(rows, filter.value, { keys: ["adaptUniqueAssignments"] }),
        filterAll: true,
      },
      {
        Header: (
          <Tippy content="Most Recent Page Load">
            <Text>Most Recent Page Load</Text>
          </Tippy>
        ),
        headerClassName: "adapt-data wordwrap",
        accessor: "mostRecentAdaptLoad",
        show: showColumns["ADAPT Most Recent Page Load"],
        getProps: (state, rowInfo, column) => {
          return {
            style: {
              background: "rgb(171, 247, 177, .5)",
              tabindex: "0"
            },
          };
        },
        filterMethod: (filter, rows) =>
          matchSorter(rows, filter.value, { keys: ["mostRecentAdaptLoad"] }),
        filterAll: true,
      },
      {
        Header: (
          <Tippy content="Average Percent Per Assignment">
            <Text>Average Percent Per Assignment</Text>
          </Tippy>
        ),
        headerClassName: "adapt-data wordwrap",
        accessor: "adaptAvgPercentScore",
        show: showColumns["ADAPT Average Percent Per Assignment"],
        getProps: (state, rowInfo, column) => {
          return {
            style: {
              background: "rgb(171, 247, 177, .5)",
              tabindex: "0"
            },
          };
        },
        filterMethod: (filter, rows) =>
          matchSorter(rows, filter.value, { keys: ["adaptAvgPercentScore"] }),
        filterAll: true,
      },
      {
        Header: (
          <Tippy content="Average Attempts Per Assignment">
            <Text>Average Attempts Per Assignment</Text>
          </Tippy>
        ),
        headerClassName: "adapt-data wordwrap",
        accessor: "adaptAvgAttempts",
        show: showColumns["ADAPT Average Attempts Per Assignment"],
        getProps: (state, rowInfo, column) => {
          return {
            style: {
              background: "rgb(171, 247, 177, .5)",
              tabindex: "0"
            },
          };
        },
        filterMethod: (filter, rows) =>
          matchSorter(rows, filter.value, { keys: ["adaptAvgAttempts"] }),
        filterAll: true,
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
        pageSizeOptions={[10, 25, 50]}
      ></ReactTable>
      <div>
        <CSVLink data={exportData} headers={headers} filename={filename} style={{marginLeft: "small"}}>
          <Download />
        </CSVLink>
      </div>
    </>
  );
}
