// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03

export type TaskType = {
  "task-type-id": number
  "task-category-id": number
  "task-type-name": string
  "task-category-name": string
  "task-execution-time": string
}

export type TaskPriority = {
  "task-priority-id": number
  "task-priority-name": string
  rank: number
}

export type EventType = {
  "eveet-type-id": number
  "event-type-name": string
  "operation-id": number
  "operation-name": string
}

export type TaskStatus = {
  "task-status-id": number
  "task-status-name": string
}

export type getTaskMastersResponse = {
  "task-type": TaskType[]
  "task-priority": TaskPriority[]
  "event-type": EventType[]
  "task-status": TaskStatus[]
}

export type getTaskMastersAPIResponse = {
  code: number
  body: getTaskMastersResponse | string
}
