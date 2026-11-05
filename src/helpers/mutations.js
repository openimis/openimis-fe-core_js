// Mirrors MutationLog.STATUS_CHOICES in openimis-be-core_py
// (core/models/base_mutation.py): a mutation is RECEIVED until the worker has
// run it, then ERROR or SUCCESS.
export const MUTATION_RECEIVED = 0;
export const MUTATION_ERROR = 1;
export const MUTATION_SUCCESS = 2;

/**
 * Status of a mutation in the journal, or `undefined` when it is unknown.
 *
 * `mutations` is `state.core.mutations`: the journal keeps every entry it has
 * seen keyed by clientMutationId and polls the pending ones to a terminal
 * status, so this is the one place that knows whether a mutation has landed.
 */
export function mutationStatus(mutations, clientMutationId) {
  if (!clientMutationId || !mutations?.length) return undefined;
  return mutations.find((m) => m.clientMutationId === clientMutationId)?.status;
}

/**
 * True while the mutation that stamped this row is still in flight.
 *
 * The link between a row and its mutation is the clientMutationId the row
 * carries: a module stamps it when it submits the mutation, and the journal
 * holds the status for that same id. No separate row identifier is needed.
 */
export function isRowMutationPending(mutations, row) {
  const id = row?.clientMutationId;
  if (!id) return false;
  // Unknown means the journal has not caught up yet - the entry is added when
  // the request is dispatched, so treat an unknown id as still pending rather
  // than briefly flashing the row back to normal.
  const status = mutationStatus(mutations, id);
  return status === undefined || status === MUTATION_RECEIVED;
}
