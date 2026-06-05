export type ParticipantRolePayload = {
  isFacilitator?: boolean;
  isInitiator?: boolean;
};

export function participantIsFacilitator(
  participant: ParticipantRolePayload,
): boolean {
  return Boolean(participant.isFacilitator ?? participant.isInitiator);
}

export function normalizeParticipant<T extends ParticipantRolePayload>(
  participant: T,
): T & { isFacilitator: boolean } {
  return {
    ...participant,
    isFacilitator: participantIsFacilitator(participant),
  };
}
