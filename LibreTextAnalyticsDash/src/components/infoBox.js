import { Box, Button, Collapsible, Text } from "grommet";
import React, { useState, useEffect } from "react";
import { FormClose } from "grommet-icons";
import ProgressBar from "./progressBar.js";
import moment from "moment";

//blue box to show information
export default function InfoBox({
  infoText,
  initShow = true,
  infoTextAlign = "center",
  infoTextWidth = 100,
  showIcon = false,
  icon,
  color,
  count,
  setCount,
  ltCourse=true,
  adaptCourse=false,
  queryVariables,
  state,
  setState,
  showProgress=false,
  main = false,
  height = "125px",
}) {
  let [open, setOpen] = useState(initShow);
  let [progressMessage, setProgressMessage] = useState(0);
  let message = [];
  let msgkey = 0;
  message.push(
    <Text alignSelf="center" margin={{ top: "small" }} key={msgkey++}>
      {infoText}
    </Text>
  );

  useEffect(() => {
    if (showProgress) {
      var percent = 0;
      if (ltCourse && !adaptCourse) {
        percent = queryVariables.progress * 14;
      } else if (adaptCourse && !ltCourse) {
        percent = queryVariables.progress * 20;
      } else {
        percent = queryVariables.progress * 9;
      }
      setProgressMessage(percent)
    }
  }, [queryVariables.progress, adaptCourse, ltCourse, showProgress])

  if (showProgress && progressMessage === 0  && moment().diff(queryVariables.loadingStart, 'seconds') > 30) {
    localStorage.clear()
    sessionStorage.clear()
    setState({...state, reload: true})
    //handleClick(state, setState, "courseId", queryVariables)
  }

  function handleClick() {
    setOpen(!open);
    setCount(count + 1);
  }

  return (
    <>
      <Collapsible open={open} direction="vertical" alignSelf="start">
        <Box
          background={{ color: color, opacity: 0.5 }}
          pad="medium"
          align="center"
          alignContent="center"
          alignSelf="center"
          justify="center"
          height={!showProgress ? height : "300px"}
          width="75%"
          margin={!showProgress ? { vertical: "small" } : { top: "xlarge" }}
        >
          <Box height="xsmall" width="100%" direction="row">
            {showIcon && <Button alignSelf="start" icon={icon} />}
            <Box
              direction="row"
              width="90%"
              alignSelf="start"
              alignContent="center"
              align="start"
              justify="center"
            >
            <Box direction="column" width="100%">
              {message}
              {showProgress &&
                <>
                  <Text alignSelf="center" margin={{ top: "small" }} key={2}>
                    If the course has made no progress within 30 seconds, it will try to automatically reload.
                  </Text>
                  <Text alignSelf="center" margin={{ top: "small" }} key={2}>
                    If that is not successful, please try clearing your browser cache and reloading the page manually.
                  </Text>
                </>
              }
              </Box>
            </Box>
            <Box alignSelf="end" width="10%" justify="end">
              <Button
                margin={{ bottom: "medium" }}
                alignSelf="end"
                onClick={handleClick}
                icon={<FormClose />}
              />
            </Box>
          </Box>
          {showProgress &&
            <ProgressBar completed={progressMessage} bgcolor="#00008b"/>
          }
        </Box>
      </Collapsible>
    </>
  );
}
