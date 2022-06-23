import React from 'react';
import ReactTable from 'react-table-6';
import {matchSorter} from 'match-sorter';
import { CSVLink, CSVDownload } from "react-csv";
import {Button} from "grommet";
import {Download} from "grommet-icons"

export default class StudentTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      exportData: 0,
    };
  }
  render() {
    //const [exportData, setExportData] = useState(this.props.data)
    //console.log(this.props.data)
    var filename = "student-chart-data.csv"

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
    //console.log(this.props.data)
    var headers = [
      {label: 'Name', key: "_id"},
      {label: "LT Unique Pages Accessed", key: 'objectCount'},
      {label: 'LT Total Page Views', key: 'viewCount'},
      {label: 'LT Most Recent Page Load', key: 'max'},
      {label: 'LT Unique Interaction Days', key: 'dateCount'}
    ]

    var columns = [
      {
        Header: "Name",
        width: 250,
        accessor: "_id",
        filterMethod: (filter, rows) =>
          matchSorter(rows, filter.value, { keys: ["_id"] }),
        filterAll: true
      },
      {
        Header: "Unique Pages Accessed",
        headerClassName: "lt-data",
        accessor: "objectCount",
        show: this.props.showColumns['LT Unique Pages Accessed'],
        getProps: (state, rowInfo, column) => {
                      return {
                          style: {
                              background: 'rgb(255, 255, 158, .5)',
                          },
                      };
                  },
        filterMethod: (filter, rows) =>
          matchSorter(rows, filter.value, { keys: ["objectCount"] }),
        filterAll: true
      },
      {
        Header: "Total Page Views",
        headerClassName: "lt-data",
        accessor: "viewCount",
        show: this.props.showColumns['LT Total Page Views'],
        getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        background: 'rgb(255, 255, 158, .5)',
                    },
                };
            },
        filterMethod: (filter, rows) =>
          matchSorter(rows, filter.value, { keys: ["viewCount"] }),
        filterAll: true
      },
      {
        Header: "Most Recent Page Load",
        headerClassName: "lt-data",
        accessor: "max",
        show: this.props.showColumns['LT Most Recent Page Load'],
        Cell: val => formatDate(val, "lt"),
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
        Header: "Unique Interaction Days",
        headerClassName: "lt-data",
        accessor: "dateCount",
        show: this.props.showColumns['LT Unique Interaction Days'],
        getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        background: 'rgb(255, 255, 158, .5)',
                    },
                };
            },
        filterMethod: (filter, rows) =>
          matchSorter(rows, filter.value, { keys: ["dateCount"] }),
        filterAll: true
      }
    ]

    if (this.props.hasAdapt) {
      headers.push(
        {label: 'Adapt Unique Interaction Days', key: 'adaptUniqueInteractionDays'},
        {label: 'Adapt Unique Assignments', key: 'adaptUniqueAssignments'},
        {label: 'Adapt Most Recent Page Load', key: 'mostRecentAdaptLoad'}
      )
      columns.push(
        {
          Header: "Unique Interaction Days",
          headerClassName: "adapt-data",
          accessor: "adaptUniqueInteractionDays",
          show: this.props.showColumns['Adapt Unique Interaction Days'],
          getProps: (state, rowInfo, column) => {
                  return {
                      style: {
                          background: 'rgb(171, 247, 177, .5)',
                      },
                  };
              },
          filterMethod: (filter, rows) =>
            matchSorter(rows, filter.value, { keys: ["adaptUniqueInteractionDays"] }),
          filterAll: true
        },
        {
          Header: "Unique Assignments",
          headerClassName: "adapt-data",
          accessor: "adaptUniqueAssignments",
          show: this.props.showColumns['Adapt Unique Assignments'],
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
        {
          Header: "Most Recent Page Load",
          headerClassName: "adapt-data",
          accessor: "mostRecentAdaptLoad",
          show: this.props.showColumns['Adapt Most Recent Page Load'],
          Cell: val => formatDate(val, "adapt"),
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
        }
      )
    }

    return (
      <>
      <ReactTable
        data={this.props.data}
        columns={columns}
        style={{textAlign: 'center', overflow: 'hidden'}}
        defaultPageSize={5}
        gridArea="table"
        filterable={true}
      >
      </ReactTable>
      <div>
        <CSVLink data={this.props.data} headers={headers} filename={filename}>
          <Button secondary icon={<Download/>} />
        </CSVLink>
      </div>
      </>
    )
  }
}
