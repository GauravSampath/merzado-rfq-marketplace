import { useEffect, useState } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const emptyForm = {
  title: '',
  type: 'product',
  description: '',
  quantity: 1,
  location: '',
  deadline: '',
}

function BuyerDashboard() {
  const [rfqs, setRfqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingRfqId, setEditingRfqId] = useState(null)

  const [selectedRfq, setSelectedRfq] = useState(null)
  const [quotations, setQuotations] = useState([])
  const [quotationsLoading, setQuotationsLoading] = useState(false)
  const [quotationsError, setQuotationsError] = useState('')

  const [form, setForm] = useState(emptyForm)

  const getAuthConfig = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('merzadoToken')}`,
    },
  })

  const fetchMyRfqs = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await axios.get(
        `${API_URL}/rfqs/my`,
        getAuthConfig(),
      )
      setRfqs(response.data)
    } catch (err) {
      setError(
        err.response?.data?.message || 'Could not load your RFQs.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMyRfqs()
  }, [])

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  const resetForm = () => {
    setForm(emptyForm)
    setEditingRfqId(null)
    setShowForm(false)
  }

  const handleCreateOrUpdate = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    try {
      const payload = {
        ...form,
        quantity: Number(form.quantity),
        deadline: new Date(form.deadline).toISOString(),
      }

      if (editingRfqId) {
        await axios.put(
          `${API_URL}/rfqs/${editingRfqId}`,
          payload,
          getAuthConfig(),
        )
        setMessage('Your RFQ was updated successfully.')
      } else {
        await axios.post(
          `${API_URL}/rfqs`,
          payload,
          getAuthConfig(),
        )
        setMessage('Your RFQ was created successfully.')
      }

      resetForm()
      await fetchMyRfqs()
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `Could not ${editingRfqId ? 'update' : 'create'} the RFQ.`,
      )
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (rfq) => {
    setForm({
      title: rfq.title || '',
      type: rfq.type || 'product',
      description: rfq.description || '',
      quantity: rfq.quantity ?? 1,
      location: rfq.location || '',
      deadline: rfq.deadline
        ? new Date(rfq.deadline).toISOString().slice(0, 16)
        : '',
    })

    setEditingRfqId(rfq._id)
    setShowForm(true)
    setError('')
    setMessage('')
    setSelectedRfq(null)
  }

  const handleDelete = async (rfq) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${rfq.title}"? This action cannot be undone.`,
    )

    if (!confirmed) return

    setDeletingId(rfq._id)
    setError('')
    setMessage('')

    try {
      await axios.delete(
        `${API_URL}/rfqs/${rfq._id}`,
        getAuthConfig(),
      )

      setMessage('RFQ deleted successfully.')

      if (editingRfqId === rfq._id) {
        resetForm()
      }

      if (selectedRfq?._id === rfq._id) {
        setSelectedRfq(null)
        setQuotations([])
      }

      await fetchMyRfqs()
    } catch (err) {
      setError(
        err.response?.data?.message || 'Could not delete the RFQ.',
      )
    } finally {
      setDeletingId(null)
    }
  }

  const handleViewQuotations = async (rfq) => {
    setSelectedRfq(rfq)
    setQuotations([])
    setQuotationsError('')
    setQuotationsLoading(true)

    try {
      const response = await axios.get(
        `${API_URL}/quotations/rfq/${rfq._id}`,
        getAuthConfig(),
      )

      setQuotations(response.data)
    } catch (err) {
      setQuotationsError(
        err.response?.data?.message || 'Could not load quotations.',
      )
    } finally {
      setQuotationsLoading(false)
    }
  }

  const closeQuotations = () => {
    setSelectedRfq(null)
    setQuotations([])
    setQuotationsError('')
  }

  return (
    <section className="buyer-workspace">
      <div className="workspace-title">
        <div>
          <p className="eyebrow">BUYER WORKSPACE</p>
          <h2>Manage your RFQs</h2>
          <p className="workspace-description">
            Create sourcing requests and keep track of the requests you publish.
          </p>
        </div>

        <button
          className="button button-primary"
          type="button"
          onClick={() => {
            if (showForm) {
              resetForm()
            } else {
              setForm(emptyForm)
              setEditingRfqId(null)
              setShowForm(true)
            }
            setError('')
            setMessage('')
          }}
        >
          {showForm ? 'Cancel' : '+ Create RFQ'}
        </button>
      </div>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <form className="rfq-form" onSubmit={handleCreateOrUpdate}>
          <h3>
            {editingRfqId ? 'Edit your RFQ' : 'Create a request for quotation'}
          </h3>

          <label htmlFor="rfq-title">Request title</label>
          <input
            id="rfq-title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Bulk office chairs"
            required
            maxLength={120}
          />

          <label htmlFor="rfq-type">Request type</label>
          <select
            id="rfq-type"
            name="type"
            value={form.type}
            onChange={handleChange}
            required
          >
            <option value="product">Product</option>
            <option value="service">Service</option>
          </select>

          <label htmlFor="rfq-description">Description</label>
          <textarea
            id="rfq-description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe what you need, including any requirements."
            rows={4}
            required
            maxLength={2000}
          />

          <div className="rfq-form-row">
            <div>
              <label htmlFor="rfq-quantity">Quantity</label>
              <input
                id="rfq-quantity"
                name="quantity"
                type="number"
                min="1"
                value={form.quantity}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="rfq-location">Location</label>
              <input
                id="rfq-location"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="City, country"
                required
              />
            </div>
          </div>

          <label htmlFor="rfq-deadline">Quotation deadline</label>
          <input
            id="rfq-deadline"
            name="deadline"
            type="datetime-local"
            value={form.deadline}
            onChange={handleChange}
            min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
            required
          />

          <div className="rfq-form-row">
            <button
              className="button button-primary submit-button"
              type="submit"
              disabled={saving}
            >
              {saving
                ? editingRfqId
                  ? 'Saving changes...'
                  : 'Creating RFQ...'
                : editingRfqId
                  ? 'Save changes'
                  : 'Publish RFQ'}
            </button>

            {editingRfqId && (
              <button
                className="button button-outline"
                type="button"
                onClick={resetForm}
                disabled={saving}
              >
                Cancel editing
              </button>
            )}
          </div>
        </form>
      )}

      <div className="rfq-list-heading">
        <h3>Your requests</h3>
        <button
          className="button button-outline"
          type="button"
          onClick={fetchMyRfqs}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {loading ? (
        <p className="state-message">Loading your RFQs...</p>
      ) : rfqs.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">▤</span>
          <h3>No RFQs yet</h3>
          <p>
            Create your first request to start receiving quotations from suppliers.
          </p>
          <button
            className="button button-primary"
            type="button"
            onClick={() => {
              setForm(emptyForm)
              setEditingRfqId(null)
              setShowForm(true)
            }}
          >
            Create your first RFQ
          </button>
        </div>
      ) : (
        <div className="rfq-list">
          {rfqs.map((rfq) => (
            <article className="rfq-card" key={rfq._id}>
              <div className="rfq-card-top">
                <span className="rfq-type">{rfq.type}</span>
                <span
                  className={
                    rfq.status === 'open'
                      ? 'status-badge status-open'
                      : 'status-badge status-closed'
                  }
                >
                  {rfq.status}
                </span>
              </div>

              <h3>{rfq.title}</h3>
              <p className="rfq-description">{rfq.description}</p>

              <div className="rfq-details">
                <span>Quantity: {rfq.quantity}</span>
                <span>Location: {rfq.location}</span>
                <span>
                  Deadline: {new Date(rfq.deadline).toLocaleString()}
                </span>
              </div>

              <div className="rfq-form-row">
                <button
                  className="button button-outline"
                  type="button"
                  onClick={() => handleViewQuotations(rfq)}
                >
                  View quotations
                </button>

                <button
                  className="button button-primary"
                  type="button"
                  onClick={() => handleEdit(rfq)}
                >
                  Edit
                </button>

                <button
                  className="button button-outline"
                  type="button"
                  onClick={() => handleDelete(rfq)}
                  disabled={deletingId === rfq._id}
                >
                  {deletingId === rfq._id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {selectedRfq && (
        <div className="quotations-panel">
          <div className="rfq-list-heading">
            <div>
              <p className="eyebrow">QUOTATIONS RECEIVED</p>
              <h3>{selectedRfq.title}</h3>
            </div>

            <button
              className="button button-outline"
              type="button"
              onClick={closeQuotations}
            >
              Close
            </button>
          </div>

          {quotationsLoading ? (
            <p className="state-message">Loading quotations...</p>
          ) : quotationsError ? (
            <div className="error-message">{quotationsError}</div>
          ) : quotations.length === 0 ? (
            <div className="empty-state">
              <h3>No quotations received yet</h3>
              <p>Supplier quotations for this request will appear here.</p>
            </div>
          ) : (
            <div className="rfq-list">
              {quotations.map((quotation) => (
                <article className="rfq-card" key={quotation._id}>
                  <h3>
                    Supplier: {quotation.supplier?.name || 'Supplier'}
                  </h3>

                  {quotation.supplier?.email && (
                    <p>{quotation.supplier.email}</p>
                  )}

                  <div className="rfq-details">
                    <span>
                      Price: {Number(quotation.price).toLocaleString()}
                    </span>
                    <span>Delivery time: {quotation.deliveryTime}</span>
                  </div>

                  {quotation.notes && (
                    <p className="rfq-description">
                      Notes: {quotation.notes}
                    </p>
                  )}

                  {quotation.createdAt && (
                    <p className="state-message">
                      Submitted: {new Date(quotation.createdAt).toLocaleString()}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}

export default BuyerDashboard