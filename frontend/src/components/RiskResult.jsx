function RiskResult({ result, onReset }) {
  const probability = result.default_probability * 100
  const threshold = result.threshold * 100

  const isAboveThreshold = result.predicted_default === 1

  return (
    <section className="risk-result">
      <div className="risk-result-header">
        <div>
          <p className="eyebrow">ASSESSMENT RESULT</p>
          <h2>Estimated default risk</h2>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={onReset}
        >
          New assessment
        </button>
      </div>

      <div className="risk-summary">
        <div className="risk-probability">
          <span className="risk-probability-value">
            {probability.toFixed(1)}%
          </span>

          <span className="risk-probability-label">
            estimated probability of serious default
          </span>
        </div>

        <div
          className={`risk-status ${
            isAboveThreshold ? 'risk-status-high' : 'risk-status-low'
          }`}
        >
          <span className="risk-status-dot" />

          <div>
            <strong>
              {isAboveThreshold
                ? 'Above configured threshold'
                : 'Below configured threshold'}
            </strong>

            <p>
              Decision threshold: {threshold.toFixed(0)}%
            </p>
          </div>
        </div>
      </div>

      <div className="risk-reasons">
        <div className="risk-reasons-header">
          <h3>Key factors influencing this assessment</h3>

          <p>
            These are the strongest factors that increased the model's
            predicted risk for this applicant.
          </p>
        </div>

        <div className="reason-list">
        {result.reasons.map((reason, index) => (
            <div className="reason-card" key={reason.feature}>
            <div className="reason-number">
                {index + 1}
            </div>

            <div className="reason-content">
                <strong>{reason.label}</strong>

                <p>
                {index === 0
                    ? 'Strongest factor increasing the predicted risk.'
                    : index === 1
                    ? 'Also increased the predicted risk.'
                    : 'Had a smaller positive contribution to the predicted risk.'}
                </p>
            </div>
            </div>
        ))}
        </div>
      </div>

      <p className="result-disclaimer">
        This assessment is a model-based estimate and should not be treated
        as a standalone lending decision.
      </p>
    </section>
  )
}

export default RiskResult