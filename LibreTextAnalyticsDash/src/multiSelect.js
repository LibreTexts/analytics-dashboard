import React, { createRef, useState, useEffect } from "react";
import * as ReactDOM from 'react-dom';
import { Box, Button, Text } from "grommet";
import TreeMenu from "react-simple-tree-menu";
import {writeToLocalStorage} from "./helperFunctions.js";
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
  resetPath,
  queryVariables
}) {
  const [chosenPaths, setChosenPaths] = useState([]);
  const treeMenuRef = createRef();
  const categoriesTreeRef = createRef();
  const [activeTreeNodes, setActiveTreeNodes] = useState(new Map());

  function treeMap(initData) {
    var data = JSON.parse(JSON.stringify(initData));
    var i = Object.keys(data).length - 1;
    var allData = [];
    while (i > 1) {
      var arr = [];
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
      i = i - 1;
    }

    var x = allData.length - 1;
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

  const getCategoriesTree = () => {
    return (
      <TreeMenu
        data={treeMap(data)}
        onClickItem={(clickedItem) => toggleActiveTreeNode(clickedItem.level, clickedItem.index, clickedItem.label, clickedItem.key)}
        hasSearch={false}
        initialActiveKey={init}
        ref={treeMenuRef}
      />
    );
  }

  const toggleActiveTreeNode = (nodeLevel, nodeIndex, nodeLabel, nodeKey) => {
    const currentNodeKey = `${nodeLevel}-${nodeIndex}`;
    const isActiveTreeNode = activeTreeNodes.has(currentNodeKey);
    var activeTreeNodesCopy = new Map(JSON.parse(JSON.stringify(Array.from(activeTreeNodes))))
    // console.log(typeof activeTreeNodesCopy)
    // console.log(currentNodeKey, isActiveTreeNode)
    var tempState = JSON.parse(JSON.stringify(chosenPaths))
    if (isActiveTreeNode) {
      activeTreeNodesCopy.delete(currentNodeKey);
      tempState = tempState.filter(e => e != nodeKey)
    } else {
      // console.log("adding", currentNodeKey, nodeKey)
      activeTreeNodesCopy.set(currentNodeKey, nodeLabel);
      tempState = [...tempState, nodeKey]
    }

    // This is a dirty workaround, because 3rd-party TreeMenu component doesn't seem to support multi selection.
    [[currentNodeKey], ...activeTreeNodesCopy].forEach(([key], iteration) => {
      const isCurrentNodeKey = iteration === 0;
      const [level, index] = key.split("-");
      const treeNodeLevelSelector = `.rstm-tree-item-level${level}`;
      // console.log("key", key, activeTreeNodes[key])
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
    setChosenPaths(tempState)
    handleChange("path", tempState, state, setState)
  };


  // async function handleClick(event, state, setState) {
  //   //console.log(event.key)
  //   // setState({...state, disableCourseStructureButton: false})
  //   setChosenPath(event.key);
  //   //console.log(chosenPath)
  //   //filterClick(event)
  //   handleChange("path", event.key, state, setState);
  // }

  // <Box>
  function clearPath(state, setState) {
    setState({ ...state, chosenPaths: null, dataPath: null, resetPath: true })
    setChosenPaths([])
    var courseData = JSON.parse(localStorage.getItem(state.courseId+"-filters"))
    courseData["dataPath"] = [];
    courseData["chosenPaths"] = [];
    writeToLocalStorage(state.courseId+"-filters", courseData)
  }

  return (
    <Box width="100%">
      {!resetPath && (
        <>
          <div ref={categoriesTreeRef}>
            {getCategoriesTree()}
          </div>
          <Button
            secondary
            label="Clear Current Path"
            color="#0047BA"
            onClick={() => clearPath(state, setState)}
            margin={{ bottom: "small", horizontal: "large" }}
          />
        </>
      )}
      {/* <Box>
        <Box margin={{bottom: 'medium'}}>
          {chosenPaths.map((e)=> <>{e}</>)}
        </Box>
      </Box> */}
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
