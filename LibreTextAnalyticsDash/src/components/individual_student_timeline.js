//out of use: a gantt chart for showing student activity on a page
import React from "react";
import { Chart } from "react-google-charts";
import {
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Area,
  CartesianGrid,
  Bar,
  Line,
  Rectangle,
  ReferenceDot,
} from "recharts";
import ReactTable from "react-table-6";
import * as d3 from "d3";
import moment from "moment";
import { Axis, axisPropsFromTickScale, TOP, BOTTOM } from "react-d3-axis";

export default class IndividualTimeline extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    if (this.props.tab === "student") {
      var name = "Page";
      var idAccessor = "pageTitle";
    } else if (this.props.tab === "page") {
      var name = "Student";
      var idAccessor = "_id";
    }
    let i = 1;
    function getDate(date) {
      return new Date(date);
    }
    function getInit(dates) {
      dates.sort((a, b) => new Date(a) - new Date(b));
      return dates[0];
    }
    function getLast(dates) {
      dates.sort((a, b) => new Date(b) - new Date(a));
      return dates[0];
    }

    function renderRect(currentRects, start, end, init, final) {
      var timeScale = d3.scaleTime().domain([init, final]).range([0, 625]);
      i = i + 1;
      var startDate = getDate(start);
      var endDate = getDate(end);
      var duration = Math.ceil(timeScale(endDate) - timeScale(startDate));
      var showStart = new Date(start).toString();
      var showEnd = new Date(end).toString();
      var offset = 10;

      if (duration === 0) {
        duration = 1;
      }
      if (currentRects !== [] && currentRects.length > 1) {
        var firstInGroup = currentRects[currentRects.length - 1];
      } else {
        var firstInGroup = null;
      }
      if (
        firstInGroup !== null &&
        firstInGroup.props.x + firstInGroup.props.width >= timeScale(startDate)
      ) {
        if (
          currentRects[currentRects.length - 1].props.children.props.children
            .length > 4
        ) {
          var show =
            currentRects[currentRects.length - 1].props.children.props
              .children[5];
          var views =
            currentRects[currentRects.length - 1].props.children.props
              .children[1];
        } else {
          var show =
            currentRects[currentRects.length - 1].props.children.props
              .children[1];
          var views = 1;
        }
        views += 1;
        currentRects[currentRects.length - 1] = (
          <rect
            height={15}
            width={firstInGroup.props.width + duration}
            x={firstInGroup.props.x}
            y={0}
          >
            <title>
              Shows {views} views:{"\n"}From {show}to {showEnd}
            </title>
          </rect>
        );
      } else {
        currentRects.push(
          <rect height={15} width={duration} x={timeScale(startDate)} y={0}>
            <title>
              Start: {showStart + "\n"} End: {showEnd}
            </title>
          </rect>
        );
      }
      return currentRects;
    }

    function multiplePages(val, earliest, latest, data) {
      var init = new Date(earliest);
      var final = new Date(latest);
      var allTimes = [];

      val.forEach((dateRange, n) => {
        //allTimes.push(renderRect(dateRange[0], dateRange[1], init, final))
        allTimes = renderRect(
          allTimes,
          dateRange[0],
          dateRange[1],
          init,
          final
        );
      });
      return allTimes;
    }

    function renderAxis(init, final) {
      var timeScale = d3
        .scaleTime()
        .domain([new Date(init), new Date(final)])
        .range([0, 625]);

      return (
        <Axis
          {...axisPropsFromTickScale(timeScale, 10)}
          style={{ orient: BOTTOM }}
        />
      );
    }

    function createLink(pageInfo) {
      //console.log(pageInfo)
      var title = pageInfo.original.pageTitle;
      var url = pageInfo.original.pageURL;
      var tab = "student";
      if (url === undefined) {
        tab = "page";
      }
      //console.log(url)
      //return url
      if (tab === "student") {
        return (
          <a href={url} target="_blank">
            {title}
          </a>
        );
      } else if (tab === "page") {
        return pageInfo.original._id;
      }
    }

    return (
      <ReactTable
        data={this.props.data}
        columns={[
          {
            Header: name,
            accessor: idAccessor,
            maxWidth: 580,
            Cell: (val) => <div>{createLink(val)}</div>,
            flexGrow: 1,
          },
          {
            Header: (
              <svg width="100%" height={25}>
                {renderAxis(this.props.earliest, this.props.latest)}
              </svg>
            ),
            id: i,
            accessor: "dateRange",
            Cell: (val) => (
              <svg width="100%" height={15} preserveAspectRatio="none">
                {multiplePages(
                  val.value,
                  this.props.earliest,
                  this.props.latest,
                  this.props.data
                )}
              </svg>
            ),
          },
        ]}
        style={{ overflow: "scroll" }}
        width="100%"
        defaultPageSize={this.props.data.length}
        pageSize={this.props.data.length}
        minRows={this.props.data.length}
        responsive={true}
      />
    );
  }
}
