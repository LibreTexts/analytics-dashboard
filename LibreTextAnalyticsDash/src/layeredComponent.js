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
import {
  Box,
  Button,
  Grid,
  Layer,
  Select,
  Spinner,
  Text,
  RangeInput,
} from "grommet";
import { Filter, Close, FormClose } from "grommet-icons";
import TitleText from "./titleText.js";
import InfoBox from "./infoBox.js";
import { infoText as allInfoText } from "./allInfoText.js";

export default function LayeredComponent({
  gridArea,
  title,
  infoText,
  filterLabel,
  filterType = "dropdown",
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
  downloadComponent,
  disable,
  type,
  axisType,
  csvName,
  csvHeaders,
  queryVariables,
}) {
  const [showFilter, setShowFilter] = useState(false);
  const [axisLabel, setAxisLabel] = useState(label);
  const [click, setClick] = useState(false);
  const [disableFilter, setDisableFilter] = useState(false);

  var height = 150;
  var border = false;
  var disableButton = true;
  if (selectComponent) {
    height += 75;
    border = true;
    disableButton = disable;
  }
  if (downloadComponent) {
    height += 25;
  }
  height = height + "px";
  var chartHeight = "510px";
  if (title === "Student Metrics" || !data) {
    chartHeight = "";
  }
  if (type === "chapterData") {
    chartHeight = "700px"
  }

  var option = "";
  if (filterType === "slider") {
    option = state.sliderValue;
  }

  var hasLegend = (type === "studentAssignments" || type === "aggregatePageViews" || type === "chapterData") ? true : false

  function closeFilter(
    state,
    setShowFilter,
    axisLabel,
    filterFunction,
    click,
    type
  ) {
    if (click || type === "studentAssignments") {
      setShowFilter(false);
    } else {
      //change values back to before they were changed if Apply wasn't clicked
      if (type !== "numBinsGrades") {
        filterFunction(axisLabel, state, setState, type);
      } else {
        filterFunction(state, setState, "sliderValue", axisLabel);
      }
      setShowFilter(false);
      setDisableFilter(true);
    }
  }

  function apply(
    state,
    setState,
    type,
    axisType,
    data,
    setDisableFilter,
    setClick
  ) {
    clickFunction(state, setState, type, option, data);
    setDisableFilter(true);
    setClick(true);
    setAxisLabel(state[axisType]);
  }

  function changeOptions(
    option,
    state,
    setState,
    type,
    data,
    setDisableFilter,
    setClick,
    event
  ) {
    if (type !== "numBinsGrades") {
      filterFunction(option, state, setState, type, data);
    } else {
      filterFunction(state, setState, "sliderValue", event.target.value);
    }
    setClick(false);
    setDisableFilter(false);
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
          direction={hasLegend ? "row" : "column"}
          gridArea="title"
          overflowY="scroll"
          responsive={true}
          height={height}
          border={border}
          justify={hasLegend ? "center" : "stretch"}
        >
          {hasLegend && (
            <Box direction="column" margin={{ left: "xlarge" }} align="center">
              <TitleText title={title} text={infoText} topMargin="small" />
              {selectComponent}
            </Box>
          )}
          {!hasLegend && (
            <>
              <TitleText title={title} text={infoText} topMargin="small" />
              {selectComponent}
            </>
          )}
          {hasLegend && (
            <Box
              border={true}
              height="100px"
              width="225px"
              margin={{ left: "xlarge" }}
              direction="column"
            >
              <Box direction="row">
                <Box
                  height="25px"
                  width="25px"
                  border={true}
                  margin={{ left: "small", top: "small" }}
                  background="#0047BA"
                />
                <Text margin={{ left: "small", bottom: "small", top: "small" }}>
                  {type === "aggregatePageViews" ? "Aggregate Pages" : "Class Performance"}
                </Text>
              </Box>
              <Box direction="row">
                <Box
                  height="25px"
                  width="25px"
                  border={true}
                  margin={{ left: "small", top: "small" }}
                  background="#F93549"
                />
                <Text margin={{ left: "small", bottom: "small", top: "small" }}>
                  {type === "aggregatePageViews" ? "Individual Page" : "Individual Performance"}
                </Text>
              </Box>
            </Box>
          )}
        </Box>
        <Box
          gridArea="plot"
          justify="center"
          direction="row"
          overflowY="scroll"
          responsive={true}
          border={border && data ? true : false}
          height={chartHeight}
        >
          {data && (type !== "chapterData") && (
            <Button
              alignSelf="start"
              secondary
              onClick={() => setShowFilter(true)}
              icon={<Filter />}
              margin={{ top: "small", left: "small" }}
            />
          )}
          {showFilter && (
            <Layer
              onEsc={() =>
                closeFilter(
                  state,
                  setShowFilter,
                  axisLabel,
                  filterFunction,
                  click,
                  type
                )
              }
              onClickOutside={() =>
                closeFilter(
                  state,
                  setShowFilter,
                  axisLabel,
                  filterFunction,
                  click,
                  type
                )
              }
              position="left"
              margin={{ left: "large" }}
            >
              <Button
                icon={<Close />}
                onClick={() =>
                  closeFilter(
                    state,
                    setShowFilter,
                    axisLabel,
                    filterFunction,
                    click,
                    type
                  )
                }
              />
              <Box direction="column" alignSelf="center" margin="large">
                <Text size="medium" weight="bold" textAlign="center">
                  {filterLabel}
                </Text>
                {filterType === "dropdown" && (
                  <>
                    <Text>{filterSelectLabel}</Text>
                    <Select
                      options={filterOptions}
                      margin={{
                        right: "medium",
                        left: "medium",
                      }}
                      value={label}
                      onChange={({ option }) =>
                        changeOptions(
                          option,
                          state,
                          setState,
                          type,
                          data,
                          setDisableFilter,
                          setClick
                        )
                      }
                    />
                  </>
                )}
                {filterType === "slider" && (
                  <>
                    <Text>
                      {filterSelectLabel} {label}
                    </Text>
                    <RangeInput
                      min={filterOptions[0]}
                      max={filterOptions[1].length}
                      margin={{ right: "medium", left: "medium" }}
                      value={label}
                      onChange={(event) =>
                        changeOptions(
                          "",
                          state,
                          setState,
                          type,
                          data,
                          setDisableFilter,
                          setClick,
                          event
                        )
                      }
                    />
                  </>
                )}
                {type !== "studentAssignments" && (
                  <Button
                    primary
                    label="Apply"
                    disabled={disableFilter}
                    onClick={() =>
                      apply(
                        state,
                        setState,
                        type,
                        axisType,
                        data,
                        setDisableFilter,
                        setClick
                      )
                    }
                    margin="large"
                  />
                )}
              </Box>
            </Layer>
          )}
          {disableButton && !data && (
            <InfoBox infoText={loading} showIcon={true} icon={<Spinner />} />
          )}
          {data && data.length > 0
            ? component
            : data &&
              disableButton && (
                <InfoBox
                  infoText={allInfoText.noDataMessage}
                  count={queryVariables.count}
                  setCount={queryVariables.setCount}
                />
              )}
          {downloadComponent}
        </Box>
      </Grid>
    </Box>
  );
}
