import React from "react";
import ReactTable from "react-table-6";
import { matchSorter } from "match-sorter";
import { CSVLink } from "react-csv";
import { Button, Text, Tip } from "grommet";
import { Download } from "grommet-icons";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

//make a table from the chart and populate it with data from state.studentData
export default class StudentTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      exportData: 0,
    };
  }

  render() {
    var idAccessor;
    if (this.props.displayMode) {
      idAccessor = "displayModeStudent";
    } else {
      idAccessor = "_id";
    }
    var filename = "student-chart-data.csv";

    function formatDate(val, type) {
      var d;
      if (type === "lt" && val.original.max) {
        d = new Date(val.original.max);
      } else if (type === "adapt" && val.original.mostRecentAdaptLoad) {
        d = new Date(val.original.mostRecentAdaptLoad);
      } else {
        return "";
      }
      var arr = d.toString().split(" ");
      return arr[1] + " " + arr[2] + " " + arr[3];
    }

    var headers = [
      { label: "Name", key: "_id" },
      { label: "LT Unique Pages Accessed", key: "objectCount" },
      { label: "LT Total Page Views", key: "viewCount" },
      { label: "LT Most Recent Page Load", key: "max" },
      { label: "LT Unique Interaction Days", key: "dateCount" },
      { label: "LT Hours on Site", key: "timeStudied" },
    ];

    var columns = [
      {
        Header: "Name",
        width: 250,
        accessor: idAccessor,
        filterMethod: (filter, rows) =>
          matchSorter(rows, filter.value, { keys: [idAccessor] }),
        filterAll: true,
      },
    ];
    if (this.props.ltCourse) {
      columns.push(
        {
          Header: (
            <Tippy content="Unique Pages Accessed">
              <Text>Unique Pages Accessed</Text>
            </Tippy>
          ),
          headerClassName: "lt-data",
          accessor: "objectCount",
          show: this.props.showColumns["LT Unique Pages Accessed"],
          getProps: (state, rowInfo, column) => {
            return {
              style: {
                background: "rgb(255, 255, 158, .5)",
              },
            };
          },
          filterMethod: (filter, rows) =>
            matchSorter(rows, filter.value, { keys: ["objectCount"] }),
          filterAll: true,
        },
        {
          Header: (
            <Tippy content="Total Page Views">
              <Text>Total Page Views</Text>
            </Tippy>
          ),
          headerClassName: "lt-data",
          accessor: "viewCount",
          show: this.props.showColumns["LT Total Page Views"],
          getProps: (state, rowInfo, column) => {
            return {
              style: {
                background: "rgb(255, 255, 158, .5)",
              },
            };
          },
          filterMethod: (filter, rows) =>
            matchSorter(rows, filter.value, { keys: ["viewCount"] }),
          filterAll: true,
        },
        {
          Header: (
            <Tippy content="Most Recent Page Load">
              <Text>Most Recent Page Load</Text>
            </Tippy>
          ),
          headerClassName: "lt-data",
          accessor: "max",
          show: this.props.showColumns["LT Most Recent Page Load"],
          Cell: (val) => formatDate(val, "lt"),
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
            <Tippy content="Unique Interaction Days">
              <Text>Unique Interaction Days</Text>
            </Tippy>
          ),
          headerClassName: "lt-data",
          accessor: "dateCount",
          show: this.props.showColumns["LT Unique Interaction Days"],
          getProps: (state, rowInfo, column) => {
            return {
              style: {
                background: "rgb(255, 255, 158, .5)",
              },
            };
          },
          filterMethod: (filter, rows) =>
            matchSorter(rows, filter.value, { keys: ["dateCount"] }),
          filterAll: true,
        },
        {
          Header: (
            <Tippy content="Hours on Site">
              <Text>Hours on Site</Text>
            </Tippy>
          ),
          headerClassName: "lt-data",
          accessor: "timeStudied",
          show: this.props.showColumns["LT Hours on Site"],
          getProps: (state, rowInfo, column) => {
            return {
              style: {
                background: "rgb(255, 255, 158, .5)",
              },
            };
          },
          filterMethod: (filter, rows) =>
            matchSorter(rows, filter.value, { keys: ["timeStudied"] }),
          filterAll: true,
        }
      );
    }

    if (this.props.hasAdapt) {
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
      columns.push(
        {
          Header: (
            <Tippy content="Unique Interaction Days">
              <Text>Unique Interaction Days</Text>
            </Tippy>
          ),
          headerClassName: "adapt-data",
          accessor: "adaptUniqueInteractionDays",
          show: this.props.showColumns["ADAPT Unique Interaction Days"],
          getProps: (state, rowInfo, column) => {
            return {
              style: {
                background: "rgb(171, 247, 177, .5)",
              },
            };
          },
          filterMethod: (filter, rows) =>
            matchSorter(rows, filter.value, {
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
          headerClassName: "adapt-data",
          accessor: "adaptUniqueAssignments",
          show: this.props.showColumns["ADAPT Unique Assignments"],
          getProps: (state, rowInfo, column) => {
            return {
              style: {
                background: "rgb(171, 247, 177, .5)",
              },
            };
          },
          filterMethod: (filter, rows) =>
            matchSorter(rows, filter.value, {
              keys: ["adaptUniqueAssignments"],
            }),
          filterAll: true,
        },
        {
          Header: (
            <Tippy content="Most Recent Page Load">
              <Text>Most Recent Page Load</Text>
            </Tippy>
          ),
          headerClassName: "adapt-data",
          accessor: "mostRecentAdaptLoad",
          show: this.props.showColumns["ADAPT Most Recent Page Load"],
          Cell: (val) => formatDate(val, "adapt"),
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
          Header: (
            <Tippy content="Average Percent Per Assignment">
              <Text>Average Percent Per Assignment</Text>
            </Tippy>
          ),
          headerClassName: "adapt-data",
          accessor: "adaptAvgPercentScore",
          show: this.props.showColumns["ADAPT Average Percent Per Assignment"],
          getProps: (state, rowInfo, column) => {
            return {
              style: {
                background: "rgb(171, 247, 177, .5)",
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
          headerClassName: "adapt-data",
          accessor: "adaptAvgAttempts",
          show: this.props.showColumns["ADAPT Average Attempts Per Assignment"],
          getProps: (state, rowInfo, column) => {
            return {
              style: {
                background: "rgb(171, 247, 177, .5)",
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
          data={this.props.data}
          columns={columns}
          style={{ textAlign: "center", overflow: "hidden" }}
          defaultPageSize={this.props.hasAdapt && !this.props.ltCourse ? 6 : 8}
          gridArea="table"
          filterable={true}
        ></ReactTable>
        <div>
          <CSVLink data={this.props.data} headers={headers} filename={filename}>
            <Button secondary icon={<Download />} />
          </CSVLink>
        </div>
      </>
    );
  }
}
