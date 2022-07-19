// 6/27 Robert
import React from 'react';
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Label, ResponsiveContainer } from 'recharts';

export default function GradesPageView({ height, data, range, numberOfBins }) {
  // Initialize data 
  let dataBins = null;
  const inc = range[1] / numberOfBins

  // Initialize default height
  let chartHeight = 350;
  if (height) {
    chartHeight = Math.max(chartHeight, height)
  }
  //console.log(chartHeight)

  if (data != null) {
    //console.log("before", data)

    dataBins = []
    for (let i = 0; i < numberOfBins; i++) {
      let binMin = (inc * (i) * 100).toFixed(2)
      let binMax = (inc * (i + 1) * 100).toFixed(2)
      dataBins[i] = {
        "bin": binMax,
        "count": 0,
        "binString": `${binMin} - ${binMax}%`
      }
    }
    data.forEach(element => {
      let index = Math.floor(element.score / inc);
      if (index == numberOfBins) {
        index--
      }
      if (index < numberOfBins) {
        dataBins[index].count++;
      }
    });
    //console.log("data bins", dataBins)
  }

  return (
    <ResponsiveContainer height={chartHeight}>
      <BarChart
        width={500}
        height={chartHeight}
        margin={{ right: 20, bottom: 80, left: 30 }}
        data={dataBins}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="binString" interval="preserveStartEnd" tickCount={numberOfBins} minTickGap={1} angle={45} tickMargin={25} tick={{ dx: 20, dy: 20 }}>
          <Label value={`Grade Bins/Ranges: ${numberOfBins}`} position="bottom" dy={78} />
        </XAxis>
        <YAxis>
          <Label value={"Number of Students"} position="insideBottomLeft" angle="-90" />
        </YAxis>
        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
        <Bar dataKey={'count'} fill="#0047BA" />
      </BarChart>
    </ResponsiveContainer>
  )
}