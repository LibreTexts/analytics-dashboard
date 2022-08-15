import React from "react";
import { DefaultTooltipContent } from "recharts/lib/component/DefaultTooltipContent";
import {
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  Legend,
  Bar,
  Label,
  ResponsiveContainer,
} from "recharts";
import { Box, Notification } from "grommet";
import { infoText } from "./allInfoText.js";
import moment from "moment";

export default class AllAdaptAssignmentsChart extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    if (this.props.tab === "student") {
      var name = "Student";
      var objects = "Pages Viewed";
    } else if (this.props.tab === "page") {
      var name = "Page";
      var objects = "Times Viewed";
    }
    var xaxis = this.props.xaxis;
    // this.props.data.sort(function (a, b) {
    //   return a[xaxis] - b[xaxis];
    // });
    if (this.props.data) {
      var student = this.props.data[0]["_id"]["student"];
    }

    this.props.allData.forEach((d, index) => {
      if (this.props.data) {
        var match = this.props.data.find((o) => o["level_name"] === d["_id"]);
        if (match) {
          d["indivPercent"] = match["percent"];
          d["submitted"] = moment(match["submitted"]).format(
            "MMM Do YYYY h:mm a"
          );
          d["student"] = match["_id"]["student"];
          d["displayModeStudent"] = match["displayModeStudent"]
        } else {
          d["indivPercent"] = 0;
          d["submitted"] = "N/A";
          d["student"] = student;
        }
      }
      if (d["_id"].length > 10 && d["_id"].includes(":")) {
        this.props.allData[index]["_id"] = d["_id"].split(":")[0];
      } else if (d["_id"].length > 10 && d["_id"].includes("(")) {
        this.props.allData[index]["_id"] = d["_id"].split("(")[0];
      }
    });

    const CustomTooltip = (props) => {
      if (props.payload[0] != null) {
        const newPayload = [
          {
            name: "Assignment",
            value: props.payload[0].payload._id,
          },
          {
            name: "Class Average",
            value: props.payload[0].payload.percent + "%",
          },
          {
            name: "Due Date",
            value: moment(props.payload[0].payload.due).format(
              "MMM Do YYYY h:mm a"
            ),
          },
        ];
        if (this.props.data) {
          var studentData = [
            {
              name: "Student",
              value: !this.props.state.displayMode
                ? props.payload[0].payload.student
                : props.payload[0].payload.displayModeStudent,
            },
            {
              name: "Submitted",
              value: props.payload[0].payload.submitted,
            },
            {
              name: "Student Percent Earned",
              value: props.payload[0].payload.indivPercent + "%",
            },
          ];
          newPayload.splice(3, 0, ...studentData);
        }
        return <DefaultTooltipContent payload={newPayload} />;
      }
      return <DefaultTooltipContent {...props} />;
    };
    if (this.props.allData && this.props.allData.length > 0) {
      return (
        <ResponsiveContainer width="96%" aspect={3}>
          <BarChart
            width={550}
            height={375}
            margin={{ top: 25, right: 20, bottom: 110, left: 30 }}
            data={this.props.allData}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="_id"
              interval={0}
              angle={35}
              tickMargin={30}
              tickSize={10}
            >
              <Label
                value={this.props.xaxisLabel}
                position="bottom"
                offset={50}
              />
            </XAxis>
            <YAxis dataKey="percent">
              <Label
                value={this.props.yaxisLabel}
                position="insideBottomLeft"
                angle="-90"
              />
            </YAxis>
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }} //, fill: 'transparent' }}
              content={<CustomTooltip />}
            />
            <Bar dataKey={this.props.yaxis} fill="#0047BA" />
            {this.props.data && <Bar dataKey="indivPercent" fill="#F93549" />}
          </BarChart>
        </ResponsiveContainer>
      );
    } else {
      return (
        <Box width="100%" height="100px">
          <Notification title={infoText.noDataMessage} onClose={() => {}} />
        </Box>
      );
    }
  }
}
