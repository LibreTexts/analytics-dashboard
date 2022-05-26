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
    function formatDate(val) {
      var d = new Date(val.original.max)
      //console.log(d.toString())
      return d.toString()
    }
    //console.log(this.props.data)
    var headers = [
      {label: 'Name', key: "_id"},
      {label: "Unique Pages Accessed", key: 'objectCount'},
      {label: 'Total Page Views', key: 'viewCount'},
      {label: 'Most Recent Page Load', key: 'max'},
      {label: 'Unique Interaction Days', key: 'dateCount'}
    ]
    
    return (
      <>
      <ReactTable
        data={this.props.data}
        columns={
          [
            {Header: "Name", width: 250, accessor: "_id",
                  filterMethod: (filter, rows) =>
                    matchSorter(rows, filter.value, { keys: ["_id"] }),
                  filterAll: true},
            {Header: "Unique Pages Accessed", accessor: "objectCount",
                  filterMethod: (filter, rows) =>
                    matchSorter(rows, filter.value, { keys: ["objectCount"] }),
                  filterAll: true},
            {Header: "Total Page Views", accessor: "viewCount",
                  filterMethod: (filter, rows) =>
                    matchSorter(rows, filter.value, { keys: ["viewCount"] }),
                  filterAll: true},
            {Header: "Most Recent Page Load", accessor: "max", Cell: val => formatDate(val),
                  filterMethod: (filter, rows) =>
                    matchSorter(rows, filter.value, { keys: ["max"] }),
                  filterAll: true},
            {Header: "Unique Interaction Days", accessor: "dateCount",
                  filterMethod: (filter, rows) =>
                    matchSorter(rows, filter.value, { keys: ["dateCount"] }),
                  filterAll: true}
          ]
        }
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
