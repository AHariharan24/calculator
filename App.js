import React from "react";
import { useReducer } from "react";
import DigitButton from "./DigitButton";
import OperationButton from "./OperationButton";
import "./styles.css";

export const ACTIONS = {
  ADD_DIGIT: 'add-digit', //Add digits
  CHOOSE_OPERATION: 'choose', //Choose an operation
  CLEAR: 'clear', //Clear all operations (Reset)
  DELETE_DIGIT: 'delete-digit', //Delete a digit when typing
  EVALUATE: 'evaluate' //Evaluate the result of calculation
}; //All the possible actions that can be done with the calculator 

function reducer(state, {type, payload}){
  switch(type) { //conditional structure to tell us what code to run when each action occurs
    case ACTIONS.ADD_DIGIT:
      if (state.overwrite){ //To prevent final answers getting overwritten
        return {
          ...state, 
          currentOperand: payload.digit, //replace operand with digit
          overwrite: false, 
        }
      }
      if (payload.digit === "0" && state.currentOperand === "0"){
        return state; //Account for edge cases - return current state (won't let you add more zeros after first zero)
      }
      if (payload.digit === "." && state.currentOperand.includes(".")){
        return state; //Account for edge cases - won't allow for more than one decimal place
      }
      return { //New State object is returned
        ...state, //Every other part of the state object
        currentOperand: `${state.currentOperand || ""}${payload.digit}`, //String manipulation to add the payload digit to the operand string
      }
    case ACTIONS.CLEAR:
      return {}; //Empty state is returned since the clear button wipes everything out
    case ACTIONS.CHOOSE_OPERATION:
      if (state.currentOperand == null && state.previousOperand == null){
        return state; 
      }
      if(state.previousOperand == null){ //if there is nothing as our previous operand yet (on top)
        return {
          ...state, 
          operation: payload.operation, 
          previousOperand: state.currentOperand, 
          currentOperand: null, 
        }
      }
      if (state.currentOperand == null){ //allows you to update operation, in case of a misclick
        return {
          ...state, 
          operation: payload.operation
        }
      }
      return {
        ...state,
        previousOperand: evaluate(state), //Returns an evaluated value before displaying new operand below
        operation: payload.operation, 
        currentOperand: null 
      }
      case ACTIONS.EVALUATE:
        if(state.operation == null || state.currentOperand == null || state.previousOperand == null){
          return state; //Do nothing at all, nothing can be done in this case for evaluation
        } //if we don't have necessary information/values in order to evaluate

        return { //actual evaluation
          ...state, 
          overwrite: true, //variable with which condition is to be used in ADD_DIGITS action to ensure final answer does not get overwritten, that is, no additional values are added to string representing answer
          previousOperand: null, 
          operation: null, 
          currentOperand: evaluate(state)
        }
      case ACTIONS.DELETE_DIGIT:
        if (state.overwrite){
          return {...state, currentOperand: null, overwrite: false}; 
        }   
        if (state.currentOperand == null){ //If we don't have a current operand, then there's nothing for us to delete
          return state; //No changes need to be made   
        }
        if(state.currentOperand.length === 1){
          return {...state, currentOperand: null};  //Deleting the last digit should reset the value of the currentOperand to a null - there is no value left
        }
        return { //Default Case
          ...state, 
          currentOperand: state.currentOperand.slice(0, -1) //This is used to get rid of the first digit
        }
  }
}

function evaluate({currentOperand, previousOperand, operation}){
  const prev = parseFloat(previousOperand); 
  const current = parseFloat(currentOperand); 
  if (isNaN(prev) || isNaN(current)){
    return ""; //Return an empty string if the two values are not actual numbers
  }
  let computation = ""; 
  switch (operation){
    case "+":
      computation = prev + current; 
      break;
    case "-":
      computation = prev - current; 
      break; 
    case "*":
      computation = prev * current; 
      break; 
    case "÷":
      computation = prev/current;
      break;  
  }
  return computation.toString(); 
}

const INTEGER_FORMATTER = new Intl.NumberFormat('en-us', {
  maximumFractionDigits: 0, //to separate decimal portion from integer portion (we only want to format the integer portion)
}) //For making large numbers appear to be more neater

function formatOperand(operand) {
  if (operand == null) return
  const [integer, decimal] = operand.split('.');
  if (decimal == null){
    return INTEGER_FORMATTER.format(integer);
  }
  return `${INTEGER_FORMATTER.format(integer)}.${decimal}`; 
}

function App() {
  const [{currentOperand, previousOperand, operation}, dispatch] = useReducer(reducer, {})
  return (
    <div className = "calculator-grid">
      <div className = "output">
        <div className = "previous-operand">{formatOperand(previousOperand)} {operation}</div>
        <div className = "current-operand">{formatOperand(currentOperand)}</div>
      </div>
      <button className="span-two" onClick={() => dispatch({type: ACTIONS.CLEAR})}>AC</button>
      <button onClick={() => dispatch({type: ACTIONS.DELETE_DIGIT})}>DEL</button>
      <OperationButton operation="÷" dispatch={dispatch} />
      <DigitButton digit="1" dispatch={dispatch}/>
      <DigitButton digit="2" dispatch={dispatch}/>
      <DigitButton digit="3" dispatch={dispatch}/>
      <OperationButton operation="*" dispatch={dispatch} />
      <DigitButton digit="4" dispatch={dispatch}/>
      <DigitButton digit="5" dispatch={dispatch}/>
      <DigitButton digit="6" dispatch={dispatch}/>
      <OperationButton operation="+" dispatch={dispatch} />
      <DigitButton digit="7" dispatch={dispatch}/>
      <DigitButton digit="8" dispatch={dispatch}/>
      <DigitButton digit="9" dispatch={dispatch}/>
      <OperationButton operation="-" dispatch={dispatch} />
      <DigitButton digit="." dispatch={dispatch}/>
      <DigitButton digit="0" dispatch={dispatch}/>
      <button className="span-two" onClick={() => dispatch({type: ACTIONS.EVALUATE})}>=</button>
    </div>
  ) 
}

export default App;
