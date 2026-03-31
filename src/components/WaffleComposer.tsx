import { useState } from 'react'
import { WAFFLE_FLAVORS, type SendWaffleInput, type WaffleFlavor } from '../domain/waffles'

type WaffleComposerProps = {
  onSend: (input: SendWaffleInput) => Promise<void>
}

const INITIAL_FORM: SendWaffleInput = {
  senderName: '',
  recipientName: '',
  flavor: WAFFLE_FLAVORS[0],
  message: '',
}

export function WaffleComposer({ onSend }: WaffleComposerProps) {
  const [form, setForm] = useState(INITIAL_FORM)
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')

  const updateField = <Key extends keyof SendWaffleInput>(
    key: Key,
    value: SendWaffleInput[Key]
  ) => {
    setForm((current) => ({ ...current, [key]: value }))
    if (status !== 'idle') {
      setStatus('idle')
    }
  }

  const isDisabled =
    status === 'sending' ||
    !form.senderName.trim() ||
    !form.recipientName.trim() ||
    !form.message.trim()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus('sending')
    await onSend(form)
    setForm(INITIAL_FORM)
    setStatus('sent')
  }

  return (
    <section className="panel composer-panel" id="composer">
      <div className="panel-heading">
        <div>
          <p className="panel-kicker">Composer</p>
          <h2>Deliver a warm, crispy compliment</h2>
        </div>
        <p className="panel-copy">
          No auth, no ceremony, just names, a flavor, and one nice thing your
          coworker deserves to hear.
        </p>
      </div>

      <form className="composer-form" onSubmit={handleSubmit}>
        <label>
          <span>From</span>
          <input
            name="senderName"
            placeholder="Who is sending the waffle?"
            value={form.senderName}
            onChange={(event) => updateField('senderName', event.target.value)}
          />
        </label>

        <label>
          <span>To</span>
          <input
            name="recipientName"
            placeholder="Who earned this waffle?"
            value={form.recipientName}
            onChange={(event) => updateField('recipientName', event.target.value)}
          />
        </label>

        <label>
          <span>Flavor</span>
          <select
            name="flavor"
            value={form.flavor}
            onChange={(event) =>
              updateField('flavor', event.target.value as WaffleFlavor)
            }
          >
            {WAFFLE_FLAVORS.map((flavor) => (
              <option key={flavor} value={flavor}>
                {flavor}
              </option>
            ))}
          </select>
        </label>

        <label className="message-field">
          <span>Why this waffle?</span>
          <textarea
            name="message"
            placeholder="You saved our demo with that last-minute Figma polish pass..."
            rows={5}
            value={form.message}
            onChange={(event) => updateField('message', event.target.value)}
          />
        </label>

        <div className="composer-footer">
          <button className="button button-primary" disabled={isDisabled} type="submit">
            {status === 'sending' ? 'Sending...' : 'Send waffle'}
          </button>
          <p aria-live="polite" className="status-copy">
            {status === 'sent'
              ? 'Fresh waffle delivered to the feed.'
              : 'Prototype-first workflow: the repository seam stays tiny on purpose.'}
          </p>
        </div>
      </form>
    </section>
  )
}
