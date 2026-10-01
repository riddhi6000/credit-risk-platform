function Methodology() {
  return (
    <main className="methodology-page">
      <section className="methodology-intro">
        <p className="eyebrow">MODEL METHODOLOGY</p>

        <h1>How the assessment works</h1>

        <p>
          This assessment uses a machine-learning model trained on historical
          credit-risk data to estimate the probability of serious credit
          default.
        </p>
      </section>

      <section className="methodology-section">
        <div className="methodology-section-header">
          <h2>Model overview</h2>
          <p>
            The assessment is built around a gradient-boosted decision-tree
            model and evaluated using a fixed held-out test set.
          </p>
        </div>

        <div className="methodology-overview-grid">
          <div className="methodology-overview-item">
            <span>Model</span>
            <strong>HistGradientBoostingClassifier</strong>
          </div>

          <div className="methodology-overview-item">
            <span>Training approach</span>
            <strong>
              Gradient-boosted decision tree selected and tuned using
              stratified cross-validation
            </strong>
          </div>

          <div className="methodology-overview-item">
            <span>Training data</span>
            <strong>Give Me Some Credit</strong>
          </div>

          <div className="methodology-overview-item">
            <span>Prediction target</span>
            <strong>Serious delinquency within two years</strong>
          </div>

          <div className="methodology-overview-item">
            <span>Model features</span>
            <strong>9 applicant features</strong>
          </div>

          <div className="methodology-overview-item">
            <span>Audit attribute</span>
            <strong>Age evaluated separately for fairness analysis</strong>
          </div>
        </div>

        <div className="methodology-note">
          Age is retained separately for post-hoc fairness analysis rather
          than being used as a prediction feature.
        </div>
      </section>

      <section className="methodology-section">
        <div className="methodology-section-header">
          <h2>Model features</h2>
          <p>
            These applicant-level variables are supplied to the prediction
            model.
          </p>
        </div>

        <ul className="methodology-feature-list">
          <li>Revolving credit utilization</li>
          <li>30–59 day delinquency history</li>
          <li>Debt ratio</li>
          <li>Monthly income</li>
          <li>Open credit lines and loans</li>
          <li>90+ day delinquency history</li>
          <li>Real-estate loans or lines</li>
          <li>60–89 day delinquency history</li>
          <li>Number of dependents</li>
        </ul>
      </section>

      <section className="methodology-section">
        <div className="methodology-section-header">
          <h2>Performance on held-out test data</h2>
          <p>
            These metrics were calculated once on the held-out test set after
            model selection.
          </p>
        </div>

        <div className="methodology-metrics">
          <div className="methodology-metric">
            <div className="methodology-metric-label">ROC-AUC</div>
            <div className="methodology-metric-value">0.864</div>
          </div>

          <div className="methodology-metric">
            <div className="methodology-metric-label">PR-AUC</div>
            <div className="methodology-metric-value">0.404</div>
          </div>

          <div className="methodology-metric">
            <div className="methodology-metric-label">Brier score</div>
            <div className="methodology-metric-value">0.049</div>
          </div>

          <div className="methodology-metric">
            <div className="methodology-metric-label">Gini</div>
            <div className="methodology-metric-value">0.729</div>
          </div>

          <div className="methodology-metric">
            <div className="methodology-metric-label">KS statistic</div>
            <div className="methodology-metric-value">0.575</div>
          </div>
        </div>
      </section>

      <section className="methodology-section">
        <div className="methodology-section-header">
          <p className="eyebrow">DECISION THRESHOLD</p>
          <h2>Illustrative operating point</h2>
        </div>

        <div className="methodology-threshold">
          <div className="methodology-threshold-value">17%</div>

          <div className="methodology-threshold-copy">
            <p>
              The configured threshold was selected using out-of-fold
              expected-cost analysis under a 5:1 false-negative to
              false-positive cost scenario.
            </p>
          </div>
        </div>

        <div className="methodology-note">
          This is a documented decision scenario, not a universally optimal
          lending threshold. The threshold is intended to demonstrate how a
          decision operating point can be selected based on explicit cost
          assumptions.
        </div>
      </section>

      <section className="methodology-section">
        <div className="methodology-section-header">
          <p className="eyebrow">EXPLAINABILITY</p>
          <h2>SHAP-based explanations</h2>
          <p>
            SHAP values are used to identify features with the strongest
            positive contribution to an individual prediction.
          </p>
        </div>

        <div className="methodology-note">
          The assessment interface presents these model-derived factors as
          applicant-level explanation signals. They describe the model's
          contribution for a prediction and should not be interpreted as
          causal explanations.
        </div>
      </section>

      <section className="methodology-section">
        <div className="methodology-section-header">
          <p className="eyebrow">FAIRNESS AUDIT</p>
          <h2>Age is evaluated separately</h2>
          <p>
            Age is excluded from the model's prediction features and retained
            as an audit attribute.
          </p>
        </div>

        <div className="methodology-note">
          Group-level approval-rate and true-positive-rate disparities are
          evaluated after prediction to identify differences across age
          groups. The audit reports observed disparities rather than treating
          a single fairness metric as proof that the model is universally
          fair.
        </div>
      </section>

      <p className="methodology-footer-note">
        Model performance and fairness measurements describe this trained
        model and evaluation dataset. They should not be interpreted as
        guarantees of performance on future applicants or different
        populations.
      </p>
    </main>
  )
}

export default Methodology