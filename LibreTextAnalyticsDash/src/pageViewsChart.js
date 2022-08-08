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
import moment from "moment";

export default class PageViewsChart extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    var height = 350;
    if (this.props.height) {
      height = this.props.height;
    }
    var type = this.props.type;
    var label = "Pages Viewed";
    var aspect = 4;
    if (type === "individual") {
      label = "Total Views";
      aspect = 3;
    }

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
          <YAxis dataKey={this.props.yaxis}>
            <Label value={label} position="insideBottomLeft" angle="-90" />
          </YAxis>
          <Tooltip cursor={{ strokeDasharray: "3 3" }} content={<CustomTooltip />}/>
          <Bar dataKey={this.props.yaxis} fill="#0047BA" />
        </BarChart>
      </ResponsiveContainer>
    );
  }
}
