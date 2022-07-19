import React, { useState } from "react";
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
import { Box, Button, Grid, Layer, Select, Spinner, Text, RangeInput } from "grommet";
import { Filter, Close, FormClose } from "grommet-icons";
import TitleText from "./titleWithInfo.js";
import InfoBox from "./collapsible_info_box.js";

export default function LayeredComponent({
  gridArea,
  title,
  infoText,
  filterLabel,
  filterType="dropdown",
  state,
  setState,
  component,
  data,
  label,
  loading,
  filterOptions,
  filterSelectLabel,
  filterFunction,
  clickFunction,
  selectComponent,
  disable
}) {
  const [showFilter, setShowFilter] = useState(false);

  var height = "150px"
  var border = false
  var disableButton = true;
  if (selectComponent) {
    height="225px"
    border = true
    disableButton = disable
  }

  var chartHeight = "510px"
  if (title === "Student Metrics Bar Chart" || !data) {
    chartHeight = ""
  }

  return (
    <Box
      gridArea={gridArea}
      border={!border}
      align="center"
      direction="row"
      overflowY="scroll"
      responsive={true}
    >
      <Grid
        fill={true}
        rows={["1/5", "4/5"]}
        columns={["100%"]}
        gap="small"
        areas={[
          { name: "title", start: [0, 0], end: [0, 0] },
          { name: "plot", start: [0, 1], end: [0, 1] },
        ]}
        overflowY="scroll"
        responsive={true}
      >
        <Box
          align="center"
          direction="column"
          gridArea="title"
          overflowY="scroll"
          responsive={true}
          height={height}
          border={border}
        >
          <TitleText
            title={title}
            text={infoText}
            topMargin="small"
          />
          {selectComponent}
        </Box>
        <Box
          gridArea="plot"
          justify="center"
          direction="row"
          overflowY="scroll"
          responsive={true}
          border={border}
          height={chartHeight}
        >
        {data &&
          <Button
            alignSelf="start"
            secondary
            onClick={() => setShowFilter(true)}
            icon={<Filter />}
            margin={{ top: "small", left: "small" }}
          />
        }
          {filterType === "dropdown" && showFilter && (
            <Layer
              onEsc={() => setShowFilter(false)}
              onClickOutside={() => setShowFilter(false)}
              position="left"
              margin={{ left: "large" }}
            >
              <Button icon={<Close />} onClick={() => setShowFilter(false)} />
              <Box direction="column" alignSelf="center" margin="large">
                <Text size="medium" weight="bold" textAlign="center">
                  {filterLabel}
                </Text>
                <Text>{filterSelectLabel}</Text>
                <Select
                  options={filterOptions}
                  margin={{
                    right: "medium",
                    left: "medium",
                  }}
                  value={label}
                  onChange={({ option }) =>
                    filterFunction(option, state, setState)
                  }
                />
                <Button
                  primary
                  label="Apply"
                  onClick={() => clickFunction(state, setState)}
                  margin="large"
                />
              </Box>
            </Layer>
          )}
          {filterType === "slider" && showFilter && (
            <Layer
              onEsc={() => setShowFilter(false)}
              onClickOutside={() => setShowFilter(false)}
              position="left"
              margin={{ left: "large" }}
            >
              <Button icon={<Close />} onClick={() => setShowFilter(false)} />
              <Box direction="column" alignSelf="center" margin="large">
                <Text size="medium" weight="bold" textAlign="center">
                  {filterLabel}
                </Text>
                <Text>{filterSelectLabel} {label}</Text>
                <RangeInput
                  min={filterOptions[0]}
                  max={filterOptions[1].length}
                  margin={{ right: "medium", left: "medium" }}
                  value={label}
                  onChange={event => filterFunction("sliderValue", event.target.value, state, setState)}
                />
                <Button
                  primary
                  label="Apply"
                  onClick={() => {
                    filterFunction("numBinsGrades", state.sliderValue, state, setState)
                  }}
                  margin="large"
                />
              </Box>
            </Layer>
          )}
          {disableButton && !data && (
            <InfoBox
              infoText={loading}
              showIcon={true}
              icon={<Spinner />}
            />
          )}
          {data && component}
        </Box>
      </Grid>
    </Box>
  );
}
