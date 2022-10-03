import "../css/index.css";

//creates the tabs at the top of the page; handles tab switching
export default function Tabs({ state, setState }) {
  function activeTab(event, tab, state, setState) {
    event.preventDefault();
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

  return (
    <div className="bar blue">
      <button
        className={
          state.index === 3
            ? "bar-item button white"
            : "bar-item button filter-button"
        }
        onClick={(event) => activeTab(event, "filters", state, setState)}
        tabindex="0"
      >
        Filters
      </button>
      <button
        className={
          state.index === 0 ? "bar-item button white" : "bar-item button"
        }
        onClick={(event) => activeTab(event, "student", state, setState)}
        tabindex="0"
      >
        By Student
      </button>
      {state.ltCourse && (
        <button
          className={
            state.index === 1 ? "bar-item button white" : "bar-item button"
          }
          onClick={(event) => activeTab(event, "page", state, setState)}
          tabindex="0"
        >
          Textbook Engagement
        </button>
      )}
      {state.hasAdapt && (
        <button
          className={
            state.index === 2 ? "bar-item button white" : "bar-item button"
          }
          onClick={(event) => activeTab(event, "assignment", state, setState)}
          tabindex="0"
        >
          Homework Engagement
        </button>
      )}
    </div>
  );
}
