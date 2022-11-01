import "../css/index.css";
import { useState } from "react";

//creates the tabs at the top of the page; handles tab switching
export default function Tabs({ state, setState }) {
  function activeTab(event, tab, state, setState) {
    //can't prevent default when using href
    //event.preventDefault();
    if (tab === "student") {
      setState({
        ...state,
        studentTab: true,
        pageTab: false,
        assignmentTab: false,
        filterTab: false,
        tab: "student",
        index: 0,
      });
    } else if (tab === "page") {
      setState({
        ...state,
        studentTab: false,
        pageTab: true,
        assignmentTab: false,
        filterTab: false,
        tab: "page",
        index: 1,
      });
    } else if (tab === "assignment") {
      setState({
        ...state,
        studentTab: false,
        pageTab: false,
        assignmentTab: true,
        filterTab: false,
        tab: "assignment",
        index: 2,
      });
    } else if (tab === "filters") {
      setState({
        ...state,
        studentTab: false,
        pageTab: false,
        assignmentTab: false,
        filterTab: true,
        tab: "filters",
        index: 3,
      });
    }
  }
  var id = "student-dropdown";
  if (state.tab === "filters") {
    id = "data-filters";
  } else if (state.tab === "page") {
    id = "table";
  } else if (state.tab === "assignment") {
    id = "adapt-dropdown";
  }

  const [linkId, setLinkId] = useState("0");
  function onEnter(event, tab) {
    if (event.key === "Enter") {
      //need a variable because ternary operators won't work otherwise
      var temp =
        tab === "student"
          ? setLinkId("student-dropdown")
          : tab === "page"
          ? setLinkId("table")
          : tab === "assignment"
          ? setLinkId("adapt-dropdown")
          : setLinkId("data-filters");
    } else {
      setLinkId("0");
    }
  }

  return (
    <div className="bar blue">
      <a
        href={`#${linkId}`}
        className={
          state.index === 3
            ? "bar-item button white"
            : "bar-item button filter-button"
        }
        onClick={(event) => activeTab(event, "filters", state, setState)}
        tabIndex="0"
        onKeyDown={(event) => onEnter(event, "filters")}
      >
        Filters
      </a>
      <a href={`#${id}`} className="skip-nav-link">
        Skip to Content
      </a>
      <a
        href={`#${linkId}`}
        className={
          state.index === 0 ? "bar-item button white" : "bar-item button"
        }
        onClick={(event) => activeTab(event, "student", state, setState)}
        tabIndex="0"
        onKeyDown={(event) => onEnter(event, "student")}
      >
        By Student
      </a>
      {state.ltCourse && (
        <a
          href={`#${linkId}`}
          className={
            state.index === 1 ? "bar-item button white" : "bar-item button"
          }
          onClick={(event) => activeTab(event, "page", state, setState)}
          tabIndex="0"
          onKeyDown={(event) => onEnter(event, "page")}
        >
          Textbook Engagement
        </a>
      )}
      {state.hasAdapt && (
        <a
          href={`#${linkId}`}
          className={
            state.index === 2 ? "bar-item button white" : "bar-item button"
          }
          onClick={(event) => activeTab(event, "assignment", state, setState)}
          tabIndex="0"
          onKeyDown={(event) => onEnter(event, "assignment")}
        >
          Homework Engagement
        </a>
      )}
    </div>
  );
}
