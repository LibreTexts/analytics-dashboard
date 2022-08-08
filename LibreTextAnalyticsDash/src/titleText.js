import React from "react";
import { Box, Button, Collapsible, Text } from "grommet";
import { CircleInformation } from "grommet-icons";

export default function TitleText({ title, text, topMargin }) {
  const [open, setOpen] = React.useState(true);
  return (
    <Box
      align="center"
      direction="column"
      gridArea="title"
      margin={{ top: topMargin }}
    >
      <Box direction="row" align="center">
        <Text size="xlarge" weight="bold" textAlign="center">
          {title}
        </Text>
        <Button
          alignSelf="end"
          onClick={() => setOpen(!open)}
          icon={<CircleInformation />}
        />
      </Box>
      <Collapsible
        open={open}
        direction="vertical"
        alignSelf="start"
        margin={{ top: topMargin }}
      >
        <Box
          background={{ color: "#6FCFEB", opacity: "medium" }}
          round="medium"
          pad="medium"
          align="center"
          justify="center"
        >
          <Text>{text}</Text>
        </Box>
      </Collapsible>
    </Box>
  );
}
