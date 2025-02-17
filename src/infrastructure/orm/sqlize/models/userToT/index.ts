// Initially copied from ToT-BE, commit 545c1dd02ed8df920e315645df162212e80b2a03
import { DataTypes } from "sequelize"
import { sequelize } from "../../index.js"
import { UserTotModel } from "./types.js"

const userTotAttributes = {
  user_id: {
    type: DataTypes.STRING(256),
    primaryKey: true,
    allowNull: false,
  },
  user_name: {
    type: DataTypes.STRING(256),
    primaryKey: true,
    allowNull: false,
  },
  plant_id: {
    type: DataTypes.STRING(80),
    allowNull: false,
  },
  asset_task_group_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  team_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  device_token: {
    type: DataTypes.STRING(256),
    allowNull: true,
  },
}

const userTotModel = sequelize.define<UserTotModel>("User_ToT", userTotAttributes, {
  tableName: "m_user_tot",
  timestamps: false,
})

export { userTotAttributes, userTotModel }
