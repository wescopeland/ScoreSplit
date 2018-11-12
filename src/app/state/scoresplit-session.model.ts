export type ScoresplitSession = {
  isEditingLayout: boolean;
};

export function createSession(isEditingLayout = false): Partial<ScoresplitSession> {
  return { isEditingLayout };
}
