function SectionCard({ title, description, children }) {
  return (
    <section className="section-card">
      <div className="section-header">
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
      </div>

      <div className="section-content">
        {children}
      </div>
    </section>
  )
}

export default SectionCard