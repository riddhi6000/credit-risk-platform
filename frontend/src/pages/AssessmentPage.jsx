import { useState } from 'react'
import InputField from '../components/InputField'
import SectionCard from '../components/SectionCard'
import RiskResult from '../components/RiskResult'
import { assessRisk } from '../services/api'

const INITIAL_FORM_DATA = {
  RevolvingUtilizationOfUnsecuredLines: '',
  NumberOfTime30_59DaysPastDueNotWorse: '',
  DebtRatio: '',
  MonthlyIncome: '',
  NumberOfOpenCreditLinesAndLoans: '',
  NumberOfTimes90DaysLate: '',
  NumberRealEstateLoansOrLines: '',
  NumberOfTime60_89DaysPastDueNotWorse: '',
  NumberOfDependents: '',
}

const FINANCIAL_FIELDS = [
  {
    label: 'Monthly income',
    name: 'MonthlyIncome',
    placeholder: 'e.g. 5000',
    helperText: 'Monthly gross income',
    min: '0',
  },
  {
    label: 'Debt-to-income ratio',
    name: 'DebtRatio',
    placeholder: 'e.g. 0.30',
    helperText: 'Enter the value as a ratio, not a percentage',
    min: '0',
  },
  {
    label: 'Revolving credit utilization',
    name: 'RevolvingUtilizationOfUnsecuredLines',
    placeholder: 'e.g. 0.50',
    helperText: 'Share of revolving credit currently used',
    min: '0',
  },
  {
    label: 'Open credit lines & loans',
    name: 'NumberOfOpenCreditLinesAndLoans',
    placeholder: 'e.g. 5',
    helperText: 'Total number of open credit lines and loans',
    min: '0',
    step: '1',
  },
  {
    label: 'Real-estate loans or lines',
    name: 'NumberRealEstateLoansOrLines',
    placeholder: 'e.g. 1',
    helperText: 'Number of real-estate loans or lines',
    min: '0',
    step: '1',
  },
  {
    label: 'Number of dependents',
    name: 'NumberOfDependents',
    placeholder: 'e.g. 2',
    helperText: 'Number of dependents',
    min: '0',
    step: '1',
  },
]

const PAYMENT_HISTORY_FIELDS = [
  {
    label: '30–59 days past due',
    name: 'NumberOfTime30_59DaysPastDueNotWorse',
    placeholder: 'e.g. 0',
    helperText: 'Number of times',
    min: '0',
    step: '1',
  },
  {
    label: '60–89 days past due',
    name: 'NumberOfTime60_89DaysPastDueNotWorse',
    placeholder: 'e.g. 0',
    helperText: 'Number of times',
    min: '0',
    step: '1',
  },
  {
    label: '90+ days past due',
    name: 'NumberOfTimes90DaysLate',
    placeholder: 'e.g. 0',
    helperText: 'Number of times',
    min: '0',
    step: '1',
  },
]

function AssessmentPage() {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')
  const [result, setResult] = useState(null)

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }))

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: '',
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    Object.entries(formData).forEach(([name, value]) => {
      if (value === '') {
        newErrors[name] = 'This field is required.'
        return
      }

      const numericValue = Number(value)

      if (!Number.isFinite(numericValue)) {
        newErrors[name] = 'Enter a valid number.'
        return
      }

      if (numericValue < 0) {
        newErrors[name] = 'Value cannot be negative.'
      }
    })

    const integerFields = [
      'NumberOfTime30_59DaysPastDueNotWorse',
      'NumberOfOpenCreditLinesAndLoans',
      'NumberOfTimes90DaysLate',
      'NumberRealEstateLoansOrLines',
      'NumberOfTime60_89DaysPastDueNotWorse',
      'NumberOfDependents',
    ]

    integerFields.forEach((name) => {
      if (
        formData[name] !== '' &&
        !Number.isInteger(Number(formData[name]))
      ) {
        newErrors[name] = 'Enter a whole number.'
      }
    })

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const isValid = validateForm()

    if (!isValid) {
      return
    }

    setIsSubmitting(true)
    setApiError('')
    setResult(null)

    const payload = {
      RevolvingUtilizationOfUnsecuredLines:
        Number(formData.RevolvingUtilizationOfUnsecuredLines),

      NumberOfTime30_59DaysPastDueNotWorse:
        Number(formData.NumberOfTime30_59DaysPastDueNotWorse),

      DebtRatio: Number(formData.DebtRatio),

      MonthlyIncome:
        formData.MonthlyIncome === ''
          ? null
          : Number(formData.MonthlyIncome),

      NumberOfOpenCreditLinesAndLoans:
        Number(formData.NumberOfOpenCreditLinesAndLoans),

      NumberOfTimes90DaysLate:
        Number(formData.NumberOfTimes90DaysLate),

      NumberRealEstateLoansOrLines:
        Number(formData.NumberRealEstateLoansOrLines),

      NumberOfTime60_89DaysPastDueNotWorse:
        Number(formData.NumberOfTime60_89DaysPastDueNotWorse),

      NumberOfDependents:
        Number(formData.NumberOfDependents),
    }

    try {
      const data = await assessRisk(payload)

      setResult(data)
    } catch (error) {
      console.error('Assessment failed:', error)

      setApiError(
        'Unable to assess this application right now. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setFormData(INITIAL_FORM_DATA)
    setErrors({})
    setApiError('')
    setResult(null)
  }

  if (result) {
    return (
      <main id="assessment" className="assessment-page">
        <RiskResult
          result={result}
          onReset={handleReset}
        />
      </main>
    )
  }

  return (
    <main id="assessment" className="assessment-page">
      <section className="page-intro">
        <p className="eyebrow">CREDIT RISK ASSESSMENT</p>

        <h1>Assess an applicant</h1>

        <p className="page-description">
          Enter the applicant's financial and payment history to estimate
          their probability of serious credit default.
        </p>
      </section>

      <form className="assessment-form" onSubmit={handleSubmit}>
        <SectionCard
          title="Financial profile"
          description="Information about the applicant's income, debt, and credit profile."
        >
          <div className="input-grid">
            {FINANCIAL_FIELDS.map((field) => (
              <InputField
                key={field.name}
                {...field}
                value={formData[field.name]}
                onChange={handleChange}
                error={errors[field.name]}
              />
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Payment history"
          description="Information about previous delinquency behavior."
        >
          <div className="input-grid input-grid-three">
            {PAYMENT_HISTORY_FIELDS.map((field) => (
              <InputField
                key={field.name}
                {...field}
                value={formData[field.name]}
                onChange={handleChange}
                error={errors[field.name]}
              />
            ))}
          </div>
        </SectionCard>

        <div className="form-actions">
          <button
            type="submit"
            className="primary-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Assessing...' : 'Assess risk'}
            {!isSubmitting && <span aria-hidden="true">→</span>}
          </button>
        </div>

        {apiError && (
          <p className="api-error" role="alert">
            {apiError}
          </p>
        )}
      </form>
    </main>
  )
}

export default AssessmentPage