// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03

export type createPlantMaintenanceDataOperation = {
  activity: string
  "start-constraint-date": string
  "start-constraint-time": string
  "finish-constraint-date": string
  "finish-constraint-time": string
  "actual-start-date": string
  "actual-start-time": string
  "actual-finish-date": string
  "actual-finish-time": string
  "control-key": string
  "standard-text-key": string
  "system-status": string
  "user-status": string
  "worker-and-supervisor": string
  "site-supervisor": string
  request: string
  requestee: string
  "create-timestamp": Date
  "update-timestamp": Date
}

export type createPlantMaintenanceData = {
  "order-id": string
  "short-text": string
  "order-type": string
  "plan-group": string
  "functional-location": string
  "system-status": string
  "plan-plant": string
  "user-status": string
  "basic-start-date": string
  "basic-finish-date": Date
  "revision-code": string
  "created-date": Date
  "updated-date": string
  "create-timestamp": Date
  "update-timestamp": Date
  operations: createPlantMaintenanceDataOperation[]
}

export type createPlantMaintenance = {
  type: string
  source: string
  timestamp: Date
  "content-type": string
  data: createPlantMaintenanceData[]
}
