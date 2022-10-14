import React from "react";
import { DefaultTooltipContent } from "recharts/lib/component/DefaultTooltipContent";
import {
  BarChart,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Label,
  ResponsiveContainer,
} from "recharts";
import StudentTable from "./studentTable.js";
import BasicTable from "./basicTable.js";
import { Box, Button } from "grommet";
import { FormClose } from "grommet-icons";

//shows a distribution of students for different variables
//ex: unique days, unique pages accessed; shows student count
export default function StudentChart({
  xaxisLabel,
  data,
  width,
  allData,
  hasAdapt,
  showColumns,
  displayMode,
  ltCourse,
  accessibilityMode,
}) {
  const [studentData, setStudentData] = React.useState(null);
  const [newWidth, setNewWidth] = React.useState(width);
  const [leftMargin, setLeftMargin] = React.useState(30);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const [height, setHeight] = React.useState(null);
  const [aspect, setAspect] = React.useState(3);

  //reformat dates so they'll fit on the x axis
  if (
    xaxisLabel === "LT Most Recent Page Load" ||
    xaxisLabel === "ADAPT Most Recent Page Load"
  ) {
    data.forEach((student) => {
      student["_id"] = String(student["_id"]).split("T")[0];
    });
  }
  var tableColumns = {};
  tableColumns[xaxisLabel] = "_id";
  tableColumns["Student Count"] = "count";

  //function to populate the table with students from the chosen bar
  function getStudents(val, allData, original, displayMode) {
    var index = original.findIndex((o) => o._id === val._id);
    setActiveIndex(index);
    var data = [];
    var students = val.students;
    //while (index >= 0) {
      students = original[index]["students"];
      students.forEach((student) => {
        let s = allData.find((o) => o._id === student);
        data.push(s);
      });
    //   index = index - 1;
    // }
    data = data.filter((element) => {
      return element !== undefined;
    });
    setNewWidth("45%");
    setLeftMargin(10);
    setStudentData(data);
    setAspect(null);
    setHeight("95%");
  }

  //hide the chart
  function clearChart() {
    setStudentData(null);
    setActiveIndex(-1);
    setNewWidth(width);
    setAspect(3);
    setHeight(null);
  }

  //create a tooltip to replace the default
  const CustomTooltip = (props) => {
    if (props.payload[0] != null) {
      const newPayload = [
        {
          name: xaxisLabel,
          value: props.payload[0].payload._id,
        },
        {
          name: "Student Count",
          value: props.payload[0].payload.count,
        },
      ];
      return <DefaultTooltipContent payload={newPayload} />;
    }
    return <DefaultTooltipContent {...props} />;
  };

  return (
    <>
      {!accessibilityMode && (
        <>
          <ResponsiveContainer width={newWidth} aspect={aspect} height={height}>
            <BarChart
              margin={{ top: 25, right: 30, bottom: 30, left: leftMargin }}
              data={data}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" interval="preserveStartEnd" minTickGap={30}>
                <Label value={xaxisLabel} position="bottom" />
              </XAxis>
              <YAxis dataKey="count">
                <Label
                  value="Number of Students"
                  position="insideBottomLeft"
                  angle="-90"
                />
              </YAxis>
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                content={<CustomTooltip />}
                allowEscapeViewBox={{ x: false }}
              />
              <Bar
                dataKey="count"
                fill="#0047BA"
                onClick={(val) => getStudents(val, allData, data, displayMode)}
              >
                {
                  //make a pointer when hovering over a bar, change the colors of the bars when you click on them
                }
                {data.map((entry, index) => (
                  <Cell
                    cursor="pointer"
                    fill={index === activeIndex ? "#FFBF00" : "#0047BA"}
                    key={`cell-${index}`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {studentData && (
            <Box fill={true} flex={true} responsive={true}>
              <Button
                alignSelf="end"
                onClick={clearChart}
                icon={<FormClose />}
              />
              <StudentTable
                data={studentData}
                hasAdapt={hasAdapt}
                ltCourse={ltCourse}
                showColumns={showColumns}
                displayMode={displayMode}
              />
            </Box>
          )}
        </>
      )}
      {accessibilityMode && (
        <BasicTable data={data} columnVals={tableColumns} />
      )}
    </>
  );
}
