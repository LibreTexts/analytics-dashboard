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

export default class PageViewsChart extends React.Component {
  render() {
    var height = 350;
    if (this.props.height) {
      height = this.props.height;
    }
    var type = this.props.type;
    var label = "Total Views on All Pages";
    var aspect = 3;
    if (type === "individual") {
      label = "Total Views";
      aspect = 3;
    } else if (type === "aggregateStudent") {
      label = "Average Views on All Pages";
    }

    this.props.data.forEach((d, index) => {
      if (this.props.individualData) {
        var match = this.props.individualData.find((o) => o["dateString"] === d["dateString"]);
        if (match) {
          d["indivCount"] = match["count"];
        } else {
          d["indivCount"] = 0;
        }
      }
    });

    const CustomTooltip = (props) => {
      if (props.payload[0] != null) {
        const newPayload = [
          {
            name: "Date",
            value: moment(props.payload[0].payload._id).add(1, "days").format("MMM Do YYYY"),
          },
          {
            name: label,
            value: props.payload[0].payload.count,
          },
        ];
        if (this.props.individualData) {
          var pageData = [
            {
              name: this.props.type === "aggregate" ? "Page" : "Student",
              value: this.props.type === "aggregate" ? this.props.page : this.props.student
            },
            {
              name: "Individual Page Views",
              value: props.payload[0].payload.indivCount
            }
          ]
          newPayload.splice(2, 0, ...pageData)
        }
        return <DefaultTooltipContent payload={newPayload} />;
      }
      return <DefaultTooltipContent {...props} />;
    };

    return (
      <ResponsiveContainer width="97%" aspect={aspect}>
        <BarChart
          width={500}
          height={height}
          margin={{ right: 20, bottom: 80, left: 30 }}
          data={this.props.data}
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
            <Label value={label} position="insideBottomLeft" angle="-90" style={{ fill: "#0047BA" }}/>
          </YAxis>
          {this.props.individualData &&
            <YAxis dataKey="indivCount" yAxisId="right" orientation="right" stroke="#F93549">
              <Label value={type === "aggregate" ? "Total Views on Individual Page" : "Average Views"} position="insideBottomRight" angle="90" style={{ fill: "#F93549" }}/>
            </YAxis>
          }
          <Tooltip cursor={{ strokeDasharray: "3 3" }} content={<CustomTooltip />}/>
          <Bar dataKey={this.props.yaxis} fill="#0047BA" yAxisId="left"/>
          {this.props.individualData && <Bar dataKey="indivCount" fill="#F93549" yAxisId="right"/>}
        </BarChart>
      </ResponsiveContainer>
    );
  }
}
