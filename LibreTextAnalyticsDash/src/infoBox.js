import { Box, Button, Collapsible, Text } from "grommet";
import React, { useState } from "react";
import { FormClose } from "grommet-icons";

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
  main = false,
  height="125px"
}) {
  let [open, setOpen] = useState(initShow);
  let message = [];
  message.push(
    <Text alignSelf="center" margin={{ top: "small" }}>
      {infoText}
    </Text>
  );

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
          height={height}
          width="75%"
          margin={{ vertical: "small" }}
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
              {message}
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
        </Box>
      </Collapsible>
    </>
  );
}
