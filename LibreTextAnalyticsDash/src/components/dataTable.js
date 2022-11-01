import React from "react";
import { Text } from "grommet";
import { Download } from "grommet-icons";
import { matchSorter } from "match-sorter";
import { CSVLink } from "react-csv";
import DataToCSV from "./dataToCSV.js";
import ReactTable from "react-table-6";
import "../css/index.css";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import moment from "moment";
import {
  addStudentLibreTextColumns,
  addStudentAdaptColumns,
  addPageColumns,
} from "../functions/dataTableFunctions.js";

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
  accessibilityMode,
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
            tabIndex: 0,
          },
        };
      }
      return {};
    };
  }

  //cannot use the resolveData attribute of ReactTable because the reformatted data needs to be exported
  var showData = JSON.parse(JSON.stringify(data));
  if (showNonStudents === false) {
    showData = showData.filter((o) => o.isEnrolled);
  }
  var elements = [];
  if (ltCourse && !adaptCourse) {
    elements = ["objectCount", "viewCount", "max", "dateCount", "timeStudied"];
  } else if (ltCourse && adaptCourse) {
    elements = [
      "objectCount",
      "viewCount",
      "max",
      "dateCount",
      "timeStudied",
      "adaptUniqueInteractionDays",
      "adaptUniqueAssignments",
      "mostRecentAdaptLoad",
      "adaptAvgPercentScore",
      "adaptAvgAttempts",
      "percentile",
    ];
  } else {
    elements = [
      "adaptUniqueInteractionDays",
      "adaptUniqueAssignments",
      "mostRecentAdaptLoad",
      "adaptAvgPercentScore",
      "adaptAvgAttempts",
      "percentile",
    ];
  }
  showData.forEach((val, index) => {
    if (Object.keys(val).includes("max")) {
      showData[index]["max"] = moment(val["max"])
        .add(1, "days")
        .format("MMM Do YYYY");
    } else if (!Object.keys(val).includes("max")) {
      showData[index]["max"] = "N/A";
    }
    if (val["mostRecentAdaptLoad"]) {
      showData[index]["mostRecentAdaptLoad"] = moment(
        val["mostRecentAdaptLoad"]
      )
        .add(1, "days")
        .format("MMM Do YYYY");
    }
    if (val.isEnrolled && !val.hasData) {
      elements.map(e => showData[index][e] = '-')
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
      return (
        <a tabIndex={0} href="/#">
          {pageInfo.original[idAccessor]}
        </a>
      );
    } else if (tab === "student" && !hasData) {
      return (
        <a tabIndex={0} href="/#">
          <Text weight="bold">{pageInfo.original[idAccessor]}</Text>
        </a>
      );
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
          <a tabIndex={0} href="#name-table" id="table">
            {<Text>Name</Text>}
          </a>
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
    addStudentLibreTextColumns(
      columns,
      headers,
      column2Label,
      column3Label,
      showColumns,
      numMatch
    );
  } else if (tab === "page") {
    addPageColumns(columns, headers, column2Label, numMatch);
  }

  if (tab === "student" && (hasAdapt || adaptCourse)) {
    addStudentAdaptColumns(columns, headers, ltCourse, showColumns, numMatch);
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
        <DataToCSV
          data={exportData}
          headers={headers}
          filename={filename}
          accessibilityMode={accessibilityMode}
        />
      </div>
    </>
  );
}
