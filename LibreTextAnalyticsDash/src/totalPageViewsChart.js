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

export default class PageViews extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    //console.log(JSON.parse(this.props.data)['documents'])
    //console.log(typeof(JSON.parse(this.props.data)['documents'][0]['dateString']))
    var height = 350;
    if (this.props.height) {
      height = this.props.height;
    }
    var type = this.props.type;
    var label = "Pages Viewed";
    if (type === "individual") {
      label = "Total Views";
    }
    return (
      <ResponsiveContainer height={height}>
        <BarChart
          width={500}
          height={height}
          margin={{ right: 20, bottom: 80, left: 30 }}
          data={(this.props.data)}
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
          <Tooltip cursor={{ strokeDasharray: "3 3" }} />
          <Bar dataKey={this.props.yaxis} fill="#0047BA" />
        </BarChart>
      </ResponsiveContainer>
    );
  }
}
