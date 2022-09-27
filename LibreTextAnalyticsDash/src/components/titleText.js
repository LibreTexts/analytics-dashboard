import React from "react";
import { Box, Button, Collapsible, Text } from "grommet";
import { CircleInformation } from "grommet-icons";
import Tippy from '@tippyjs/react';
import 'tippy.js/themes/light-border.css';

//a title component for the charts that have an info icon next to them -> opens an info text box
export default function TitleText({ title, text, topMargin }) {
  const [open, setOpen] = React.useState(false);
  var infoBox = (
    <Box
      round="medium"
      pad="medium"
      align="center"
      justify="center"
      width="500px"
    >
      <Text>{text}</Text>
    </Box>
  )
  return (
    <Box
      align="center"
      direction="column"
      gridArea="title"
      margin={{ top: topMargin, bottom: "medium" }}
    >
      <Box direction="row" align="center">
        <Text size="xlarge" weight="bold" textAlign="center">
          {title}
        </Text>
        <Tippy content={infoBox} placement="right" trigger="click">
          <Button
            alignSelf="end"
            onClick={() => setOpen(!open)}
            icon={<CircleInformation />}
            tabIndex="0"
          />
        </Tippy>
      </Box>
    </Box>
  );
}
