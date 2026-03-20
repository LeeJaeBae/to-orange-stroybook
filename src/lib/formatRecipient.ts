/**
 * 받는사람 표기 포맷
 * - 시설 수용자: "이름 - 시설주소/시설명 - 수번"
 * - 일반인: "이름"
 */
export function formatRecipientDisplay(
  name: string | undefined | null,
  facility?: string | null,
  prisonerNumber?: string | null,
  facilityAddress?: string | null,
): string {
  if (!name) return '선택되지 않음';
  const parts = [name];
  const facilityLabel = facilityAddress || facility;
  if (facilityLabel) parts.push(facilityLabel);
  if (prisonerNumber) parts.push(prisonerNumber);
  return parts.join(' - ');
}
