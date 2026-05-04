import TextField from '@mui/material/TextField';

const InputField = ({ labelText, stateValue, setStateValue, fieldId, setFeedbackMessage }) => {
  return (
    <div className="input-field">
      <label htmlFor={fieldId}>{labelText}</label>
      <TextField size="small" id={fieldId} label={"Begin typing"} variant="outlined" value={stateValue}
        onChange={(e) => setStateValue(e.target.value)}
        onFocus={() => setFeedbackMessage('')}
      />
      {/* <input id={fieldId} type="text" value={stateValue} /> */}
    </div>
  )
}

export default InputField;