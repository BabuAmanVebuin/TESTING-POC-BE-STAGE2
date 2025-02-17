// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import { Model } from "sequelize"

export interface UserTotInstance {
  user_id: string
  plant_id: string
  user_name: string
  asset_task_group_id: number
  team_id: number
  device_token?: string
}

export type UserTotModel = Model<UserTotInstance>
