import Tippy from "@tippyjs/react";
import { Text } from "grommet";
import { matchSorter } from "match-sorter";
import moment from "moment";

export function addStudentLibreTextColumns(
  columns,
  headers,
  column2Label,
  column3Label,
  showColumns,
  numMatch
) {
  //headers.splice(1, 0, { label: "Is Enrolled", key: "enrolled" });
  headers.push(
    { label: "LT " + column3Label, key: "viewCount" },
    { label: "LT Most Recent Page Load", key: "max" },
    { label: "LT Unique Interaction Days", key: "dateCount" },
    { label: "LT Hours on Site", key: "timeStudied" }
  );
  //inserting into the columns attribute to make "LibreText" and "ADAPT" headers above the other attributes
  columns.push({
    Header: (props) => (
      <a href="#" onClick={preventRedirect} tabIndex={0}>
        {"LibreText"}
      </a>
    ),
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
          <a href="#" onClick={preventRedirect} tabIndex={0} aria-label={column2Label}>
            {<Text>{column2Label}</Text>}
          </a>
        </Tippy>
      ),
      headerClassName: "lt-data wordwrap",
      accessor: "objectCount",
      show: showColumns["LT " + column2Label],
      getProps: (state, rowInfo, column) => {
        return {
          style: {
            background: "rgb(255, 255, 158, .5)",
            tabindex: "0",
          },
        };
      },
      Cell: (val) => (
        <a href="#" onClick={preventRedirect} tabIndex={0} a11ytitle={"LT " + column2Label}>
          {val.original["objectCount"]}
        </a>
      ),
      filterMethod: (filter, rows) =>
        numMatch(rows, filter.value, { keys: ["objectCount"] }),
      filterAll: true,
    },
    {
      Header: (
        <Tippy content={column3Label}>
          <a href="#" onClick={preventRedirect} tabIndex={0}>
            {<Text>{column3Label}</Text>}
          </a>
        </Tippy>
      ),
      headerClassName: "lt-data wordwrap",
      accessor: "viewCount",
      show: showColumns["LT " + column3Label],
      getProps: (state, rowInfo, column) => {
        return {
          style: {
            background: "rgb(255, 255, 158, .5)",
            tabindex: "0",
          },
        };
      },
      Cell: (val) => (
        <a href="#" onClick={preventRedirect} tabIndex={0} a11ytitle={"LT " + column3Label}>
          {val.original["viewCount"]}
        </a>
      ),
      filterMethod: (filter, rows) =>
        numMatch(rows, filter.value, { keys: ["viewCount"] }),
      filterAll: true,
    },
    {
      Header: (
        <Tippy content="Most Recent Page Load">
          <a href="#" onClick={preventRedirect} tabIndex={0}>
            {<Text>Most Recent Page Load</Text>}
          </a>
        </Tippy>
      ),
      headerClassName: "lt-data wordwrap",
      accessor: "max",
      show: showColumns["LT Most Recent Page Load"],
      getProps: (state, rowInfo, column) => {
        return {
          style: {
            background: "rgb(255, 255, 158, .5)",
            tabindex: "0",
          },
        };
      },
      Cell: (val) => (
        <a href="#" onClick={preventRedirect} tabIndex={0} a11ytitle="LT Most Recent Page Load">
          {val.original.max}
        </a>
      ),
      filterMethod: (filter, rows) =>
        matchSorter(rows, filter.value, { keys: ["max"] }),
      filterAll: true,
    },
    {
      Header: (
        <Tippy content="Unique Interaction Days">
          <a href="#" onClick={preventRedirect} tabIndex={0}>
            {<Text>Unique Interaction Days</Text>}
          </a>
        </Tippy>
      ),
      headerClassName: "lt-data wordwrap",
      accessor: "dateCount",
      show: showColumns["LT Unique Interaction Days"],
      getProps: (state, rowInfo, column) => {
        return {
          style: {
            background: "rgb(255, 255, 158, .5)",
            tabindex: "0",
          },
        };
      },
      Cell: (val) => (
        <a href="#" onClick={preventRedirect} tabIndex={0} a11ytitle="LT Unique Interaction Days">
          {val.original["dateCount"]}
        </a>
      ),
      filterMethod: (filter, rows) =>
        numMatch(rows, filter.value, { keys: ["dateCount"] }),
      filterAll: true,
    },
    {
      Header: (
        <Tippy content="Hours on Site">
          <a href="#" onClick={preventRedirect} tabIndex={0}>
            {<Text>Hours on Site</Text>}
          </a>
        </Tippy>
      ),
      headerClassName: "lt-data wordwrap",
      accessor: "timeStudied",
      show: showColumns["LT Hours on Site"],
      getProps: (state, rowInfo, column) => {
        return {
          style: {
            background: "rgb(255, 255, 158, .5)",
            tabindex: "0",
          },
        };
      },
      Cell: (val) => (
        <a href="#" onClick={preventRedirect} tabIndex={0} a11ytitle="LT Hours on Site">
          {val.original["timeStudied"]}
        </a>
      ),
      filterMethod: (filter, rows) =>
        numMatch(rows, filter.value, { keys: ["timeStudied"] }),
      filterAll: true,
    }
  );
}

export function addStudentAdaptColumns(
  columns,
  headers,
  ltCourse,
  showColumns,
  numMatch
) {
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
    },
    { label: "ADAPT Class Percentile", key: "percentile" }
  );
  columns.push({
    Header: (props) => (
      <a href="#" onClick={preventRedirect} tabIndex={0}>
        {"ADAPT"}
      </a>
    ),
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
          <a href="#" onClick={preventRedirect} tabIndex={0}>
            {<Text>Unique Interaction Days</Text>}
          </a>
        </Tippy>
      ),
      headerClassName: "adapt-data wordwrap",
      accessor: "adaptUniqueInteractionDays",
      show: showColumns["ADAPT Unique Interaction Days"],
      getProps: (state, rowInfo, column) => {
        return {
          style: {
            background: "rgb(171, 247, 177, .5)",
            tabindex: "0",
          },
        };
      },
      Cell: (val) => (
        <a href="#" onClick={preventRedirect} tabIndex={0} a11ytitle="Adapt Unique Interation Days">
          {val.original["adaptUniqueInteractionDays"]}
        </a>
      ),
      filterMethod: (filter, rows) =>
        numMatch(rows, filter.value, {
          keys: ["adaptUniqueInteractionDays"],
        }),
      filterAll: true,
    },
    {
      Header: (
        <Tippy content="Unique Assignments">
          <a href="#" onClick={preventRedirect} tabIndex={0}>
            {<Text>Unique Assignments</Text>}
          </a>
        </Tippy>
      ),
      headerClassName: "adapt-data wordwrap",
      accessor: "adaptUniqueAssignments",
      show: showColumns["ADAPT Unique Assignments"],
      getProps: (state, rowInfo, column) => {
        return {
          style: {
            background: "rgb(171, 247, 177, .5)",
            tabindex: "0",
          },
        };
      },
      Cell: (val) => (
        <a href="#" onClick={preventRedirect} tabIndex={0} a11ytitle="Adapt Unique Assignments">
          {val.original["adaptUniqueAssignments"]}
        </a>
      ),
      filterMethod: (filter, rows) =>
        numMatch(rows, filter.value, { keys: ["adaptUniqueAssignments"] }),
      filterAll: true,
    },
    {
      Header: (
        <Tippy content="Most Recent Page Load">
          <a href="#" onClick={preventRedirect} tabIndex={0}>
            {<Text>Most Recent Page Load</Text>}
          </a>
        </Tippy>
      ),
      headerClassName: "adapt-data wordwrap",
      accessor: "mostRecentAdaptLoad",
      show: showColumns["ADAPT Most Recent Page Load"],
      getProps: (state, rowInfo, column) => {
        return {
          style: {
            background: "rgb(171, 247, 177, .5)",
            tabindex: "0",
          },
        };
      },
      Cell: (val) => (
        <a href="#" onClick={preventRedirect} tabIndex={0} a11ytitle="Adapt Most Recent Page Load">
          {val.original.mostRecentAdaptLoad}
        </a>
      ),
      filterMethod: (filter, rows) =>
        matchSorter(rows, filter.value, { keys: ["mostRecentAdaptLoad"] }),
      filterAll: true,
    },
    {
      Header: (
        <Tippy content="Average Percent Per Assignment">
          <a href="#" onClick={preventRedirect} tabIndex={0}>
            {<Text>Average Percent Per Assignment</Text>}
          </a>
        </Tippy>
      ),
      headerClassName: "adapt-data wordwrap",
      accessor: "adaptAvgPercentScore",
      show: showColumns["ADAPT Average Percent Per Assignment"],
      getProps: (state, rowInfo, column) => {
        return {
          style: {
            background: "rgb(171, 247, 177, .5)",
            tabindex: "0",
          },
        };
      },
      Cell: (val) => (
        <a
          href="#" onClick={preventRedirect}
          tabIndex={0}
          a11ytitle="Adapt Average Percent Per Assignment"
        >
          {val.original["adaptAvgPercentScore"]}
        </a>
      ),
      filterMethod: (filter, rows) =>
        matchSorter(rows, filter.value, { keys: ["adaptAvgPercentScore"] }),
      filterAll: true,
    },
    {
      Header: (
        <Tippy content="Average Attempts Per Assignment">
          <a href="#" onClick={preventRedirect} tabIndex={0}>
            {<Text>Average Attempts Per Assignment</Text>}
          </a>
        </Tippy>
      ),
      headerClassName: "adapt-data wordwrap",
      accessor: "adaptAvgAttempts",
      show: showColumns["ADAPT Average Attempts Per Assignment"],
      getProps: (state, rowInfo, column) => {
        return {
          style: {
            background: "rgb(171, 247, 177, .5)",
            tabindex: "0",
          },
        };
      },
      Cell: (val) => (
        <a
          href="#" onClick={preventRedirect}
          tabIndex={0}
          a11ytitle="Adapt Average Attempts Per Assignment"
        >
          {val.original["adaptAvgAttempts"]}
        </a>
      ),
      filterMethod: (filter, rows) =>
        matchSorter(rows, filter.value, { keys: ["adaptAvgAttempts"] }),
      filterAll: true,
    },
    {
      Header: (
        <Tippy content="Class Percentile">
          <a href="#" onClick={preventRedirect} tabIndex={0}>
            {<Text>Class Percentile</Text>}
          </a>
        </Tippy>
      ),
      headerClassName: "adapt-data wordwrap",
      accessor: "percentile",
      show: showColumns["ADAPT Class Percentile"],
      getProps: (state, rowInfo, column) => {
        return {
          style: {
            background: "rgb(171, 247, 177, .5)",
            tabindex: "0",
          },
        };
      },
      Cell: (val) => (
        <a href="#" onClick={preventRedirect} tabIndex={0} a11ytitle="ADAPT Class Percentile">
          {val.original["percentile"]}
        </a>
      ),
      filterMethod: (filter, rows) =>
        matchSorter(rows, filter.value, { keys: ["percentile"] }),
      filterAll: true,
    }
  );
}

export function addPageColumns(columns, headers, column2Label, numMatch) {
  headers.push(
    { label: "Average Page Duration", key: "durationInMinutes" },
    { label: "Average Percent Scrolled", key: "percentAvg" }
  );
  columns.push(
    {
      Header: (
        <Tippy content={column2Label}>
          <a href="#" onClick={preventRedirect} tabIndex={0}>
            {<Text>{column2Label}</Text>}
          </a>
        </Tippy>
      ),
      accessor: "objectCount",
      Cell: (val) => (
        <a href="#" onClick={preventRedirect} tabIndex={0} a11ytitle={column2Label}>
          {val.original["objectCount"]}
        </a>
      ),
      filterMethod: (filter, rows) =>
        numMatch(rows, filter.value, { keys: ["objectCount"] }),
      filterAll: true,
    },
    {
      Header: (
        <Tippy content="Average Page Duration (minutes)">
          <a href="#" onClick={preventRedirect} tabIndex={0}>
            <Text>Average Page Duration (minutes)</Text>
          </a>
        </Tippy>
      ),
      accessor: "durationInMinutes",
      Cell: (val) => (
        <a href="#" onClick={preventRedirect} tabIndex={0} a11ytitle="Average Page Duration in Minutes">
          {val.original["durationInMinutes"]}
        </a>
      ),
      filterMethod: (filter, rows) =>
        numMatch(rows, filter.value, { keys: ["durationInMinutes"] }),
      filterAll: true,
    },
    {
      Header: (
        <Tippy content="Average Percent Scrolled">
          <a href="#" onClick={preventRedirect} tabIndex={0}>
            <Text>Average Percent Scrolled</Text>
          </a>
        </Tippy>
      ),
      accessor: "percentAvg",
      Cell: (val) => (
        <a href="#" onClick={preventRedirect} tabIndex={0} a11ytitle="Average Percent Scrolled">
          {val.original["percentAvg"]}
        </a>
      ),
      filterMethod: (filter, rows) =>
        numMatch(rows, filter.value, { keys: ["percentAvg"] }),
      filterAll: true,
    }
  );
}

function preventRedirect(e) {
  e.preventDefault();
}
