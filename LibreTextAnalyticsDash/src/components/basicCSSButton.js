//using this button so that all buttons have square edges
//leave the buttons on the filters as is?
import "../css/index.css";

export default function BasicCSSButton({label, onClickFunction}) {

  return (
    <button className="button1 button2" onClick={onClickFunction} margin={{bottom: "large"}}>
      {label}
    </button>
  )
}
