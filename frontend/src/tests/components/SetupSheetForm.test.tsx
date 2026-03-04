/**
 * Component tests for SetupSheetForm
 *
 * Verifies that:
 *  - The form renders with all required fields and action buttons.
 *  - Submitting without selecting a vehicle shows a validation error.
 *  - Selecting a vehicle and submitting calls setupService.createSetup.
 *  - A successful submission triggers the onSuccess callback.
 *  - Clicking Cancel triggers the onCancel callback.
 *  - API errors are displayed to the user.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SetupSheetForm from '../../components/SetupSheetForm';
import * as setupServiceModule from '../../services/setupService';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const vehicleOptions = [
  { id: 'v1', label: '#42 — Ford Mustang GT3 (2024)' },
  { id: 'v2', label: '#7 — Chevrolet Camaro Z/28 (2023)' },
];

function renderForm(overrides?: {
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const onSuccess = overrides?.onSuccess ?? vi.fn();
  const onCancel = overrides?.onCancel ?? vi.fn();
  render(
    <SetupSheetForm
      eventId="evt-1"
      vehicleOptions={vehicleOptions}
      onSuccess={onSuccess}
      onCancel={onCancel}
    />
  );
  return { onSuccess, onCancel };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('SetupSheetForm', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the form heading and action buttons', () => {
    renderForm();
    expect(screen.getByText('New Setup Sheet')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save setup sheet/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('renders vehicle options in the select dropdown', () => {
    renderForm();
    const select = screen.getByRole('combobox', { name: /vehicle/i });
    expect(select).toBeInTheDocument();
    expect(screen.getByText('#42 — Ford Mustang GT3 (2024)')).toBeInTheDocument();
    expect(screen.getByText('#7 — Chevrolet Camaro Z/28 (2023)')).toBeInTheDocument();
  });

  it('shows a validation error when submitting without selecting a vehicle', async () => {
    renderForm();
    // Use fireEvent.submit directly on the form to bypass HTML5 constraint validation
    // (jsdom 28 correctly blocks button-click submission when required fields are empty)
    const form = document.querySelector('form.setup-form')!;
    fireEvent.submit(form);
    expect(await screen.findByText(/please select a vehicle/i)).toBeInTheDocument();
  });

  it('calls createSetup and invokes onSuccess after a valid submission', async () => {
    const user = userEvent.setup();
    const createSetupSpy = vi
      .spyOn(setupServiceModule.setupService, 'createSetup')
      .mockResolvedValue(undefined as never);

    const { onSuccess } = renderForm();

    // Select a vehicle
    const vehicleSelect = screen.getByRole('combobox', { name: /vehicle/i });
    await user.selectOptions(vehicleSelect, 'v1');

    await user.click(screen.getByRole('button', { name: /save setup sheet/i }));

    await waitFor(() => {
      expect(createSetupSpy).toHaveBeenCalledOnce();
      expect(createSetupSpy.mock.calls[0][0]).toMatchObject({
        vehicleId: 'v1',
        eventId: 'evt-1',
        sessionType: 'Practice',
      });
    });

    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
  });

  it('displays an API error message when createSetup rejects', async () => {
    const user = userEvent.setup();
    vi.spyOn(setupServiceModule.setupService, 'createSetup').mockRejectedValue(
      new Error('Server error: 500')
    );

    renderForm();

    const vehicleSelect = screen.getByRole('combobox', { name: /vehicle/i });
    await user.selectOptions(vehicleSelect, 'v2');
    await user.click(screen.getByRole('button', { name: /save setup sheet/i }));

    expect(await screen.findByText(/server error: 500/i)).toBeInTheDocument();
  });

  it('calls onCancel when the Cancel button is clicked', async () => {
    const user = userEvent.setup();
    const { onCancel } = renderForm();
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('disables both buttons while submitting', async () => {
    const user = userEvent.setup();
    // Keep the promise pending to observe the submitting state
    vi.spyOn(setupServiceModule.setupService, 'createSetup').mockReturnValue(
      new Promise(() => {})
    );

    renderForm();
    const vehicleSelect = screen.getByRole('combobox', { name: /vehicle/i });
    await user.selectOptions(vehicleSelect, 'v1');
    await user.click(screen.getByRole('button', { name: /save setup sheet/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
    });
  });
});
