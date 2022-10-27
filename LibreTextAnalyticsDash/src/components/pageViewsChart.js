import React from "react";
import { DefaultTooltipContent } from "recharts/lib/component/DefaultTooltipContent";
import {
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Label,
  ResponsiveContainer,
} from "recharts";
import moment from "moment";
import BasicTable from "./basicTable.js";

//chart to show the aggregate total number of page views by date for libretext pages
export default class PageViewsChart extends React.Component {
  render() {
    var height = 350;
    if (this.props.height) {
      height = this.props.height;
    }
    //handling different labels for different chart, this chart is used multiple times
    var type = this.props.type;
    var label = "Total Views on All Pages";
    var aspect = window.innerWidth/500;
    if (type === "individual") {
      label = "Total Views";
    }
    if (type === "individualAssignment" || type === "individualStudent") {
      label = "Total Submissions on All Assignments";
    }

    //connect the individual data to the aggregate
    this.props.data.forEach((d, index) => {
      if (this.props.individualData) {
        var match = this.props.individualData.find(
          (o) => o["dateString"] === d["dateString"]
        );
        if (match) {
          d["indivCount"] = match["count"];
          d["due"] = match["due"];
        } else {
          d["indivCount"] = 0;
          d["due"] = null;
        }
      }
    });
    this.props.data.forEach((d, index) => {
      this.props.data[index]['formattedDate'] = moment(d._id)
        .add(1, "days")
        .format("MMM Do YYYY")
    })

    //custom tooltip that checks for the type of chart and for the individual data
    const CustomTooltip = (props) => {
      if (props.payload[0] != null) {
        const newPayload = [
          {
            name: "Date",
            value: moment(props.payload[0].payload._id)
              .add(1, "days")
              .format("MMM Do YYYY"),
          },
          {
            name: label,
            value: props.payload[0].payload.count,
          },
        ];
        if (this.props.individualData && type !== "individualAssignment" && type !== "individualStudent") {
          var pageData = [
            {
              name: this.props.type === "aggregate" ? "Page" : "Student",
              value:
                this.props.type === "aggregate"
                  ? this.props.page
                  : this.props.student,
            },
            {
              name: "Individual Page Views",
              value: props.payload[0].payload.indivCount,
            },
          ];
          newPayload.splice(2, 0, ...pageData);
        } else if (
          this.props.individualData &&
          type === "individualAssignment"
        ) {
          var indivInfo = [
            {
              name: "Individual Assignment Submissions",
              value: props.payload[0].payload.indivCount,
            },
            {
              name: "Due Date",
              value: props.payload[0].payload.due
                ? moment(props.payload[0].payload.due).format("MMM Do YYYY")
                : "N/A",
            },
          ];
          newPayload.splice(2, 0, ...indivInfo);
        } else if (this.props.individualData && type === "individualStudent") {
          var indivInfo = [
            {
              name: "Individual Student Submissions",
              value: props.payload[0].payload.indivCount,
            },
          ];
          newPayload.splice(2, 0, ...indivInfo);
        }
        return <DefaultTooltipContent payload={newPayload} />;
      }
      return <DefaultTooltipContent {...props} />;
    };
    var tableColumns = {"Date": "formattedDate", "Total Views On All Pages": "count"}
    if (this.props.individualData && type === "individualAssignment") {
      tableColumns["Total Submissions by Assignment"] = "indivCount"
    } else if (this.props.individualData && type === "individualStudent") {
      tableColumns["Total Submissions by Student"] = "indivCount"
    } else if (this.props.individualData && type !== "individualAssignment") {
      tableColumns["Total Views by Page"] = "indivCount"
    }

    return (
      <>
      {!this.props.accessibilityMode &&
      <ResponsiveContainer width="97%" aspect={aspect}>
        <BarChart
          width={500}
          height={height}
          margin={{ right: 20, bottom: 80, left: 30 }}
          data={this.props.data}
          barGap={0}
          barCategoryGap="15%"
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="dateString"
            interval="preserveStartEnd"
            padding={{ right: 20 }}
            minTickGap={10}
            angle={45}
            tickMargin={25}
          >
            <Label
              value={"Date (By " + this.props.binLabel + ")"}
              position="bottom"
              dy={50}
            />
          </XAxis>
          <YAxis dataKey={this.props.yaxis} yAxisId="left" stroke="#0047BA">
            <Label
              value={label}
              position="insideBottomLeft"
              angle="-90"
              style={{ fill: "#0047BA" }}
            />
          </YAxis>
          {this.props.individualData && (
            <YAxis
              dataKey="indivCount"
              yAxisId="right"
              orientation="right"
              stroke="#F93549"
            >
              <Label
                value={
                  type === "individualAssignment"
                    ? "Total Submissions on Individual Assignment"
                    : type === "individualStudent"
                    ? "Total Submissions by Individual Student"
                    : "Total Views on Individual Page"
                }
                position="insideBottomRight"
                angle="90"
                style={{ fill: "#F93549" }}
              />
            </YAxis>
          )}
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            content={<CustomTooltip />}
          />
          <Bar dataKey={this.props.yaxis} fill="#0047BA" yAxisId="left" />
          {this.props.individualData && (
            <Bar dataKey="indivCount" fill="#F93549" yAxisId="right" />
          )}
        </BarChart>
      </ResponsiveContainer>
    }
    {this.props.accessibilityMode &&
      <BasicTable data={this.props.data} columnVals={tableColumns}/>
    }
    </>
    );
  }
}
