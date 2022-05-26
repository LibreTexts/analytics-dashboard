import React from 'react';
import {DefaultTooltipContent} from 'recharts/lib/component/DefaultTooltipContent';
import { ScatterChart, CartesianGrid, XAxis, YAxis, ZAxis, Tooltip, Legend, Scatter, Label, ResponsiveContainer } from 'recharts';

export default class ScatterPlot extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    if (this.props.tab === "student") {
      var name = 'Name';
      var objects = 'Pages';
    } else if (this.props.tab === "page") {
      var name = 'Page'; //fix so that tooltip renders id if title not present
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
            name: 'Average Percent',
            value: props.payload[0].payload.percentAvg
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
    <ResponsiveContainer height={375} width="100%">
      <ScatterChart
        margin={{ top: 25, right: 20, bottom: 25, left: 30 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={this.props.xaxis}>
          <Label value={this.props.xaxisLabel} position="bottom" />
        </XAxis>
        <YAxis dataKey={this.props.yaxis}>
          <Label value={this.props.yaxisLabel} position="insideBottomLeft" angle="-90"/>
        </YAxis>
        <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip/>}/>
        <Scatter name="Pages" dataKey={this.props.yaxis} data={this.props.data} fill="#0047BA" line={{stroke: '#F93549', strokeWidth: 2}} lineType="fitting" fillOpacity="80%"/>
      </ScatterChart>
    </ResponsiveContainer>
  )
}
}
