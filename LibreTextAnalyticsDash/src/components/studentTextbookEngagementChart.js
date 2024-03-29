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
import StudentTextbookEngagementTable from "./studentTextbookEngagementTable.js";
import BasicTable from "./basicTable.js";
import { Box, Button } from "grommet";
import { FormClose } from "grommet-icons";
import moment from "moment";

//shows the aggregate page views compared to the page views of an individual student
//different from the PageViewsChart because it needs to be able to shrink to fit a table
export default function StudentTextbookEngagementChart({
  xaxisLabel,
  data,
  width,
  individualData,
  hasAdapt,
  showColumns,
  displayMode,
  type,
  binLabel,
  yaxis,
  state,
  accessibilityMode
}) {
  const [studentData, setStudentData] = React.useState(null);
  const [newWidth, setNewWidth] = React.useState("97%");
  const [leftMargin, setLeftMargin] = React.useState(30);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const [aspect, setAspect] = React.useState(window.innerWidth/500);
  const [height, setHeight] = React.useState(null);

  //connect aggregate data to individual
  data.forEach((d, index) => {
    if (individualData) {
      var match = individualData.find(
        (o) => o["dateString"] === d["dateString"]
      );
      if (match) {
        d["indivCount"] = match["count"];
        d["due"] = match["due"];
      } else {
        d["indivCount"] = 0;
        d["due"] = null;
      }
    }
    if (accessibilityMode) {
      data[index]["formattedDate"] = moment(d._id)
        .add(1, "days")
        .format("MMM Do YYYY")
    }
  });
  var tableColumns = {
    "Date": "formattedDate",
    "Total Views on All Pages": "count",
  }
  if (individualData) {
    tableColumns["Total Views by Student"] = "indivCount"
  }

  //fill the table with the unique pages that the student read on a specific day
  function getPages(val, data, allData) {
    if (data) {
      var id = val.activePayload[1].payload._id;
      var index = data.findIndex((o) => o._id === id);
      var allDataIndex = allData.findIndex((o) => o._id === id);

      //check if there was individual data found
      if (index >= 0) {
        setActiveIndex(allDataIndex);
        var pages = [];
        data[index].uniquePages.forEach((page) => {
          pages.push({
            _id: page,
          });
        });
        setNewWidth("45%");
        setLeftMargin(10);
        setStudentData(pages);
        setAspect(null);
        setHeight(425);
      } else {
        clearChart();
      }
    }
  }

  function clearChart() {
    setStudentData(null);
    setActiveIndex(-1);
    setNewWidth("97%");
    setAspect(window.innerWidth/500);
    setHeight(null);
  }

  const CustomTooltip = (props) => {
    if (props.payload[0] != null) {
      const newPayload = [
        {
          name: "Date",
          value: moment(props.payload[0].payload._id)
            .add(1, "days")
            .format("MMM Do YYYY"),
        },
        {
          name: "Total Views on All Pages",
          value: props.payload[0].payload.count,
        },
      ];
      if (individualData) {
        var pageData = [
          {
            name: "Individual Page Views",
            value: props.payload[0].payload.indivCount,
          },
        ];
        newPayload.splice(2, 0, ...pageData);
      }
      return <DefaultTooltipContent payload={newPayload} />;
    }
    return <DefaultTooltipContent {...props} />;
  };

  return (
    <>
    {!accessibilityMode &&
      <>
      <ResponsiveContainer width={newWidth} aspect={aspect} height={height}>
        <BarChart
          width={500}
          height={height}
          margin={{ right: 20, bottom: 80, left: 30 }}
          data={data}
          barGap={0}
          barCategoryGap="15%"
          onClick={(val) => getPages(val, individualData, data)}
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
              value={"Date (By " + binLabel + ")"}
              position="bottom"
              dy={50}
            />
          </XAxis>
          <YAxis dataKey={yaxis} yAxisId="left" stroke="#0047BA">
            <Label
              value="Total Views on All Pages"
              position="insideBottomLeft"
              angle="-90"
              style={{ fill: "#0047BA" }}
            />
          </YAxis>
          {individualData && (
            <YAxis
              dataKey="indivCount"
              yAxisId="right"
              orientation="right"
              stroke="#F93549"
            >
              <Label
                value="Total Views by Student"
                position="insideBottomRight"
                angle="90"
                style={{ fill: "#F93549" }}
              />
            </YAxis>
          )}
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            content={<CustomTooltip />}
          />
          <Bar dataKey={yaxis} fill="#0047BA" yAxisId="left" />
          {individualData && (
            <Bar dataKey="indivCount" fill="#F93549" yAxisId="right">
              {data.map((entry, index) => (
                <Cell
                  cursor="pointer"
                  fill={index === activeIndex ? "#FFDC00" : "#F93549"}
                  key={`cell-${index}`}
                />
              ))}
            </Bar>
          )}
        </BarChart>
      </ResponsiveContainer>
      {studentData && (
        <Box fill={true} flex={true} responsive={true}>
          <Button alignSelf="end" onClick={clearChart} icon={<FormClose  aria-label="Close chart"/>} />
          <StudentTextbookEngagementTable
            data={studentData}
            displayMode={displayMode}
          />
        </Box>
      )}
      </>
    }
    {accessibilityMode &&
      <BasicTable data={data} columnVals={tableColumns} />
    }
    </>
  );
}
