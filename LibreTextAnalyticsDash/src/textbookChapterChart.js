import React from "react";
import { DefaultTooltipContent } from "recharts/lib/component/DefaultTooltipContent";
import {
  BarChart,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  Legend,
  Bar,
  Label,
  ResponsiveContainer,
} from "recharts";
import { Box, Button, Text } from "grommet";
import { FormClose } from "grommet-icons";

export default function TextbookChapterChart({
  xaxisLabel,
  data,
  width,
  allData,
  hasAdapt,
  showColumns,
  displayMode,
  state
}) {
  if (data) {
    var student = data[0]['student']
    var displayModeStudent = data[0]['displayModeStudent']
  }
  var showData = JSON.parse(JSON.stringify(allData))
  showData.forEach((chapter, index) => {
    if (data) {
      var match = data.find(d => d['_id'] === chapter['_id'])
      if (match) {
        showData[index]['indivCount'] = match['count']
        showData[index]['student'] = match['student']
        showData[index]['displayModeStudent'] = match['displayModeStudent']
      } else {
        showData[index]['indivCount'] = 0
        showData[index]['student'] = student
        showData[index]['displayModeStudent'] = displayModeStudent
      }
    }
    showData[index]['_id'] = chapter['_id'].replaceAll("_", " ")
  })

  showData = showData.sort(function(a, b) {
    return a.viewCount - b.viewCount
  })

  class CustomizedAxisTick extends React.Component {
    render () {
      const {x, y, payload, width, fontSize, fill} = this.props;
      var maxChars = 15
      var height = 15
      //console.log(this.props)
      //return <Text x={x} y={y} textAnchor="middle" verticalAnchor="start">{payload.value}</Text>;
      //return ( <Text x={x} y={y} textAnchor="end" verticalAnchor="start" angle={-45} fill="#333">{payload.value}</Text> );
      //return ( <g transform={`translate(${x},${y})`}><Text width={100} scaleToFit textAnchor="end" verticalAnchor="start" angle={-45} fill="#333">{payload.value}</Text></g> );
      //return ( <g transform={`translate(${x},${y})`}><Text width={50} scaleToFit textAnchor="middle" verticalAnchor="start" angle={0} fill="#333">{payload.value}</Text></g> );
      const rx = new RegExp(`.{1,${maxChars}}`, 'g');
      const chunks = payload.value.replace(/-/g,' ').split(' ').map(s => s.match(rx)).flat();
      const tspans = chunks.map((s,i) => <tspan x={0} y={height} dy={(i*height)}>{s}</tspan>);
      return (
      	<g transform={`translate(${x},${y})`}>
          <text width={width} height="auto" textAnchor="middle" fontSize="medium" fill={fill}>
            {tspans}
          </text>
        </g>
      );
    }
  };

  class CustomizedTickLabels extends React.Component {
    render () {
      const {x, y, payload, width, fontSize, fill} = this.props;
      var maxChars = 15
      var height = 15
      const rx = new RegExp(`.{1,${maxChars}}`, 'g');
      const chunks = payload.value.replace(/-/g,' ').split(' ').map(s => s.match(rx)).flat();
      const tspans = chunks.map((s,i) => <tspan x={0} y={height} dy={(i*height)}>{s}</tspan>);
      return (
      	<g transform={`translate(${x},${y})`}>
          <text width={width} height="auto" textAnchor="start" fontSize="medium" fill={fill}>
            {tspans}
          </text>
        </g>
      );
    }
  };

  function CustomizedTick(props) {
    const { x, y, stroke, payload } = props;
    if (payload.value.split(" ").length > 4) {
      return (
          <g transform={`translate(${x},${y})`}>
          <text x={0} y={0} dy={16} fill="#666" fontSize="small">
            <tspan textAnchor="middle" x="0">
              {payload.value.split(" ").slice(0, 4).map(a => a+" ")}
            </tspan>
            <tspan textAnchor="middle" x="0" dy="20">
              {payload.value.split(" ").slice(4, payload.value.split(" ").length-1).map(a => a+" ")}
            </tspan>
          </text>
        </g>
      );
    } else {
      return (
        <g transform={`translate(${x},${y})`}>
          <text x={0} y={0} dy={16} fill="#666" fontSize="small">
            <tspan textAnchor="middle" x="0">
            {payload.value}
            </tspan>
          </text>
        </g>
      )
    }
  }

  const CustomTooltip = (props) => {
    if (props.payload[0] != null) {
      const newPayload = [
        {
          name: xaxisLabel,
          value: props.payload[0].payload._id,
        },
        {
          name: "Aggregate Views",
          value: props.payload[0].payload.viewCount,
        },

      ];
      if (data) {
        var studentData = [{
          name: "Student",
          value: student
        },
        {
          name: "Views",
          value: props.payload[0].payload.indivCount
        }]
        newPayload.splice(1, 0, ...studentData)
      }
      return <DefaultTooltipContent payload={newPayload} />;
    }
    return <DefaultTooltipContent {...props} />;
  };
  return (
    <>
      <ResponsiveContainer height="99%">
        <BarChart
          margin={{ top: 25, right: 30, bottom: 250, left: data ? 70 : 55 }}
          data={showData}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="_id"
            interval="preserveStartEnd"
            interval={0}
            angle={-35}
            tickSize={10}
            textAnchor="end"
          >
            {
              //<Label value="Textbook Chapters" position="bottom" />
            }
          </XAxis>
          <YAxis dataKey="viewCount" yAxisId="left" stroke="#0047BA">
            <Label value="View Count" position="insideBottomLeft" angle="-90" style={{ fill: "#0047BA" }}/>
          </YAxis>
          {data &&
            <YAxis dataKey="indivCount" yAxisId="right" orientation="right" stroke="#F93549">
              <Label value="Individual Count" position="insideBottomRight" angle="90" style={{ fill: "#F93549" }}/>
            </YAxis>
          }
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            content={<CustomTooltip />}
            allowEscapeViewBox={{ x: false }}
          />
          <Bar dataKey="viewCount" fill="#0047BA" yAxisId="left"/>
          {data && <Bar dataKey="indivCount" fill="#F93549" yAxisId="right"/>}
        </BarChart>
      </ResponsiveContainer>
    </>
  );
}
