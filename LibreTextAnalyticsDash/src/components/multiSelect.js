import React, { createRef, useState } from "react";
import { Box, Button } from "grommet";
import TreeMenu from "react-simple-tree-menu";
import { writeToLocalStorage } from "../functions/helperFunctions.js";
import "../../node_modules/react-simple-tree-menu/dist/main.css"; // Tree select CSS

export default function MultiSelect({
  data,
  pathLength,
  levels,
  state,
  setState,
  filterClick,
  handleChange,
  init,
  resetPath,
  queryVariables,
}) {
  // For Reference:
  // https://codepen.io/ScriptyChris/pen/jOMZmdV

  const [chosenPaths, setChosenPaths] = useState([]);
  const treeMenuRef = createRef();
  const categoriesTreeRef = createRef(); // used to force DOM updates in tree menu
  const [activeTreeNodes, setActiveTreeNodes] = useState(new Map());

  // Restructures JSON data to preserve node order
  // index used for multiple selection on react-simple-tree-menu
  function treeMap(initData) {
    var data = JSON.parse(JSON.stringify(initData));
    var keysLength = Object.keys(data).length - 1;
    var allData = [];
    for (let i = keysLength; i > 1; i--) {
      let arr = [];
      Object.keys(data[i]).forEach((e, idx) => {
        var temp = {
          label: e.replaceAll("_", " "),
          key: e,
          index: idx,
          nodes: data[i][e],
        };
        arr.push(temp);
      });
      allData.push(arr);
    }

    Object.keys(allData[0]).forEach((k, index) => {
      allData[0][k].nodes.forEach((c, m) => {
        allData[0][k].nodes[m] = {
          label: c.replaceAll("_", " "),
          key: c,
          index: m,
          nodes: [],
        };
      });
    });

    var copyData = JSON.parse(JSON.stringify(allData));

    var allDataLength = allData.length - 1;
    for (let x = allDataLength; x > 0; x--) {
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
    }
    return copyData[allData.length - 1];
  }

  const getCategoriesTree = () => {
    return (
      <TreeMenu
        data={treeMap(data)}
        onClickItem={(clickedItem) =>
          toggleActiveTreeNode(
            clickedItem.level,
            clickedItem.index,
            clickedItem.label,
            clickedItem.key
          )
        }
        hasSearch={false}
        initialActiveKey={init}
        ref={treeMenuRef}
      />
    );
  };

  // function that updates the selected (blue) sections of dropdown that are selected on click
  const toggleActiveTreeNode = (nodeLevel, nodeIndex, nodeLabel, nodeKey) => {
    const currentNodeKey = `${nodeLevel}-${nodeIndex}`;
    const isActiveTreeNode = activeTreeNodes.has(currentNodeKey);
    var activeTreeNodesCopy = new Map(
      JSON.parse(JSON.stringify(Array.from(activeTreeNodes)))
    );
    var tempState = JSON.parse(JSON.stringify(chosenPaths));
    if (isActiveTreeNode) {
      activeTreeNodesCopy.delete(currentNodeKey);
      tempState = tempState.filter((e) => e !== nodeKey);
    } else {
      activeTreeNodesCopy.set(currentNodeKey, nodeLabel);
      tempState = [...tempState, nodeKey];
    }

    // This is a dirty workaround, because 3rd-party TreeMenu component doesn't seem to support multi selection.
    [[currentNodeKey], ...activeTreeNodesCopy].forEach(([key], iteration) => {
      const isCurrentNodeKey = iteration === 0;
      const [level, index] = key.split("-");
      const treeNodeLevelSelector = `.rstm-tree-item-level${level}`;
      const treeNodeDOM = categoriesTreeRef.current.querySelectorAll(
        treeNodeLevelSelector
      )[index];
      // "Force" DOM actions execution on elements controlled by React.
      requestAnimationFrame(() => {
        treeNodeDOM.classList.toggle(
          "rstm-tree-item--active",
          !isCurrentNodeKey
        );
        treeNodeDOM.setAttribute("aria-pressed", !isCurrentNodeKey);
      });
    });
    setActiveTreeNodes(activeTreeNodesCopy);
    setChosenPaths(tempState);
    handleChange("path", tempState, state, setState);
  };

  function clearPath(state, setState) {
    setState({ ...state, chosenPaths: null, dataPath: null, resetPath: true });
    setChosenPaths([]);
    var courseData = JSON.parse(
      localStorage.getItem(state.courseId + "-"+state.start.getTime()+"-filters")
    );
    courseData["dataPath"] = [];
    courseData["chosenPaths"] = [];
    writeToLocalStorage(state.courseId + "-"+state.start.getTime()+"-filters", courseData);
  }

  return (
    <Box width="100%">
        <>
          <div ref={categoriesTreeRef}>{getCategoriesTree()}</div>
          <Button
            secondary
            label="Clear Current Path"
            color="#0047BA"
            onClick={function() {clearPath(state, setState)}}
            margin={{ bottom: "small", horizontal: "large" }}
          />
        </>
      <Button
        primary
        label="Apply"
        color="#0047BA"
        margin={{ horizontal: "large" }}
        onClick={(event) => {
          filterClick(state, setState, "", queryVariables, chosenPaths, true);
        }}
      />
    </Box>
  );
}
