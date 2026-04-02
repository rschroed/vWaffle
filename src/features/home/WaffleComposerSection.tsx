import { useState, type FormEvent } from 'react'
import { WAFFLE_FLAVORS, type SendWaffleInput, type WaffleFlavor } from '../../domain/waffles'
import { Button } from '../../ui/Button'
import { Field } from '../../ui/Field'
import { Input } from '../../ui/Input'
import { Panel } from '../../ui/Panel'
import { SectionHeader } from '../../ui/SectionHeader'
import { Select } from '../../ui/Select'
import { Stack } from '../../ui/Stack'
import { Textarea } from '../../ui/Textarea'

type WaffleComposerSectionProps = {
  onDismiss?: () => void
  onSend: (input: SendWaffleInput) => Promise<void>
}

const INITIAL_FORM: SendWaffleInput = {
  senderName: '',
  recipientName: '',
  flavor: WAFFLE_FLAVORS[0],
  message: '',
}

export function WaffleComposerSection({
  onDismiss,
  onSend,
}: WaffleComposerSectionProps) {
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus('sending')

    try {
      await onSend(form)
      setForm(INITIAL_FORM)
      setStatus('sent')
    } catch {
      setStatus('idle')
    }
  }

  return (
    <section id="composer">
      <Panel as="section" className="feature-panel">
        <Stack gap="lg">
          <SectionHeader
            actions={
              onDismiss ? (
                <Button
                  aria-label="Close composer"
                  className="composer-dismiss"
                  onClick={onDismiss}
                >
                  Close
                </Button>
              ) : null
            }
            title="Send a waffle"
            description="Share a short note of appreciation with a teammate and add a little personality with a flavor."
          />

          <form className="feature-form" onSubmit={handleSubmit}>
            <Stack gap="md">
              <Field htmlFor="senderName" label="From">
                <Input
                  id="senderName"
                  name="senderName"
                  placeholder="Who is sending the waffle?"
                  value={form.senderName}
                  onChange={(event) => updateField('senderName', event.target.value)}
                />
              </Field>

              <Field htmlFor="recipientName" label="To">
                <Input
                  id="recipientName"
                  name="recipientName"
                  placeholder="Who is receiving the waffle?"
                  value={form.recipientName}
                  onChange={(event) =>
                    updateField('recipientName', event.target.value)
                  }
                />
              </Field>

              <Field htmlFor="flavor" label="Flavor">
                <Select
                  id="flavor"
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
                </Select>
              </Field>

              <Field htmlFor="message" label="Why this waffle?">
                <Textarea
                  id="message"
                  name="message"
                  placeholder="What did they do that deserves recognition?"
                  rows={6}
                  value={form.message}
                  onChange={(event) => updateField('message', event.target.value)}
                />
              </Field>
            </Stack>

            <div className="feature-form-footer">
              <Button disabled={isDisabled} type="submit" variant="primary">
                {status === 'sending' ? 'Sending...' : 'Send waffle'}
              </Button>
              <p aria-live="polite" className="feature-status">
                {status === 'sent'
                  ? 'Waffle sent to the team feed.'
                  : 'Recognition is shared publicly so appreciation stays visible.'}
              </p>
            </div>
          </form>
        </Stack>
      </Panel>
    </section>
  )
}
