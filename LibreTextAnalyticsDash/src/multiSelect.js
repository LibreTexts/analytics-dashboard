import React from "react";
import { Box, Button, Text } from "grommet";
import TreeMenu from "react-simple-tree-menu";
import "../node_modules/react-simple-tree-menu/dist/main.css";

export default function MultiSelect({
  data,
  pathLength,
  levels,
  state,
  setState,
  //chosenPath,
  //setChosenPath,
  filterClick,
  handleChange,
  init,
  clearPath,
  resetPath,
}) {
  const [chosenPath, setChosenPath] = React.useState();

  function treeMap(initData) {
    var data = JSON.parse(JSON.stringify(initData));
    var i = Object.keys(data).length - 1;
    var allData = [];
    while (i > 1) {
      var arr = [];
      Object.keys(data[i]).forEach((e) => {
        var temp = {
          label: e.replaceAll("_", " "),
          key: e,
          nodes: data[i][e],
        };
        arr.push(temp);
      });
      allData.push(arr);
      i = i - 1;
    }

    var x = allData.length - 1;
    Object.keys(allData[0]).forEach((k, index) => {
      allData[0][k].nodes.forEach((c, m) => {
        allData[0][k].nodes[m] = {
          label: c.replaceAll("_", " "),
          key: c,
          nodes: [],
        };
      });
    });

    var copyData = JSON.parse(JSON.stringify(allData));
    while (x > 0) {
      copyData[x].forEach((key) => {
        key.nodes.forEach((k, index) => {
          if (copyData[x - 1].find((o) => o.key === k)) {
            key.nodes[index] = copyData[x - 1].find((o) => o.key === k);
          } else if (typeof key.nodes[index] !== Object) {
            key.nodes[index] = {
              label: k.replaceAll("_", " "),
              key: k,
              nodes: [],
            };
          }
        });
      });
      x = x - 1;
    }
    return copyData[allData.length - 1];
  }

  function chosen(val, event) {
    event.preventDefault();
    if (chosenPath.length === 0) {
      var chosen = [];
    } else {
      var chosen = [...chosenPath];
    }
    chosen.push(<br />);
    chosen.push(val);
    setChosenPath(chosen);
  }

  function makeTree(obj, data, levels) {
    let allData = [];
    const visit = (obj, fn) => {
      const values = Object.values(obj);
      values.forEach((val) => {
        if (val && typeof val === "object") {
          visit(val, fn);
        } else {
          fn(val);
        }
      });
    };

    visit(obj, (val) => {
      var lookup = levels[val];
      if (lookup === undefined) {
        lookup = pathLength - 1;
      }
      var num = lookup * 20;
      var tab = String(num) + "px";
      if (lookup === pathLength - 1) {
        allData.push(
          <Box>
            <Text label={lookup} margin={{ left: tab }}>
              {val.replaceAll("_", " ")}
            </Text>
          </Box>
        );
      } else {
        allData.push(
          <Box>
            <Text
              label={lookup}
              margin={{ left: tab }}
              onClick={(e) => chosen(val, e)}
              style={{ cursor: "pointer" }}
            >
              {val.replaceAll("_", " ")}
            </Text>
          </Box>
        );
      }
    });
    return <div className="collapsible"> {allData} </div>;
  }

  async function handleClick(event, state, setState) {
    //console.log(event.key)
    setChosenPath(event.key);
    //console.log(chosenPath)
    //filterClick(event)
    handleChange("path", event.key, state, setState);
  }

  // <Box>
  //   <Box margin={{bottom: 'medium'}}>
  //     <Text>Chosen Path: {chosenPath}</Text>
  //   </Box>
  // </Box>

  return (
    <Box width="100%">
      {!resetPath && (
        <>
          <TreeMenu
            data={treeMap(data)}
            onClickItem={(event) => {
              handleClick(event, state, setState);
            }}
            hasSearch={false}
            initialActiveKey={init}
          />
          <Button
            secondary
            label="Clear Current Path"
            color="#022851"
            onClick={clearPath}
            margin={{ bottom: "small", horizontal: "large" }}
          />
        </>
      )}
      <Button
        primary
        label="Apply"
        color="#022851"
        margin={{ horizontal: "large" }}
        onClick={(event) => {
          filterClick(state, setState, chosenPath);
        }}
      />
    </Box>
  );
}
