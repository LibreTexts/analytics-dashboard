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
  ResponsiveContainer
} from "recharts";
import { Box, Notification } from "grommet";
import { infoText } from "./allInfoText.js";

export default class BarGraph extends React.Component {
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

    this.props.data.forEach((d, index) => {
      if (d['level_name'].length > 10 && d['level_name'].includes(":")) {
        this.props.data[index]['level_name'] = d['level_name'].split(":")[0]
      } else if (d['level_name'].length > 10 && d['level_name'].includes("(")) {
        this.props.data[index]['level_name'] = d['level_name'].split("(")[0]
      }
    })

    const CustomTooltip = (props) => {
      if (props.payload[0] != null) {
        const newPayload = [
          {
            name: "Percent Earned",
            value: props.payload[0].payload.percent+"%",
          },
          {
            name: "Assignment",
            value: props.payload[0].payload.level_name,
          },
          {
            name: "Due Date",
            value: props.payload[0].payload.due,
          },
        ];
        if (
          this.props.tab === "page" &&
          props.payload[0].payload.pageTitle !== undefined
        ) {
          var id = {
            name: name,
            value: props.payload[0].payload.pageTitle,
          };
          newPayload.splice(0, 1, id);
        }
        return <DefaultTooltipContent payload={newPayload} />;
      }
      return <DefaultTooltipContent {...props} />;
    };
    if (this.props.data && this.props.data.length > 0) {
      return (
        <ResponsiveContainer width="99%" aspect={3}>
          <BarChart
            width={550}
            height={375}
            margin={{ top: 25, right: 20, bottom: 110, left: 30 }}
            data={this.props.data}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={this.props.xaxis}
              interval={0}
              angle={35}
              tickMargin={30}
              tickSize={10}
              >
              <Label value={this.props.xaxisLabel} position="bottom" offset={50}/>
            </XAxis>
            <YAxis dataKey={this.props.yaxis}>
              <Label
                value={this.props.yaxisLabel}
                position="insideBottomLeft"
                angle="-90"
              />
            </YAxis>
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}//, fill: 'transparent' }}
              content={<CustomTooltip />}
            />
            <Bar dataKey={this.props.yaxis} fill="#0047BA" />
          </BarChart>
        </ResponsiveContainer>
      );
    } else {
      return (
        <Box width="100%" height="100px">
          <Notification title={infoText.noDataMessage} onClose={() => {}} />
        </Box>
      )
    }
  }
}
