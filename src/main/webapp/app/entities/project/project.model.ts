export interface IProject {
  id?: number;
  name?: string | null;
}

export class Project implements IProject {
  constructor(public id?: number, public name?: string | null) {}
}

export function getProjectIdentifier(project: IProject): number | undefined {
  return project.id;
}
