import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function SupplierDashboard() {
  const [rfqs, setRfqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  const [selectedRfq, setSelectedRfq] = useState(null)
  const [quotation, setQuotation] = useState({
    price: '',
    deliveryTime: '',
    notes: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [quotationError, setQuotationError] = useState('')
  const [quotationSuccess, setQuotationSuccess] = useState('')

  const [myQuotations, setMyQuotations] = useState([])
  const [myQuotationsLoading, setMyQuotationsLoading] = useState(true)
  const [myQuotationsError, setMyQuotationsError] = useState('')

  const getAuthConfig = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('merzadoToken')}`,
    },
  })

  const fetchRfqs = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await axios.get(
        `${API_URL}/rfqs`,
        getAuthConfig()
      )
      setRfqs(response.data)
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Could not load RFQs. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const fetchMyQuotations = async () => {
    setMyQuotationsLoading(true)
    setMyQuotationsError('')

    try {
      const response = await axios.get(
        `${API_URL}/quotations/my/submitted`,
        getAuthConfig()
      )
      setMyQuotations(response.data)
    } catch (err) {
      setMyQuotationsError(
        err.response?.data?.message ||
          'Could not load your submitted quotations.'
      )
    } finally {
      setMyQuotationsLoading(false)
    }
  }

  useEffect(() => {
    fetchRfqs()
    fetchMyQuotations()
  }, [])

  const filteredRfqs = useMemo(() => {
    const searchText = search.trim().toLowerCase()

    return rfqs.filter((rfq) => {
      const matchesSearch =
        !searchText ||
        rfq.title?.toLowerCase().includes(searchText) ||
        rfq.description?.toLowerCase().includes(searchText) ||
        rfq.location?.toLowerCase().includes(searchText)

      const matchesType =
        typeFilter === 'all' || rfq.type === typeFilter

      return matchesSearch && matchesType
    })
  }, [rfqs, search, typeFilter])

  const openQuotationForm = (rfq) => {
    setSelectedRfq(rfq)
    setQuotation({
      price: '',
      deliveryTime: '',
      notes: '',
    })
    setQuotationError('')
    setQuotationSuccess('')
  }

  const closeQuotationForm = () => {
    setSelectedRfq(null)
    setQuotationError('')
    setQuotationSuccess('')
  }

  const handleQuotationChange = (event) => {
    const { name, value } = event.target

    setQuotation((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleQuotationSubmit = async (event) => {
    event.preventDefault()
    setQuotationError('')
    setQuotationSuccess('')

    const price = Number(quotation.price)
    const deliveryTime = Number(quotation.deliveryTime)

    if (!quotation.price.trim() || !Number.isFinite(price) || price <= 0) {
      setQuotationError('Please enter a price greater than zero.')
      return
    }

    if (
      !quotation.deliveryTime.trim() ||
      !Number.isFinite(deliveryTime) ||
      deliveryTime <= 0
    ) {
      setQuotationError(
        'Please enter a delivery time greater than zero days.'
      )
      return
    }

    setSubmitting(true)

    try {
      await axios.post(
        `${API_URL}/quotations/${selectedRfq._id}`,
        {
          price,
          deliveryTime: `${deliveryTime} days`,
          notes: quotation.notes.trim(),
        },
        getAuthConfig()
      )

      setQuotationSuccess('Your quotation was submitted successfully!')
      setQuotation({
        price: '',
        deliveryTime: '',
        notes: '',
      })

      await fetchMyQuotations()
    } catch (err) {
      setQuotationError(
        err.response?.data?.message ||
          'Could not submit your quotation. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="buyer-workspace">
      <h2 className="workspace-title">Browse sourcing requests</h2>
      <p className="workspace-description">
        Discover open RFQs from buyers and find opportunities that match
        your products or services.
      </p>

      <div className="rfq-form">
        <label>
          Search RFQs
          <input
            type="text"
            placeholder="Search by title, description, or location"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>

        <label>
          Request type
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
          >
            <option value="all">All types</option>
            <option value="product">Products</option>
            <option value="service">Services</option>
          </select>
        </label>
      </div>

      <div className="rfq-list-heading">
        <h3>Open RFQs</h3>
        <button
          type="button"
          onClick={fetchRfqs}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {loading && <p className="state-message">Loading RFQs...</p>}

      {!loading && error && (
        <div className="state-message">
          <p>{error}</p>
          <button type="button" onClick={fetchRfqs}>
            Try again
          </button>
        </div>
      )}

      {!loading && !error && filteredRfqs.length === 0 && (
        <div className="empty-state">
          <h4>No matching RFQs found</h4>
          <p>
            Try a different search or request type, or check again later
            for new sourcing requests.
          </p>
        </div>
      )}

      {!loading && !error && filteredRfqs.length > 0 && (
        <div className="rfq-list">
          {filteredRfqs.map((rfq) => (
            <article className="rfq-card" key={rfq._id}>
              <div className="rfq-card-top">
                <span className="rfq-type">
                  {rfq.type === 'product' ? 'Product' : 'Service'}
                </span>
                <span className="status-badge status-open">
                  {rfq.status}
                </span>
              </div>

              <h4>{rfq.title}</h4>
              <p className="rfq-description">{rfq.description}</p>

              <div className="rfq-details">
                <p>
                  <strong>Buyer:</strong> {rfq.buyer?.name || 'Buyer'}
                </p>
                <p>
                  <strong>Quantity:</strong> {rfq.quantity}
                </p>
                <p>
                  <strong>Location:</strong> {rfq.location}
                </p>
                <p>
                  <strong>Quotation deadline:</strong>{' '}
                  {rfq.deadline
                    ? new Date(rfq.deadline).toLocaleString()
                    : 'Not specified'}
                </p>
              </div>

              <button
                type="button"
                className="primary-button"
                style={{ marginTop: '12px' }}
                onClick={() => openQuotationForm(rfq)}
              >
                Submit quotation
              </button>
            </article>
          ))}
        </div>
      )}

      {selectedRfq && (
        <div className="rfq-form">
          <h3>Submit a quotation</h3>
          <p>
            RFQ: <strong>{selectedRfq.title}</strong>
          </p>

          {quotationError && (
            <p className="error-message" role="alert">
              {quotationError}
            </p>
          )}

          {quotationSuccess && (
            <p className="success-message" role="status">
              {quotationSuccess}
            </p>
          )}

          <form onSubmit={handleQuotationSubmit}>
            <label>
              Quotation price
              <input
                type="number"
                name="price"
                min="0.01"
                step="0.01"
                placeholder="Enter your total price"
                value={quotation.price}
                onChange={handleQuotationChange}
                required
              />
            </label>

            <label>
              Delivery time (days)
              <input
                type="number"
                name="deliveryTime"
                min="1"
                step="1"
                placeholder="Enter number of days, e.g. 10"
                value={quotation.deliveryTime}
                onChange={handleQuotationChange}
                required
              />
            </label>

            <label>
              Notes
              <textarea
                name="notes"
                placeholder="Add any details about your offer (optional)"
                value={quotation.notes}
                onChange={handleQuotationChange}
                rows="4"
              />
            </label>

            <div className="rfq-form-row">
              <button
                type="submit"
                className="primary-button"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Send quotation'}
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={closeQuotationForm}
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="rfq-list-heading">
        <h3>My Submitted Quotations</h3>
        <button
          type="button"
          onClick={fetchMyQuotations}
          disabled={myQuotationsLoading}
        >
          {myQuotationsLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {myQuotationsLoading ? (
        <p className="state-message">Loading your quotations...</p>
      ) : myQuotationsError ? (
        <div className="state-message">
          <p>{myQuotationsError}</p>
          <button type="button" onClick={fetchMyQuotations}>
            Try again
          </button>
        </div>
      ) : myQuotations.length === 0 ? (
        <div className="empty-state">
          <h4>You haven't submitted any quotations yet</h4>
          <p>
            When you submit a quotation for an RFQ, it will appear here.
          </p>
        </div>
      ) : (
        <div className="rfq-list">
          {myQuotations.map((item) => {
            const rfq = item.rfq || item.rfqId

            return (
              <article className="rfq-card" key={item._id}>
                <div className="rfq-card-top">
                  <span className="rfq-type">Submitted quotation</span>
                  {rfq?.status && (
                    <span
                      className={
                        rfq.status === 'open'
                          ? 'status-badge status-open'
                          : 'status-badge status-closed'
                      }
                    >
                      RFQ {rfq.status}
                    </span>
                  )}
                </div>

                <h4>{rfq?.title || 'RFQ details unavailable'}</h4>

                {rfq?.description && (
                  <p className="rfq-description">{rfq.description}</p>
                )}

                <div className="rfq-details">
                  <p>
                    <strong>Your price:</strong>{' '}
                    {Number(item.price).toLocaleString()}
                  </p>
                  <p>
                    <strong>Delivery time:</strong> {item.deliveryTime}
                  </p>

                  {rfq?.quantity !== undefined && (
                    <p>
                      <strong>Quantity requested:</strong> {rfq.quantity}
                    </p>
                  )}

                  {rfq?.location && (
                    <p>
                      <strong>Location:</strong> {rfq.location}
                    </p>
                  )}

                  {item.createdAt && (
                    <p>
                      <strong>Submitted:</strong>{' '}
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  )}
                </div>

                {item.notes && (
                  <p className="rfq-description">
                    <strong>Notes:</strong> {item.notes}
                  </p>
                )}
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default SupplierDashboard