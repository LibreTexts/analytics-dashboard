import React from 'react';
import {DefaultTooltipContent} from 'recharts/lib/component/DefaultTooltipContent';
import { BarChart, CartesianGrid, XAxis, YAxis, ZAxis, Tooltip, Legend, Bar, Label, ResponsiveContainer } from 'recharts';

export default class BarGraph extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    if (this.props.tab === "student") {
      var name = 'Student';
      var objects = 'Pages Viewed';
    } else if (this.props.tab === "page") {
      var name = 'Page';
      var objects = 'Times Viewed';
    }
    var xaxis = this.props.xaxis
    this.props.data.sort(function(a, b) {
      return a[xaxis] - b[xaxis];
    });

    const CustomTooltip = props => {
      if (props.payload[0] != null) {
        const newPayload = [
          {
            name: name,
            value: props.payload[0].payload._id,
          },
          {
            name: 'Average Duration',
            value: props.payload[0].payload.durationInMinutes,
          },
          {
            name: objects,
            value: props.payload[0].payload.objectCount,
          },
          {
            name: 'Average Percent Scrolled',
            value: props.payload[0].payload.percentAvg,
          }
        ];
        if (this.props.tab === "page" && props.payload[0].payload.pageTitle !== undefined) {
          var id = {
            name: name,
            value: props.payload[0].payload.pageTitle,
          }
          newPayload.splice(0, 1, id)
        }
        return <DefaultTooltipContent payload={newPayload} />;
      }
      return <DefaultTooltipContent {...props} />;
    };
  return (
    <ResponsiveContainer height={375} width={600}>
      <BarChart width={550} height={375}
        margin={{ top: 25, right: 20, bottom: 30, left: 30 }}
        data={this.props.data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={this.props.xaxis}>
          <Label value={this.props.xaxisLabel} position="bottom" />
        </XAxis>
        <YAxis dataKey={this.props.yaxis}>
          <Label value={this.props.yaxisLabel} position="insideBottomLeft" angle="-90"/>
        </YAxis>
        <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip/>}/>
        <Bar dataKey={this.props.yaxis} fill="#0047BA" />
      </BarChart>
    </ResponsiveContainer>
  )
}
}
