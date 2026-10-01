function InputField({
  label,
  name,
  value,
  onChange,
  type = 'number',
  placeholder,
  helperText,
  min,
  max,
  step = 'any',
  error,
}) {
  return (
    <div className="input-field">
      <label htmlFor={name}>{label}</label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
      />

      {error ? (
        <p id={`${name}-error`} className="input-error">
          {error}
        </p>
      ) : (
        helperText && <p className="input-helper">{helperText}</p>
      )}
    </div>
  )
}

export default InputField