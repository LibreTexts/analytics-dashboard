import React from "react";
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
import BasicTable from "./basicTable.js";

//shows aggregate grades for the course and grades for an individual assignment
export default function GradesPageView({
  height,
  data,
  range,
  numberOfBins,
  individualData,
  accessibilityMode
}) {
  // Initialize data
  let dataBins = null;
  const inc = range[1] / numberOfBins;

  // Initialize default height
  let chartHeight = 350;
  if (height) {
    chartHeight = Math.max(chartHeight, height);
  }

  if (data != null) {
    dataBins = [];
    // Creating score bin/ranges
    for (let i = 0; i < numberOfBins; i++) {
      let binMin = Math.round(inc * i * 100);
      let binMax = Math.round(inc * (i + 1) * 100);
      dataBins[i] = {
        bin: binMax,
        Count: 0,
        "Individual Count": 0,
        binString: `${binMin} - ${binMax}%`,
      };
    }
    dataBins[numberOfBins] = {
      bin: "Did Not Submit",
      Count: 0,
      "Individual Count": 0,
      binString: "Did Not Submit"
    }
    // Inserting scores into bins
    var indivBins = [];
    if (individualData) {
      indivBins = JSON.parse(JSON.stringify(dataBins));
      individualData.forEach((element) => {
        let i = Math.floor((element.score/100) / inc);
        if (i === numberOfBins) {
          i--;
        }
        if (i < numberOfBins && element.turned_in) {
          indivBins[i].Count++;
        } else if (i < numberOfBins && !element.turned_in) {
          indivBins[numberOfBins].Count++;
        }
      });
    }

    //duplicating the above code for the aggregate data
    data.forEach((element) => {
      //console.log(element.score/inc)
      let index = Math.floor((element.score/100) / inc);
      if (index === numberOfBins) {
        index--;
      }
      if (index < numberOfBins) {
        dataBins[index].Count++;
      }
    });

    //after binning aggregate and individual data, connect the two
    dataBins.forEach((elem) => {
      var find = indivBins.find((o) => o.bin === elem.bin);
      if (find) {
        elem["Individual Count"] = find.Count;
      }
    });
    var notSubmitted = dataBins[numberOfBins];
    dataBins.splice(numberOfBins, 1);
    dataBins.splice(0, 0, notSubmitted);
  }
  var tableColumns = {"Percent": "binString", "Count": "Count"}
  if (individualData) {
    tableColumns["Count for Individual Assignment"] = "Individual Count"
  }

  return (
    <>
    {!accessibilityMode &&
    <ResponsiveContainer width="99%" aspect={3}>
      <BarChart
        width={500}
        height={chartHeight}
        margin={{ right: 20, bottom: 80, left: 30 }}
        data={dataBins}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="binString"
          interval="preserveStartEnd"
          tickCount={numberOfBins}
          minTickGap={1}
          angle={45}
          tickMargin={25}
          tick={{ dx: 20, dy: 20 }}
        >
          <Label
            value={`Grade Bins/Ranges: ${numberOfBins}`}
            position="bottom"
            dy={78}
          />
        </XAxis>
        <YAxis>
          <Label
            value={"Number of Students"}
            position="insideBottomLeft"
            angle="-90"
          />
        </YAxis>
        <Tooltip cursor={{ strokeDasharray: "3 3" }} />
        <Bar dataKey="Count" fill="#0047BA" />
        {individualData && <Bar dataKey="Individual Count" fill="#F93549" />}
      </BarChart>
    </ResponsiveContainer>
  }
  {accessibilityMode &&
  <BasicTable data={dataBins} columnVals={tableColumns} />
}
  </>
  );
}
