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
  if (data && data.length > 0) {
    var student = data[0]['student']
    var displayModeStudent = data[0]['displayModeStudent']
  }
  var showData = JSON.parse(JSON.stringify(allData))
  showData.forEach((chapter, index) => {
    if (data) {
      var match = data.find(d => d['_id'] === chapter['_id'])
      if (match) {
        showData[index]['indivCount'] = match['viewCount']
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
          name: "Individual Views",
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
      <ResponsiveContainer width="99%" aspect={2}>
        <BarChart
          margin={{ top: 25, right: 30, bottom: 250, left: data ? 70 : 55 }}
          data={showData}
          barGap={0}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="_id"
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
