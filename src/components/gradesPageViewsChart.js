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

//shows aggregate grades for the course and grades for an individual assignment
export default function GradesPageView({
  height,
  data,
  range,
  numberOfBins,
  individualData,
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
      let binMin = (inc * i * 100).toFixed(2);
      let binMax = (inc * (i + 1) * 100).toFixed(2);
      dataBins[i] = {
        bin: binMax,
        Count: 0,
        "Individual Count": 0,
        binString: `${binMin} - ${binMax}%`,
      };
    }
    // Inserting scores into bins
    var indivBins = [];
    if (individualData) {
      indivBins = JSON.parse(JSON.stringify(dataBins));
      individualData.forEach((element) => {
        let i = Math.floor(element.score / inc);
        if (i === numberOfBins) {
          i--;
        }
        if (i < numberOfBins) {
          indivBins[i].Count++;
        }
      });
    }

    //duplicating the above code for the aggregate data
    data.forEach((element) => {
      let index = Math.floor(element.score / inc);
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
  }

  return (
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
  );
}
